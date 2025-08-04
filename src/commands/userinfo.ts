import type { Client, Message, CommandInteraction, User } from "eris"
import type { Command, SlashCommand } from "../types/index.js"

export const command: Command = {
  name: "userinfo",
  description: "Get information about a user",
  aliases: ["user", "whois"],
  usage: "userinfo [@user|userID]",
  cooldown: 10,
  async execute(client: Client, message: Message, args: string[]) {
    let targetUser: User

    if (args[0]) {
      // Try to get user by mention or ID
      const userId = args[0].replace(/[<@!>]/g, "")
      try {
        targetUser = await client.getRESTUser(userId)
      } catch {
        await message.channel.createMessage("❌ User not found.")
        return
      }
    } else {
      targetUser = message.author
    }

    const member = message.guildID ? message.channel.guild.members.get(targetUser.id) : null

    const embed = {
      title: `User Information - ${targetUser.username}`,
      thumbnail: {
        url: targetUser.avatarURL,
      },
      fields: [
        {
          name: "Username",
          value: `${targetUser.username}#${targetUser.discriminator}`,
          inline: true,
        },
        {
          name: "ID",
          value: targetUser.id,
          inline: true,
        },
        {
          name: "Account Created",
          value: `<t:${Math.floor(targetUser.createdAt / 1000)}:F>`,
          inline: false,
        },
      ],
      color: 0x0099ff,
      timestamp: new Date().toISOString(),
    }

    if (member) {
      embed.fields.push(
        {
          name: "Joined Server",
          value: `<t:${Math.floor(member.joinedAt! / 1000)}:F>`,
          inline: false,
        },
        {
          name: "Roles",
          value: member.roles.length > 0 ? member.roles.map((roleId) => `<@&${roleId}>`).join(", ") : "No roles",
          inline: false,
        },
      )
    }

    await message.channel.createMessage({ embeds: [embed] })
  },
}

export const slashCommand: SlashCommand = {
  name: "userinfo",
  description: "Get information about a user",
  options: [
    {
      name: "user",
      description: "The user to get information about",
      type: 6, // USER
      required: false,
    },
  ],
  cooldown: 10,
  async execute(client: Client, interaction: CommandInteraction) {
    const targetUser = interaction.data.options?.[0]?.value
      ? await client.getRESTUser(interaction.data.options[0].value as string)
      : interaction.user

    const member = interaction.guildID ? interaction.member : null

    const embed = {
      title: `User Information - ${targetUser.username}`,
      thumbnail: {
        url: targetUser.avatarURL,
      },
      fields: [
        {
          name: "Username",
          value: `${targetUser.username}#${targetUser.discriminator}`,
          inline: true,
        },
        {
          name: "ID",
          value: targetUser.id,
          inline: true,
        },
        {
          name: "Account Created",
          value: `<t:${Math.floor(targetUser.createdAt / 1000)}:F>`,
          inline: false,
        },
      ],
      color: 0x0099ff,
      timestamp: new Date().toISOString(),
    }

    if (member && targetUser.id === interaction.user.id) {
      embed.fields.push(
        {
          name: "Joined Server",
          value: `<t:${Math.floor(member.joinedAt! / 1000)}:F>`,
          inline: false,
        },
        {
          name: "Roles",
          value: member.roles.length > 0 ? member.roles.map((roleId) => `<@&${roleId}>`).join(", ") : "No roles",
          inline: false,
        },
      )
    }

    await interaction.createResponse(4, {
      data: { embeds: [embed] },
    })
  },
}
