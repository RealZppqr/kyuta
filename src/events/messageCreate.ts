import type { Message } from "eris"
import type { BotEvent } from "../types/index.js"
import { botConfig } from "../config/config.js"
import { redis } from "../utils/redis.js"
import { mongodb } from "../utils/mongo.js"
import { Logger } from "../utils/logger.js"

export const event: BotEvent = {
  name: "messageCreate",
  async execute(client, message: Message) {
    // Ignore bots and DMs
    if (message.author.bot || !message.guildID) return

    // Get guild prefix (cached in Redis)
    let prefix = await redis.getGuildPrefix(message.guildID)
    if (!prefix) {
      const guildConfig = await mongodb.getGuildConfig(message.guildID)
      prefix = guildConfig?.prefix || botConfig.prefix
      await redis.setGuildPrefix(message.guildID, prefix)
    }

    // Check if message starts with prefix
    if (!message.content.startsWith(prefix)) return

    const args = message.content.slice(prefix.length).trim().split(/ +/)
    const commandName = args.shift()?.toLowerCase()
    if (!commandName) return

    // Get command handler from client
    const commandHandler = (client as any).commandHandler
    if (!commandHandler) return

    // Find command
    const command =
      commandHandler.commands.get(commandName) || commandHandler.commands.get(commandHandler.aliases.get(commandName))

    if (!command) return

    try {
      // Check cooldown
      const cooldownTime = await redis.getCooldown(message.author.id, command.name)
      if (cooldownTime > 0) {
        await message.channel.createMessage(`⏰ Please wait ${cooldownTime} seconds before using this command again.`)
        return
      }

      // Check permissions
      if (command.permissions && message.member) {
        const hasPermission = command.permissions.some((perm) => message.member!.permissions.has(perm))

        if (!hasPermission) {
          await message.channel.createMessage("❌ You don't have permission to use this command.")
          return
        }
      }

      // Execute command
      await command.execute(client, message, args)

      // Set cooldown
      if (command.cooldown) {
        await redis.setCooldown(message.author.id, command.name, command.cooldown)
      }
    } catch (error) {
      Logger.error(`Error executing command ${command.name}`, error as Error)
      await message.channel.createMessage("❌ An error occurred while executing this command.")
    }
  },
}
