import { ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class ServerInfo extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "serverinfo",
      description: "Get informations about the server",
      dm_permission: false,
      default_member_permissions:
        PermissionsBitField.Flags.UseApplicationCommands,
      options: [],
      cooldown: 3,
      dev: false,
      category: Category.Utilities,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    interaction.reply({
      content: "Command not made yet.",
      ephemeral: true,
    });
  }
}
