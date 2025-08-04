import type { BotEvent } from "../types/index.js"
import { Logger } from "../utils/logger.js"

export const event: BotEvent = {
  name: "ready",
  once: true,
  async execute(client) {
    Logger.success(`Bot is ready! Logged in as ${client.user.username}#${client.user.discriminator}`)
    Logger.info(`Serving ${client.guilds.size} guilds with ${client.users.size} users`)

    // Set bot status
    client.editStatus("online", {
      name: "Discord servers | !help",
      type: 3, // Watching
    })
  },
}
