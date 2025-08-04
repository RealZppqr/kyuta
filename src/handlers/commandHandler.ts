import { readdirSync } from "fs"
import { pathToFileURL } from "url"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import type { Client } from "eris"
import type { Command, SlashCommand } from "../types/index.js"
import { Logger } from "../utils/logger.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export class CommandHandler {
  public commands = new Map<string, Command>()
  public slashCommands = new Map<string, SlashCommand>()
  public aliases = new Map<string, string>()

  async loadCommands(): Promise<void> {
    const commandsPath = join(__dirname, "..", "commands")
    const commandFiles = readdirSync(commandsPath).filter((file) => file.endsWith(".js"))

    for (const file of commandFiles) {
      try {
        const filePath = pathToFileURL(join(commandsPath, file)).href
        const commandModule = await import(filePath)

        if (commandModule.command) {
          const command: Command = commandModule.command
          this.commands.set(command.name, command)

          if (command.aliases) {
            for (const alias of command.aliases) {
              this.aliases.set(alias, command.name)
            }
          }

          Logger.debug(`Loaded prefix command: ${command.name}`)
        }

        if (commandModule.slashCommand) {
          const slashCommand: SlashCommand = commandModule.slashCommand
          this.slashCommands.set(slashCommand.name, slashCommand)
          Logger.debug(`Loaded slash command: ${slashCommand.name}`)
        }
      } catch (error) {
        Logger.error(`Failed to load command ${file}`, error as Error)
      }
    }

    Logger.success(`Loaded ${this.commands.size} prefix commands and ${this.slashCommands.size} slash commands`)
  }

  async registerSlashCommands(client: Client): Promise<void> {
    try {
      const commands = Array.from(this.slashCommands.values()).map((cmd) => ({
        name: cmd.name,
        description: cmd.description,
        options: cmd.options || [],
      }))

      await client.bulkEditCommands(commands)
      Logger.success(`Registered ${commands.length} slash commands globally`)
    } catch (error) {
      Logger.error("Failed to register slash commands", error as Error)
    }
  }
}
