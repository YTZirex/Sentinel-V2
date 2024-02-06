import { ApplicationCommandOptionType, PermissionsBitField } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class Language extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "language",
      default_member_permissions: PermissionsBitField.Flags.ManageGuild,
      description: "Manage the language of the bot in the server.",
      dm_permission: false,
      category: Category.Administration,
      cooldown: 5,
      dev: false,
      options: [
        {
          name: "set",
          description: `Set the language of the bot in the server.`,
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "language",
              description: "The language to be used.",
              type: ApplicationCommandOptionType.String,
              required: true,
              choices: [
                { name: "Français", value: "fr" },
                { name: "English", value: "en" },
              ],
            },
          ],
        },
        {
          name: "preview",
          description: "Preview the language of the bot in the server.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [],
        },
      ],
    });
  }
}
