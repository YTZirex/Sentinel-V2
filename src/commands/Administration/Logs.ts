import {
  ApplicationCommandOptionType,
  ChannelType,
  PermissionsBitField,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class Logs extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "logs",
      description: "Configure the logs for your server.",
      category: Category.Administration,
      default_member_permissions: PermissionsBitField.Flags.ManageGuild,
      dm_permission: false,
      cooldown: 3,
      dev: false,
      options: [
        {
          name: "toggle",
          type: ApplicationCommandOptionType.Subcommand,
          description: "Toggle the logs for your server.",
          options: [
            {
              name: "log-type",
              description: "The type of logs to toggle.",
              type: ApplicationCommandOptionType.String,
              required: true,
              choices: [
                {
                  name: "Moderation",
                  value: "moderation",
                },
              ],
            },
            {
              name: "toggle",
              description: "Toggle the log.",
              type: ApplicationCommandOptionType.Boolean,
              required: true,
            },
          ],
        },
        {
          name: "set",
          type: ApplicationCommandOptionType.Subcommand,
          description: "Set the logs for your server.",
          options: [
            {
              name: "log-type",
              description: "The type of logs to set.",
              type: ApplicationCommandOptionType.String,
              required: true,
              choices: [
                {
                  name: "Moderation",
                  value: "moderation",
                },
              ],
            },
            {
              name: "channel",
              description: "Channel to set the log to.",
              type: ApplicationCommandOptionType.Channel,
              required: true,
              channel_types: [ChannelType.GuildText],
            },
          ],
        },
      ],
    });
  }
}
