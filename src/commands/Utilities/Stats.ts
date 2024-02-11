import { ApplicationCommandOptionType, PermissionsBitField } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class Stats extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "stats",
      description: `Shows certain statistics about the bot.`,
      dm_permission: false,
      default_member_permissions:
        PermissionsBitField.Flags.UseApplicationCommands,
      cooldown: 3,
      dev: true,
      category: Category.Utilities,
      options: [
        {
          name: "commands",
          description: `Shows how many times the commands were executed.`,
          type: ApplicationCommandOptionType.Subcommand,
          options: [],
        },
      ],
    });
  }
}
