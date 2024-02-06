import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  PermissionsBitField,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import SubCommand from "../../base/classes/SubCommand";

export default class Test extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "test.start",
    });
  }
  Execute(interaction: ChatInputCommandInteraction) {
    interaction.reply({ content: "test start", ephemeral: true });
  }
}
