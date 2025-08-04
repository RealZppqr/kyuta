import { readdirSync } from "fs"
import { pathToFileURL } from "url"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import type { Client } from "eris"
import type { BotEvent } from "../types/index.js"
import { Logger } from "../utils/logger.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export class EventHandler {
  async loadEvents(client: Client): Promise<void> {
    const eventsPath = join(__dirname, "..", "events")
    const eventFiles = readdirSync(eventsPath).filter((file) => file.endsWith(".js"))

    for (const file of eventFiles) {
      try {
        const filePath = pathToFileURL(join(eventsPath, file)).href
        const eventModule = await import(filePath)

        if (eventModule.event) {
          const event: BotEvent = eventModule.event

          if (event.once) {
            client.once(event.name, (...args) => event.execute(client, ...args))
          } else {
            client.on(event.name, (...args) => event.execute(client, ...args))
          }

          Logger.debug(`Loaded event: ${event.name}`)
        }
      } catch (error) {
        Logger.error(`Failed to load event ${file}`, error as Error)
      }
    }

    Logger.success(`Loaded events from ${eventFiles.length} files`)
  }
}
