import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionsBitField,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import * as fs from "fs";

export default class Help extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "help",
      description: "Lists all commands available.",
      category: Category.Utilities,
      dm_permission: false,
      default_member_permissions:
        PermissionsBitField.Flags.UseApplicationCommands,
      cooldown: 3,
      dev: true,
      options: [
        {
          name: "category",
          type: ApplicationCommandOptionType.String,
          choices: [
            {
              name: "Utilities",
              value: "utilities",
            },
            {
              name: "Moderation",
              value: "moderation",
            },
            {
              name: "Economy",
              value: "economy",
            },
            {
              name: "Administration",
              value: "administration",
            },
          ],
        },
      ],
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    let category = interaction.options.getString("category");
    if (!category) {
      return interaction.editReply({
        embeds: [
          {
            color: 0xff6666,
            title: "Oops!",
            description: "❌ Please provide a valid category.",
          },
        ],
      });
    }

    if (category === "utilities") {
      return interaction.editReply({
        embeds: [
          {
            title: "🛠️ Utilities",
            color: 0x6666ff,
            thumbnail: {
              url: interaction.guild?.iconURL()!,
            },
            fields: [
              {
                name: "</botinfo:1204396655840075788>",
                value: `Provides informations about the bot.`,
              },
              {
                name: "</profile:1204177049275732019>",
                value: `Provides the profile of the user selected.`,
              },
              {
                name: "</userinfo:1204183882149138472>",
                value: `Provides informations about the user selected.`,
              },
              {
                name: "</serverinfo:1204396655840075787>",
                value: `Provides informations about the server.`,
              },
            ],
          },
        ],
      });
    }

    if (category === "moderation") {
      return interaction.editReply({
        embeds: [
          {
            color: 0x6666ff,
            thumbnail: {
              url: interaction.guild?.iconURL()!,
            },
            fields: [
              {
                name: "</timeout add:1203786292404682752>",
                value: `Adds a timeout to the user selected.`,
              },
              {
                name: "</timeout remove:1203786292404682752>",
                value: `Removes a timeout from the user selected.`,
              },
              {
                name: "</ban add:1203429758977839174>",
                value: "Bans the selected user from the server.",
              },
              {
                name: "</ban remove:1203429758977839174>",
                value: "Unbans the selected user from the server.",
              },
              {
                name: "</kick:1203779567886536714>",
                value: "Kicks the selected user from the server.",
              },
              {
                name: "</clear:1204118823075188806>",
                value: 'Clears a selected amount of messages in a channel.',
              },
            ],
          },
        ],
      });
    }

    if (category === "economy") {
      return interaction.editReply({
        embeds: [
          {
            color: 0x6666ff,
            thumbnail: {
              url: interaction.guild?.iconURL()!,
            },
          },
        ],
      });
    }

    if (category === "administration") {
      return interaction.editReply({
        embeds: [
          {
            color: 0x6666ff,
            thumbnail: {
              url: interaction.guild?.iconURL()!,
            },
          },
        ],
      });
    }
  }
}
