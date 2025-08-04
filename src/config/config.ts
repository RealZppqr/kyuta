import { config } from "dotenv"
import type { BotConfig } from "../types/index.js"

config()

export const botConfig: BotConfig = {
  token: process.env.DISCORD_TOKEN || "",
  clientId: process.env.CLIENT_ID || "",
  prefix: process.env.PREFIX || "!",
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/discord-bot",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  nodeEnv: process.env.NODE_ENV || "development",
  shardCount: process.env.SHARD_COUNT === "auto" ? "auto" : Number.parseInt(process.env.SHARD_COUNT || "1"),
}

// Validate required environment variables
if (!botConfig.token) {
  console.error("❌ DISCORD_TOKEN is required")
  process.exit(1)
}

if (!botConfig.clientId) {
  console.error("❌ CLIENT_ID is required")
  process.exit(1)
}

console.log("✅ Configuration loaded successfully")
