import type { Client, Message, CommandInteraction } from "eris"

export interface BotConfig {
  token: string
  clientId: string
  prefix: string
  mongoUri: string
  redisUrl: string
  nodeEnv: string
  shardCount: number | "auto"
}

export interface Command {
  name: string
  description: string
  aliases?: string[]
  usage?: string
  permissions?: string[]
  cooldown?: number
  guildOnly?: boolean
  ownerOnly?: boolean
  execute: (client: Client, message: Message, args: string[]) => Promise<void>
}

export interface SlashCommand {
  name: string
  description: string
  options?: any[]
  permissions?: string[]
  guildOnly?: boolean
  ownerOnly?: boolean
  execute: (client: Client, interaction: CommandInteraction) => Promise<void>
}

export interface BotEvent {
  name: string
  once?: boolean
  execute: (client: Client, ...args: any[]) => Promise<void>
}

export interface ModerationLog {
  guildId: string
  userId: string
  moderatorId: string
  action: "kick" | "ban" | "timeout" | "unban"
  reason?: string
  duration?: number
  timestamp: Date
}

export interface GuildConfig {
  guildId: string
  prefix: string
  moderationChannel?: string
  automod: {
    enabled: boolean
    filters: string[]
  }
  createdAt: Date
  updatedAt: Date
}

export interface UserData {
  userId: string
  guildId: string
  warnings: number
  infractions: ModerationLog[]
  createdAt: Date
  updatedAt: Date
}
