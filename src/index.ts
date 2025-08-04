import { Client } from "eris"
import { botConfig } from "./config/config.js"
import { CommandHandler } from "./handlers/commandHandler.js"
import { EventHandler } from "./handlers/eventHandler.js"
import { mongodb } from "./utils/mongo.js"
import { redis } from "./utils/redis.js"
import { Logger } from "./utils/logger.js"

class DiscordBot {
  private client: Client
  private commandHandler: CommandHandler
  private eventHandler: EventHandler

  constructor() {
    // Initialize Eris client with intents
    this.client = new Client(botConfig.token, {
      intents: ["guilds", "guildMessages", "guildMembers", "messageContent"],
      maxShards: botConfig.shardCount,
      getAllUsers: false,
      restMode: true,
    })

    this.commandHandler = new CommandHandler()
    this.eventHandler = new EventHandler()

    // Attach command handler to client for access in events
    ;(this.client as any).commandHandler = this.commandHandler
  }

  async start(): Promise<void> {
    try {
      Logger.info("Starting Discord bot...")

      // Connect to databases
      await mongodb.connect()
      await redis.connect()

      // Load commands and events
      await this.commandHandler.loadCommands()
      await this.eventHandler.loadEvents(this.client)

      // Connect to Discord
      await this.client.connect()

      // Register slash commands after bot is ready
      this.client.once("ready", async () => {
        await this.commandHandler.registerSlashCommands(this.client)
      })

      // Handle graceful shutdown
      process.on("SIGINT", () => this.shutdown())
      process.on("SIGTERM", () => this.shutdown())
    } catch (error) {
      Logger.error("Failed to start bot", error as Error)
      process.exit(1)
    }
  }

  private async shutdown(): Promise<void> {
    Logger.info("Shutting down bot...")

    try {
      this.client.disconnect({ reconnect: false })
      await mongodb.disconnect()
      await redis.disconnect()
      Logger.success("Bot shutdown complete")
      process.exit(0)
    } catch (error) {
      Logger.error("Error during shutdown", error as Error)
      process.exit(1)
    }
  }
}

// Start the bot
const bot = new DiscordBot()
bot.start().catch((error) => {
  Logger.error("Unhandled error during bot startup", error)
  process.exit(1)
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  Logger.error("Unhandled Rejection at:", reason)
})

process.on("uncaughtException", (error) => {
  Logger.error("Uncaught Exception:", error)
  process.exit(1)
})
