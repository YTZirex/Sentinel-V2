import { ApplicationCommandOptionType, PermissionsBitField } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class Account extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "account",
      description: "Manage your bank account",
      category: Category.Economy,
      dm_permission: false,
      default_member_permissions:
        PermissionsBitField.Flags.UseApplicationCommands,
      cooldown: 3,
      dev: false,
      options: [
        {
          name: "create",
          description: "Create a new account.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "names",
              description:
                "Your fullname, please do not use real life informations.",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
            {
              name: "date-of-birth",
              description:
                "Your date of birth, please do not use real life informations.",
              required: true,
              type: ApplicationCommandOptionType.String,
            },
            {
              name: "gender",
              description:
                "Your gender, please do not use real life informations.",
              required: true,
              type: ApplicationCommandOptionType.String,
              choices: [
                {
                  name: "Male",
                  value: "male",
                },
                {
                  name: "Female",
                  value: "female",
                },
              ],
            },
          ],
        },
        {
          name: "delete",
          description: "Delete your account.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "confirm",
              description:
                "Once the command is executed, your account will be deleted. We can't undo this action.",
              required: true,
              type: ApplicationCommandOptionType.Boolean,
            },
          ],
        },
      ],
    });
  }
}
