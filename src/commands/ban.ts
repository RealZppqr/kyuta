import type { Client, Message, CommandInteraction } from "eris"
import type { Command, SlashCommand } from "../types/index.js"
import { mongodb } from "../utils/mongo.js"
import { Logger } from "../utils/logger.js"

export const command: Command = {
  name: "ban",
  description: "Ban a user from the server",
  usage: "ban <@user|userID> [reason]",
  permissions: ["banMembers"],
  guildOnly: true,
  cooldown: 5,
  async execute(client: Client, message: Message, args: string[]) {
    if (!args[0]) {
      await message.channel.createMessage("❌ Please provide a user to ban.")
      return
    }

    const userId = args[0].replace(/[<@!>]/g, "")
    const reason = args.slice(1).join(" ") || "No reason provided"

    try {
      // Check if user exists
      const targetUser = await client.getRESTUser(userId)

      // Check if user is in guild
      const member = message.channel.guild.members.get(userId)

      if (member) {
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
          await message.channel.createMessage("❌ You cannot ban this user due to role hierarchy.")
          return
        }
      }

      // Ban the user
      await message.channel.guild.banMember(userId, 7, reason)

      // Log to database
      await mongodb.createModerationLog({
        guildId: message.guildID!,
        userId: userId,
        moderatorId: message.author.id,
        action: "ban",
        reason: reason,
        timestamp: new Date(),
      })

      const embed = {
        title: "🔨 User Banned",
        fields: [
          {
            name: "User",
            value: `${targetUser.username}#${targetUser.discriminator} (${targetUser.id})`,
            inline: false,
          },
          {
            name: "Moderator",
            value: `${message.author.username}#${message.author.discriminator}`,
            inline: true,
          },
          {
            name: "Reason",
            value: reason,
            inline: false,
          },
        ],
        color: 0xff0000,
        timestamp: new Date().toISOString(),
      }

      await message.channel.createMessage({ embeds: [embed] })
      Logger.info(`User ${targetUser.username} banned from ${message.channel.guild.name} by ${message.author.username}`)
    } catch (error) {
      Logger.error("Error banning user", error as Error)
      await message.channel.createMessage("❌ Failed to ban user. They may already be banned or I lack permissions.")
    }
  },
}

export const slashCommand: SlashCommand = {
  name: "ban",
  description: "Ban a user from the server",
  options: [
    {
      name: "user",
      description: "The user to ban",
      type: 6, // USER
      required: true,
    },
    {
      name: "reason",
      description: "Reason for the ban",
      type: 3, // STRING
      required: false,
    },
  ],
  permissions: ["banMembers"],
  guildOnly: true,
  cooldown: 5,
  async execute(client: Client, interaction: CommandInteraction) {
    const userId = interaction.data.options![0].value as string
    const reason = (interaction.data.options?.[1]?.value as string) || "No reason provided"

    try {
      // Check if user exists
      const targetUser = await client.getRESTUser(userId)

      // Check if user is in guild
      const guild = client.guilds.get(interaction.guildID!)
      const member = guild?.members.get(userId)

      if (member && interaction.member) {
        // Check role hierarchy
        if (
          member.roles.some((roleId) => {
            const role = guild.roles.get(roleId)
            const authorHighestRole = interaction
              .member!.roles.map((id) => guild.roles.get(id)!)
              .sort((a, b) => b.position - a.position)[0]
            return role && role.position >= (authorHighestRole?.position || 0)
          })
        ) {
          await interaction.createResponse(4, {
            data: {
              content: "❌ You cannot ban this user due to role hierarchy.",
              flags: 64, // Ephemeral
            },
          })
          return
        }
      }

      // Ban the user
      await guild!.banMember(userId, 7, reason)

      // Log to database
      await mongodb.createModerationLog({
        guildId: interaction.guildID!,
        userId: userId,
        moderatorId: interaction.user.id,
        action: "ban",
        reason: reason,
        timestamp: new Date(),
      })

      const embed = {
        title: "🔨 User Banned",
        fields: [
          {
            name: "User",
            value: `${targetUser.username}#${targetUser.discriminator} (${targetUser.id})`,
            inline: false,
          },
          {
            name: "Moderator",
            value: `${interaction.user.username}#${interaction.user.discriminator}`,
            inline: true,
          },
          {
            name: "Reason",
            value: reason,
            inline: false,
          },
        ],
        color: 0xff0000,
        timestamp: new Date().toISOString(),
      }

      await interaction.createResponse(4, {
        data: { embeds: [embed] },
      })

      Logger.info(`User ${targetUser.username} banned from ${guild!.name} by ${interaction.user.username}`)
    } catch (error) {
      Logger.error("Error banning user", error as Error)

      const errorResponse = {
        content: "❌ Failed to ban user. They may already be banned or I lack permissions.",
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
