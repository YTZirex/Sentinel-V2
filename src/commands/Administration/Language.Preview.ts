import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class LanguagePreview extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "language.preview",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    let errorEmbed = new EmbedBuilder().setColor("Red").setTitle("Oops!");

    try {
      let guild = await GuildConfig.findOne({
        id: interaction.guildId,
      });

      if (!guild || !(guild.language)) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("Green")
              .setTitle(`Hello! The bot is currently in **English** !`),
          ],
        });
      } else if (guild && guild?.language) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("Green")
              .setDescription(
                `${
                  guild.language === "fr"
                    ? "Bonjour! Le bot est actuellement en **Français** !"
                    : "Hello! The bot is currently in **English** !"
                }`
              ),
          ],
        });
      }
    } catch (err) {
      console.log(err);
    }
  }
}
