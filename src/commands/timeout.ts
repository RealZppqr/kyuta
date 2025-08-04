import type { Client, Message, CommandInteraction } from "eris"
import type { Command, SlashCommand } from "../types/index.js"
import { mongodb } from "../utils/mongo.js"
import { Logger } from "../utils/logger.js"

function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/)
  if (!match) return 0

  const value = Number.parseInt(match[1])
  const unit = match[2]

  switch (unit) {
    case "s":
      return value * 1000
    case "m":
      return value * 60 * 1000
    case "h":
      return value * 60 * 60 * 1000
    case "d":
      return value * 24 * 60 * 60 * 1000
    default:
      return 0
  }
}

export const command: Command = {
  name: "timeout",
  description: "Timeout a user in the server",
  usage: "timeout <@user|userID> <duration> [reason]",
  aliases: ["mute"],
  permissions: ["moderateMembers"],
  guildOnly: true,
  cooldown: 5,
  async execute(client: Client, message: Message, args: string[]) {
    if (!args[0] || !args[1]) {
      await message.channel.createMessage(
        "❌ Usage: `timeout <@user|userID> <duration> [reason]`\nDuration format: 1s, 5m, 2h, 1d",
      )
      return
    }

    const userId = args[0].replace(/[<@!>]/g, "")
    const duration = parseDuration(args[1])
    const reason = args.slice(2).join(" ") || "No reason provided"

    if (duration === 0 || duration > 28 * 24 * 60 * 60 * 1000) {
      await message.channel.createMessage("❌ Invalid duration. Use format like: 1s, 5m, 2h, 1d (max 28 days)")
      return
    }

    try {
      const member = message.channel.guild.members.get(userId)
      if (!member) {
        await message.channel.createMessage("❌ User not found in this server.")
        return
      }

      // Check role hierarchy
      if (
        member.roles.some((roleId) => {
          const role = message.channel.guild.roles.get(roleId)
          const authorHighestRole = message
            .member!.roles.map((id) => message.channel.guild.roles.get(id)!)
            .sort((a, b) => b.position - a.position)[0]
          return role && role.position >= (authorHighestRole?.position || 0)
        })
      ) {
        await message.channel.createMessage("❌ You cannot timeout this user due to role hierarchy.")
        return
      }

      // Timeout the user
      const timeoutUntil = new Date(Date.now() + duration)
      await member.edit({ communicationDisabledUntil: timeoutUntil.toISOString() })

      // Log to database
      await mongodb.createModerationLog({
        guildId: message.guildID!,
        userId: userId,
        moderatorId: message.author.id,
        action: "timeout",
        reason: reason,
        duration: duration,
        timestamp: new Date(),
      })

      const embed = {
        title: "🔇 User Timed Out",
        fields: [
          {
            name: "User",
            value: `${member.username}#${member.discriminator} (${member.id})`,
            inline: false,
          },
          {
            name: "Moderator",
            value: `${message.author.username}#${message.author.discriminator}`,
            inline: true,
          },
          {
            name: "Duration",
            value: args[1],
            inline: true,
          },
          {
            name: "Until",
            value: `<t:${Math.floor(timeoutUntil.getTime() / 1000)}:F>`,
            inline: false,
          },
          {
            name: "Reason",
            value: reason,
            inline: false,
          },
        ],
        color: 0x808080,
        timestamp: new Date().toISOString(),
      }

      await message.channel.createMessage({ embeds: [embed] })
      Logger.info(`User ${member.username} timed out in ${message.channel.guild.name} by ${message.author.username}`)
    } catch (error) {
      Logger.error("Error timing out user", error as Error)
      await message.channel.createMessage("❌ Failed to timeout user. I may lack permissions.")
    }
  },
}

export const slashCommand: SlashCommand = {
  name: "timeout",
  description: "Timeout a user in the server",
  options: [
    {
      name: "user",
      description: "The user to timeout",
      type: 6, // USER
      required: true,
    },
    {
      name: "duration",
      description: "Duration (e.g., 1s, 5m, 2h, 1d)",
      type: 3, // STRING
      required: true,
    },
    {
      name: "reason",
      description: "Reason for the timeout",
      type: 3, // STRING
      required: false,
    },
  ],
  permissions: ["moderateMembers"],
  guildOnly: true,
  cooldown: 5,
  async execute(client: Client, interaction: CommandInteraction) {
    const userId = interaction.data.options![0].value as string
    const durationStr = interaction.data.options![1].value as string
    const reason = (interaction.data.options?.[2]?.value as string) || "No reason provided"

    const duration = parseDuration(durationStr)

    if (duration === 0 || duration > 28 * 24 * 60 * 60 * 1000) {
      await interaction.createResponse(4, {
        data: {
          content: "❌ Invalid duration. Use format like: 1s, 5m, 2h, 1d (max 28 days)",
          flags: 64, // Ephemeral
        },
      })
      return
    }

    try {
      const guild = client.guilds.get(interaction.guildID!)
      const member = guild?.members.get(userId)

      if (!member) {
        await interaction.createResponse(4, {
          data: {
            content: "❌ User not found in this server.",
            flags: 64, // Ephemeral
          },
        })
        return
      }

      // Check role hierarchy
      if (
        member.roles.some((roleId) => {
          const role = guild!.roles.get(roleId)
          const authorHighestRole = interaction
            .member!.roles.map((id) => guild!.roles.get(id)!)
            .sort((a, b) => b.position - a.position)[0]
          return role && role.position >= (authorHighestRole?.position || 0)
        })
      ) {
        await interaction.createResponse(4, {
          data: {
            content: "❌ You cannot timeout this user due to role hierarchy.",
            flags: 64, // Ephemeral
          },
        })
        return
      }

      // Timeout the user
      const timeoutUntil = new Date(Date.now() + duration)
      await member.edit({ communicationDisabledUntil: timeoutUntil.toISOString() })

      // Log to database
      await mongodb.createModerationLog({
        guildId: interaction.guildID!,
        userId: userId,
        moderatorId: interaction.user.id,
        action: "timeout",
        reason: reason,
        duration: duration,
        timestamp: new Date(),
      })

      const embed = {
        title: "🔇 User Timed Out",
        fields: [
          {
            name: "User",
            value: `${member.username}#${member.discriminator} (${member.id})`,
            inline: false,
          },
          {
            name: "Moderator",
            value: `${interaction.user.username}#${interaction.user.discriminator}`,
            inline: true,
          },
          {
            name: "Duration",
            value: durationStr,
            inline: true,
          },
          {
            name: "Until",
            value: `<t:${Math.floor(timeoutUntil.getTime() / 1000)}:F>`,
            inline: false,
          },
          {
            name: "Reason",
            value: reason,
            inline: false,
          },
        ],
        color: 0x808080,
        timestamp: new Date().toISOString(),
      }

      await interaction.createResponse(4, {
        data: { embeds: [embed] },
      })

      Logger.info(`User ${member.username} timed out in ${guild!.name} by ${interaction.user.username}`)
    } catch (error) {
      Logger.error("Error timing out user", error as Error)

      const errorResponse = {
        content: "❌ Failed to timeout user. I may lack permissions.",
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
