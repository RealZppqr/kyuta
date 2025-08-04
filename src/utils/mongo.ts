import { MongoClient, type Db } from "mongodb"
import { botConfig } from "../config/config.js"
import { Logger } from "./logger.js"
import type { ModerationLog, GuildConfig, UserData } from "../types/index.js"

class MongoDB {
  private client: MongoClient | null = null
  private db: Db | null = null

  async connect(): Promise<void> {
    try {
      this.client = new MongoClient(botConfig.mongoUri)
      await this.client.connect()
      this.db = this.client.db()

      // Create indexes for better performance
      await this.createIndexes()

      Logger.success("Connected to MongoDB")
    } catch (error) {
      Logger.error("Failed to connect to MongoDB", error as Error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close()
      Logger.info("Disconnected from MongoDB")
    }
  }

  private async createIndexes(): Promise<void> {
    if (!this.db) return

    // Moderation logs indexes
    await this.db.collection("moderationLogs").createIndex({ guildId: 1, userId: 1 })
    await this.db.collection("moderationLogs").createIndex({ timestamp: -1 })

    // Guild config indexes
    await this.db.collection("guildConfigs").createIndex({ guildId: 1 }, { unique: true })

    // User data indexes
    await this.db.collection("userData").createIndex({ userId: 1, guildId: 1 }, { unique: true })
  }

  // Moderation Logs
  async createModerationLog(log: ModerationLog): Promise<void> {
    if (!this.db) throw new Error("Database not connected")
    await this.db.collection<ModerationLog>("moderationLogs").insertOne(log)
  }

  async getModerationLogs(guildId: string, userId?: string): Promise<ModerationLog[]> {
    if (!this.db) throw new Error("Database not connected")
    const filter: any = { guildId }
    if (userId) filter.userId = userId

    return await this.db
      .collection<ModerationLog>("moderationLogs")
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray()
  }

  // Guild Configuration
  async getGuildConfig(guildId: string): Promise<GuildConfig | null> {
    if (!this.db) throw new Error("Database not connected")
    return await this.db.collection<GuildConfig>("guildConfigs").findOne({ guildId })
  }

  async updateGuildConfig(guildId: string, config: Partial<GuildConfig>): Promise<void> {
    if (!this.db) throw new Error("Database not connected")
    await this.db.collection<GuildConfig>("guildConfigs").updateOne(
      { guildId },
      {
        $set: { ...config, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    )
  }

  // User Data
  async getUserData(userId: string, guildId: string): Promise<UserData | null> {
    if (!this.db) throw new Error("Database not connected")
    return await this.db.collection<UserData>("userData").findOne({ userId, guildId })
  }

  async updateUserData(userId: string, guildId: string, data: Partial<UserData>): Promise<void> {
    if (!this.db) throw new Error("Database not connected")
    await this.db.collection<UserData>("userData").updateOne(
      { userId, guildId },
      {
        $set: { ...data, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    )
  }
}

export const mongodb = new MongoDB()
