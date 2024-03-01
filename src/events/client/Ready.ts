import { ActivityType, Collection, Events, REST, Routes } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import colors from "colors";
import Command from "../../base/classes/Command";
import IConfig from "../../base/interfaces/IConfig";
// import dbots from "dbots";

colors.enable();

export default class Ready extends Event {
  constructor(client: CustomClient) {
    super(client, {
      name: Events.ClientReady,
      description: `Ready Event`,
      once: true,
    });
  }

  async Execute(client: CustomClient) {
    console.log(`${this.client.user?.tag} is now ready!`.green);

    const clientId = this.client.developmentMode
      ? this.client.config.devClientId
      : this.client.config.clientId;
    const rest = new REST().setToken(this.client.config.token);
    const devCommands: any = await rest.put(
      Routes.applicationGuildCommands(clientId, this.client.config.devGuildId),
      {
        body: this.GetJson(
          this.client.commands.filter((command) => command.dev)
        ),
      }
    );
    console.log(
      `Successfully registered ${devCommands.length} dev commands!`.green
    );

    if (!this.client.developmentMode) {
      const globalCommands: any = await rest.put(
        Routes.applicationCommands(clientId),
        {
          body: this.GetJson(
            this.client.commands.filter((command) => !command.dev)
          ),
        }
      );

      console.log(
        `Successfully registered ${globalCommands.length} global commands!`
          .green
      );
    }
    /*

    const poster = new dbots.Poster({
      client,
      apiKeys: {
        discordbotsgg: '…',
        topgg: '…',
        lsterminalink: '…',
        carbon: '…'
      },
      clientLibrary: 'discord.js'
    })
  
    // Starts an interval thats posts to all services every 30 minutes.
    poster.startInterval()
*/

    let guildsFetchedSize = (await this.client.guilds.fetch()).size;
    // Our pointer
    let i = 0;
    // Every 15 seconds, update the status
    setInterval(() => {
      let statuses = [
        `${this.client.guilds.cache
          .map((guild) => guild.memberCount)
          .reduce((a, b) => a + b, 0)} users!`,
        `Version ${this.client.config.botVersion}`,
        `Released 10/02/2024 10:00PM !`,
        `${guildsFetchedSize} servers!`,
        `Online since ${this.uptimeString(Math.floor(process.uptime()))}`,
      ];

      // Get the status
      let status = statuses[i];
      // If it's undefined, it means we reached the end of the array
      if (!status) {
        // Restart at the first status
        status = statuses[0];
        i = 0;
      }
      client.user?.setPresence({
        activities: [{ name: status, type: ActivityType.Watching }],
        status: "online",
      });
      i++;
    }, 5000);
  }

  private GetJson(commands: Collection<string, Command>): object[] {
    const data: object[] = [];

    commands.forEach((command) => {
      data.push({
        name: command.name,
        description: command.description,
        options: command.options,
        default_member_permissions:
          command.default_member_permissions.toString(),
        dm_permission: command.dm_permission,
      });
    });
    return data;
  }
  private uptimeString(seconds: number) {
    // eslint-disable-next-line prefer-const
    let days = Math.floor(seconds / (3600 * 24));
    seconds -= days * 3600 * 24;
    // eslint-disable-next-line prefer-const
    let hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    // eslint-disable-next-line prefer-const
    let minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    return `${days}d, ${hours}h, ${minutes}min, ${seconds}s`;
  }
}
