import { ApplicationCommandOptionType, PermissionsBitField } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class Ban extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "ban",
      description: "Ban an user from the server.",
      category: Category.Moderation,
      default_member_permissions: PermissionsBitField.Flags.BanMembers,
      dm_permission: false,
      cooldown: 5,
      dev: false,
      options: [
        {
          name: "add",
          description: "Ban an user from the server.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "target",
              description: "The target to ban.",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "reason",
              description: "The reason for the ban.",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
            {
              name: "messages",
              description: "The messages to delete.",
              type: ApplicationCommandOptionType.Integer,
              required: false,
              choices: [
                {
                  name: "None",
                  value: 0,
                },
                {
                  name: "1 day",
                  value: 86400,
                },
                {
                  name: "1 week",
                  value: 604800,
                },
              ],
            },
            {
              name: "silent",
              description: "Don't send a message to the channel.",
              required: false,
              type: ApplicationCommandOptionType.Boolean,
            },
          ],
        },
        {
          name: "remove",
          description: "Unban an user from the server.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "target",
              description: "Enter the Usser ID.",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
            {
              name: "reason",
              description: "The reason for the ban.",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
            {
              name: "silent",
              description: "Don't send a message to the channel.",
              required: false,
              type: ApplicationCommandOptionType.Boolean,
            },
          ],
        },
      ],
    });
  }
}
