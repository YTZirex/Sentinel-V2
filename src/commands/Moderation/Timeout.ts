import { ApplicationCommandOptionType, PermissionsBitField } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class Timeout extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "timeout",
      description: "Timeout a user from the server.",
      category: Category.Moderation,
      default_member_permissions: PermissionsBitField.Flags.ModerateMembers,
      dm_permission: false,
      cooldown: 5,
      dev: false,
      options: [
        {
          name: "add",
          description: "Add a timeout to a user.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "target",
              description: "Select a member to timeout.",
              required: true,
              type: ApplicationCommandOptionType.User,
            },
            {
              name: "duration",
              description: "Duration of the timeout",
              required: false,
              type: ApplicationCommandOptionType.String,
              choices: [
                { name: "5 minutes", value: "5m" },
                { name: "10 minutes", value: "10m" },
                { name: "15 minutes", value: "15m" },
                { name: "30 minutes", value: "30m" },
                { name: "45 minutes", value: "45m" },
                { name: "1 hour", value: "1h" },
                { name: "2 hours", value: "2h" },
                { name: "6 hours", value: "6h" },
                { name: "12 hours", value: "12h" },
                { name: "1 day", value: "1d" },
                { name: "3 days", value: "3d" },
                { name: "5 days", value: "5d" },
                { name: "1 week", value: "1w" },
                { name: "2 weeks", value: "2w" },
                { name: "3 weeks", value: "3w" },
                { name: "1 month", value: "4w" },
              ],
            },
            {
              name: "reason",
              description: "Reason for timing out this user.",
              required: false,
              type: ApplicationCommandOptionType.String,
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
          description: "Remove a timeout to a user.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "target",
              description: "Select a member to remove a timeout from.",
              required: true,
              type: ApplicationCommandOptionType.User,
            },
            {
              name: "reason",
              description: "Reason for untiming out this user.",
              required: false,
              type: ApplicationCommandOptionType.String,
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
