import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  Guild,
  TextChannel,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class LogsToggle extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "logs.toggle",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    const logType = interaction.options.getString("log-type");
    const enabled = interaction.options.getBoolean("toggle");

    await interaction.deferReply({
      ephemeral: true,
    });

    try {
      let guild = await GuildConfig.findOne({
        id: interaction.guildId,
      });

      if (!guild) guild = await GuildConfig.create({ id: interaction.guildId });

      //@ts-ignore
      guild.logs[`${logType}`].enabled = enabled;

      await guild.save();

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Success!")
            .setColor("Green")
            .setDescription(
              `✅ ${enabled ? "Enabled" : "Disabled"} **${logType}** logs.`
            ),
        ],
      });
    } catch (err) {
      console.log(err);
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("Oops!")
            .setDescription(
              `❌ An error occured while updating the database. Please try again.`
            ),
        ],
      });
    }
  }
}
