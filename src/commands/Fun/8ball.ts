import { ApplicationCommandOptionType, PermissionsBitField } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "8ball",
      description: `Ask a question to the magic 8ball.`,
      cooldown: 3,
      default_member_permissions:
        PermissionsBitField.Flags.UseApplicationCommands,
      category: Category.Fun,
      dm_permission: false,
      dev: true,
      options: [
        {
          name: `question`,
          description: `The question you want to ask.`,
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    });
  }
}
