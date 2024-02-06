import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionsBitField,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import IConfig from "../../base/interfaces/IConfig";
import ms from "ms";
import os from "os";
const { version, dependencies } = require(`${process.cwd()}/package.json`);

export default class BotInfo extends Command {
  config: IConfig;
  constructor(client: CustomClient) {
    super(client, {
      name: "botinfo",
      description: "Get informations about the bot",
      dm_permission: false,
      default_member_permissions:
        PermissionsBitField.Flags.UseApplicationCommands,
      cooldown: 3,
      dev: false,
      category: Category.Utilities,
      options: [],
    });
    this.config = require(`${process.cwd()}/data/config.json`);
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    /*
    \`${Object.keys(dependencies)
          .map((p) => `${p}@${dependencies[p]}`.replace(/\^/g, ""))
          .join(", ")}\`*/
    interaction.reply({
      embeds: [
        {
          color: 0x6666ff,
          thumbnail: { url: this.client.user!.displayAvatarURL() },
          description: `
          __**Bot Info**__
          > **User:** ${this.client.user?.tag} - ${this.client.user?.id}
          > **Account Created:** <t:${(
            this.client.user!.createdTimestamp / 1000
          ).toFixed(0)}:R>
          > **Commands:** ${this.client.commands.size}
          > **DiscordJS Version:** ${version}
          > **Node Version:** ${process.version}
          > **Bot Version:** ${this.config.botVersion}
          > **Dependencies:** ${Object.keys(dependencies).length}
          > **Uptime:** ${this.uptimeString(Math.floor(process.uptime()))}

          __**Guild Info**__
          > **Total Guilds:** ${(await this.client.guilds.fetch()).size}
          > **Total Members:** ${this.client.guilds.cache
            .map((guild) => guild.memberCount)
            .reduce((a, b) => a + b, 0)}
          > **Total Channels:** ${await this.client.channels.cache.size}

          __**System Info**__
          > **Operating System:** ${process.platform}
          > **CPU:** ${os.cpus()[0].model.trim()}
          > **RAM Usage:** ${this.formatBytes(
            process.memoryUsage().heapUsed
          )} / ${this.formatBytes(os.totalmem())}

          __**Development Team:**__
          > **Creators**: Fadzuk, Matt
          > **Developers:** Matt
          `
        },/*
        new EmbedBuilder()
          .setThumbnail(this.client.user?.displayAvatarURL()!)
          .setColor("Random").setDescription(`
                __**Bot Info**__
                > **User:** ${this.client.user?.tag} - ${this.client.user?.id}
                > **Account Created:** <t:${(
                  this.client.user!.createdTimestamp / 1000
                ).toFixed(0)}:R>
                > **Commands:** ${this.client.commands.size}
                > **DiscordJS Version:** ${version}
                > **Node Version:** ${process.version}
                > **Bot Version:** ${this.config.botVersion}
                > **Dependencies:** ${Object.keys(dependencies).length}
                > **Uptime:** ${this.uptimeString(Math.floor(process.uptime()))}

                __**Guild Info**__
                > **Total Guilds:** ${(await this.client.guilds.fetch()).size}
                > **Total Members:** ${this.client.guilds.cache
                  .map((guild) => guild.memberCount)
                  .reduce((a, b) => a + b, 0)}
                > **Total Channels:** ${await this.client.channels.cache.size}

                __**System Info**__
                > **Operating System:** ${process.platform}
                > **CPU:** ${os.cpus()[0].model.trim()}
                > **RAM Usage:** ${this.formatBytes(
                  process.memoryUsage().heapUsed
                )} / ${this.formatBytes(os.totalmem())}

                __**Development Team:**__
                > **Creators**: Fadzuk, Matt
                > **Developers:** Matt
                `),*/
      ],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 5,
              label: "Invite me!",
              url: "https://discord.com/api/oauth2/authorize?client_id=1203014293549744189&permissions=70368744177655&scope=applications.commands+bot",
              emoji: "🔗",
            },
            {
              type: 2,
              style: 5,
              label: "Support Server",
              url: "https://discord.gg/My2BVCmJEY",
              emoji: "💬",
            },
          ],
        },
      ],
      /*
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel(`Invite me!`)
            .setStyle(ButtonStyle.Link)
            .setURL(
              "https://discord.com/api/oauth2/authorize?client_id=1203014293549744189&permissions=70368744177655&scope=applications.commands+bot"
            ),
          new ButtonBuilder()
            .setLabel("Support Server")
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.gg/My2BVCmJEY")
        ),
      ],*/
    });
  }

  private formatBytes(bytes: number) {
    if (bytes == 0) return "0";

    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
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
    return `${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds`;
  }
}
