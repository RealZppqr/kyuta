import type { CommandInteraction } from "eris"
import type { BotEvent } from "../types/index.js"
import { redis } from "../utils/redis.js"
import { Logger } from "../utils/logger.js"

export const event: BotEvent = {
  name: "interactionCreate",
  async execute(client, interaction: CommandInteraction) {
    if (interaction.type !== 2) return // APPLICATION_COMMAND

    // Get command handler from client
    const commandHandler = (client as any).commandHandler
    if (!commandHandler) return

    const command = commandHandler.slashCommands.get(interaction.data.name)
    if (!command) return

    try {
      // Check cooldown
      const cooldownTime = await redis.getCooldown(interaction.user.id, command.name)
      if (cooldownTime > 0) {
        await interaction.createResponse(4, {
          data: {
            content: `⏰ Please wait ${cooldownTime} seconds before using this command again.`,
            flags: 64, // Ephemeral
          },
        })
        return
      }

      // Check permissions
      if (command.permissions && interaction.member) {
        const hasPermission = command.permissions.some((perm) => interaction.member!.permissions.has(perm))

        if (!hasPermission) {
          await interaction.createResponse(4, {
            data: {
              content: "❌ You don't have permission to use this command.",
              flags: 64, // Ephemeral
            },
          })
          return
        }
      }

      // Execute command
      await command.execute(client, interaction)

      // Set cooldown
      if (command.cooldown) {
        await redis.setCooldown(interaction.user.id, command.name, command.cooldown)
      }
    } catch (error) {
      Logger.error(`Error executing slash command ${command.name}`, error as Error)

      const errorResponse = {
        content: "❌ An error occurred while executing this command.",
        flags: 64, // Ephemeral
      }

      if (interaction.acknowledged) {
        await interaction.editOriginalMessage(errorResponse)
      } else {
        await interaction.createResponse(4, { data: errorResponse })
      }
    }
  },
}
