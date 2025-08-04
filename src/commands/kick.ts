import type { Client, Message, CommandInteraction } from "eris"
import type { Command, SlashCommand } from "../types/index.js"
import { mongodb } from "../utils/mongo.js"
import { Logger } from "../utils/logger.js"

export const command: Command = {
  name: "kick",
  description: "Kick a user from the server",
  usage: "kick <@user|userID> [reason]",
  permissions: ["kickMembers"],
  guildOnly: true,
  cooldown: 5,
  async execute(client: Client, message: Message, args: string[]) {
    if (!args[0]) {
      await message.channel.createMessage("❌ Please provide a user to kick.")
      return
    }

    const userId = args[0].replace(/[<@!>]/g, "")
    const reason = args.slice(1).join(" ") || "No reason provided"

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
        await message.channel.createMessage("❌ You cannot kick this user due to role hierarchy.")
        return
      }

      // Kick the user
      await member.kick(reason)

      // Log to database
      await mongodb.createModerationLog({
        guildId: message.guildID!,
        userId: userId,
        moderatorId: message.author.id,
        action: "kick",
        reason: reason,
        timestamp: new Date(),
      })

      const embed = {
        title: "👢 User Kicked",
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
            name: "Reason",
            value: reason,
            inline: false,
          },
        ],
        color: 0xffa500,
        timestamp: new Date().toISOString(),
      }

      await message.channel.createMessage({ embeds: [embed] })
      Logger.info(`User ${member.username} kicked from ${message.channel.guild.name} by ${message.author.username}`)
    } catch (error) {
      Logger.error("Error kicking user", error as Error)
      await message.channel.createMessage("❌ Failed to kick user. I may lack permissions.")
    }
  },
}

export const slashCommand: SlashCommand = {
  name: "kick",
  description: "Kick a user from the server",
  options: [
    {
      name: "user",
      description: "The user to kick",
      type: 6, // USER
      required: true,
    },
    {
      name: "reason",
      description: "Reason for the kick",
      type: 3, // STRING
      required: false,
    },
  ],
  permissions: ["kickMembers"],
  guildOnly: true,
  cooldown: 5,
  async execute(client: Client, interaction: CommandInteraction) {
    const userId = interaction.data.options![0].value as string
    const reason = (interaction.data.options?.[1]?.value as string) || "No reason provided"

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
            content: "❌ You cannot kick this user due to role hierarchy.",
            flags: 64, // Ephemeral
          },
        })
        return
      }

      // Kick the user
      await member.kick(reason)

      // Log to database
      await mongodb.createModerationLog({
        guildId: interaction.guildID!,
        userId: userId,
        moderatorId: interaction.user.id,
        action: "kick",
        reason: reason,
        timestamp: new Date(),
      })

      const embed = {
        title: "👢 User Kicked",
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
            name: "Reason",
            value: reason,
            inline: false,
          },
        ],
        color: 0xffa500,
        timestamp: new Date().toISOString(),
      }

      await interaction.createResponse(4, {
        data: { embeds: [embed] },
      })

      Logger.info(`User ${member.username} kicked from ${guild!.name} by ${interaction.user.username}`)
    } catch (error) {
      Logger.error("Error kicking user", error as Error)

      const errorResponse = {
        content: "❌ Failed to kick user. I may lack permissions.",
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
