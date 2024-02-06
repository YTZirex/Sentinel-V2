import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  Guild,
  TextChannel,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class LanguageSet extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "language.set",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    let chosenLanguage = interaction.options.getString("language");

    let errorEmbed = new EmbedBuilder().setColor("Red").setTitle("Oops!");

    await interaction.deferReply({
      ephemeral: true,
    });

    if (chosenLanguage === "fr" || chosenLanguage === "en") {
      try {
        let guild = await GuildConfig.findOne({
          id: interaction.guildId,
        });

        if (!guild)
          guild = await GuildConfig.create({ id: interaction.guildId });
        guild.language = chosenLanguage;
        await guild.save();
        interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("Green")
              .setTitle(`${chosenLanguage === "fr" ? "Succès!" : "Success!"}`)
              .setDescription(
                `✅ ${
                  chosenLanguage === "fr"
                    ? "Le bot est maintenant en **Français** !"
                    : "The bot is now in **English** !"
                }`
              ),
          ],
        });
        try {
          if (
            guild &&
            guild?.logs?.moderation?.enabled &&
            guild?.logs?.moderation?.channelId
          ) {
            if (guild?.language) {
              (
                (await interaction.guild?.channels.fetch(
                  guild?.logs?.moderation?.channelId!
                )) as TextChannel
              ).send({
                embeds: [
                  new EmbedBuilder()
                    .setColor("Yellow")
                    .setThumbnail(interaction.guild?.iconURL()!)
                    .setTitle(
                      `${
                        chosenLanguage === "fr"
                          ? "Nouvelle langue définie !"
                          : "New language defined !"
                      }`
                    )
                    .setDescription(
                      `${
                        chosenLanguage === "fr"
                          ? "Le bot est maintenant en **Français** !"
                          : "The bot is now in **English** !"
                      }`
                    )
                    .setAuthor({
                      name: interaction.user.username,
                      iconURL: interaction.user.displayAvatarURL(),
                    }),
                ],
              });
              return;
            }
          }
        } catch (err) {
          console.log(err);
        }
      } catch (err) {
        return interaction.editReply({
          embeds: [
            errorEmbed.setDescription(
              "❌ An error occured while updating the database. Please try again."
            ),
          ],
        });
      }
    } else {
      let guild = await GuildConfig.findOne({ id: interaction.guildId });
      if (guild && guild?.language) {
        interaction.editReply({
          embeds: [
            errorEmbed
              .setTitle(`${chosenLanguage === "fr" ? "Oups!" : "Oops!"}`)
              .setDescription(
                `${
                  chosenLanguage === "fr"
                    ? "❌ Veuillez choisir une langue disponible!"
                    : "❌ Please choose an available language!"
                }`
              ),
          ],
        });
      } else {
        return interaction.editReply({
          embeds: [
            errorEmbed.setDescription(
              `❌ Please choose an available language !`
            ),
          ],
        });
      }
    }
  }
}
