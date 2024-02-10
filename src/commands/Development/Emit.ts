import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Events,
  Guild,
  PermissionsBitField,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class Emit extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "emit",
      description: "Emit an event",
      category: Category.Development,
      dev: true,
      default_member_permissions: PermissionsBitField.Flags.Administrator,
      dm_permission: false,
      cooldown: 3,
      options: [
        {
          name: "event",
          description: "The event to emit",
          required: true,
          type: ApplicationCommandOptionType.String,
          choices: [
            {
              name: "GuildCreate",
              value: Events.GuildCreate,
            },

            {
              name: "GuildDelete",
              value: Events.GuildDelete,
            },
          ],
        },
      ],
    });
  }

  Execute(interaction: ChatInputCommandInteraction) {
    const event = interaction.options.getString("event");

    if (event == Events.GuildCreate || event == Events.GuildDelete) {
      this.client.emit(event, interaction.guild as Guild);
    }

    interaction.reply({
      embeds: [
        {
          color: 0x33cc99,
          description: `✅ Emitted event - \`${event}\``,
        },
      ],
      ephemeral: true,
    });
  }
}
