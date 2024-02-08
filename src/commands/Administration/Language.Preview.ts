import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import GuildConfig from "../../base/schemas/GuildConfig";
import CommandCounter from "../../base/schemas/CommandCounter";

export default class LanguagePreview extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "language.preview",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    let errorEmbed = new EmbedBuilder().setColor("Red").setTitle("Oops!");

    let commandCounter = await CommandCounter.findOne({ global: 1 });
    commandCounter!.language.languagePreview.used += 1;
    await commandCounter?.save();

    try {
      let guild = await GuildConfig.findOne({
        id: interaction.guildId,
      });

      if (guild && guild?.language) {
        return interaction.editReply({
          embeds: [
            {
              color: 0x33cc99,
              description: `${
                guild.language === "fr"
                  ? "Bonjour! Le bot est actuellement en **Français** !"
                  : "Hello! The bot is currently in **English** !"
              }`,
            },
          ],
        });
      } else {
        return interaction.editReply({
          embeds: [
            {
              title: "Hello! The bot is currently in **English** !",
              color: 0x33cc99,
            },
          ],
        });
      }
    } catch (err) {
      console.log(err);
    }
  }
}
