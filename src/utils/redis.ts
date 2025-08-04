import { createClient, type RedisClientType } from "redis"
import { botConfig } from "../config/config.js"
import { Logger } from "./logger.js"

class RedisCache {
  private client: RedisClientType | null = null

  async connect(): Promise<void> {
    try {
      this.client = createClient({ url: botConfig.redisUrl })

      this.client.on("error", (error) => {
        Logger.error("Redis error", error)
      })

      await this.client.connect()
      Logger.success("Connected to Redis")
    } catch (error) {
      Logger.error("Failed to connect to Redis", error as Error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit()
      Logger.info("Disconnected from Redis")
    }
  }

  // Cooldown management
  async setCooldown(userId: string, commandName: string, duration: number): Promise<void> {
    if (!this.client) throw new Error("Redis not connected")
    const key = `cooldown:${userId}:${commandName}`
    await this.client.setEx(key, duration, "true")
  }

  async getCooldown(userId: string, commandName: string): Promise<number> {
    if (!this.client) throw new Error("Redis not connected")
    const key = `cooldown:${userId}:${commandName}`
    return await this.client.ttl(key)
  }

  // Guild prefix caching
  async setGuildPrefix(guildId: string, prefix: string): Promise<void> {
    if (!this.client) throw new Error("Redis not connected")
    const key = `prefix:${guildId}`
    await this.client.set(key, prefix)
  }

  async getGuildPrefix(guildId: string): Promise<string | null> {
    if (!this.client) throw new Error("Redis not connected")
    const key = `prefix:${guildId}`
    return await this.client.get(key)
  }

  // Generic cache operations
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.client) throw new Error("Redis not connected")
    if (ttl) {
      await this.client.setEx(key, ttl, value)
    } else {
      await this.client.set(key, value)
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) throw new Error("Redis not connected")
    return await this.client.get(key)
  }

  async del(key: string): Promise<void> {
    if (!this.client) throw new Error("Redis not connected")
    await this.client.del(key)
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client) throw new Error("Redis not connected")
    return (await this.client.exists(key)) === 1
  }
}

export const redis = new RedisCache()
