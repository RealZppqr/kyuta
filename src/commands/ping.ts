import type { Client, Message, CommandInteraction } from "eris"
import type { Command, SlashCommand } from "../types/index.js"

export const command: Command = {
  name: "ping",
  description: "Check the bot's latency",
  aliases: ["pong", "latency"],
  cooldown: 5,
  async execute(client: Client, message: Message, args: string[]) {
    const start = Date.now()
    const msg = await message.channel.createMessage("🏓 Pinging...")
    const end = Date.now()

    const embed = {
      title: "🏓 Pong!",
      fields: [
        {
          name: "API Latency",
          value: `${end - start}ms`,
          inline: true,
        },
        {
          name: "WebSocket Latency",
          value: `${Math.round(client.shards.get(0)?.latency || 0)}ms`,
          inline: true,
        },
      ],
      color: 0x00ff00,
      timestamp: new Date().toISOString(),
    }

    await msg.edit({ content: "", embeds: [embed] })
  },
}

export const slashCommand: SlashCommand = {
  name: "ping",
  description: "Check the bot's latency",
  cooldown: 5,
  async execute(client: Client, interaction: CommandInteraction) {
    const start = Date.now()

    await interaction.createResponse(4, {
      data: {
        content: "🏓 Pinging...",
      },
    })

    const end = Date.now()

    const embed = {
      title: "🏓 Pong!",
      fields: [
        {
          name: "API Latency",
          value: `${end - start}ms`,
          inline: true,
        },
        {
          name: "WebSocket Latency",
          value: `${Math.round(client.shards.get(0)?.latency || 0)}ms`,
          inline: true,
        },
      ],
      color: 0x00ff00,
      timestamp: new Date().toISOString(),
    }

    await interaction.editOriginalMessage({ content: "", embeds: [embed] })
  },
}
