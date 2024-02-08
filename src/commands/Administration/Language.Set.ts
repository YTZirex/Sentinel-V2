import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  Guild,
  TextChannel,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import GuildConfig from "../../base/schemas/GuildConfig";
import CommandCounter from "../../base/schemas/CommandCounter";

export default class LanguageSet extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "language.set",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    let chosenLanguage = interaction.options.getString("language");

    let commandCounter = await CommandCounter.findOne({ global: 1 });
    commandCounter!.language.languageSet.used += 1;
    await commandCounter?.save();

    let errorEmbed = new EmbedBuilder().setColor("Red").setTitle("Oops!");
    let guild = await GuildConfig.findOne({
      id: interaction.guildId,
    });
    await interaction.deferReply({
      ephemeral: true,
    });

    if (chosenLanguage === "fr" || chosenLanguage === "en") {
      try {
        if (!guild)
          guild = await GuildConfig.create({ id: interaction.guildId });
        guild.language = chosenLanguage;
        await guild.save();
        interaction.editReply({
          embeds: [
            {
              color: 0x33cc99,
              title: `${chosenLanguage === "fr" ? "Succès!" : "Success!"}`,
              description: `✅ ${
                chosenLanguage === "fr"
                  ? "Le bot est maintenant en **Français** !"
                  : "The bot is now in **English** !"
              }`,
            },
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
                  {
                    color: 0xff6633,
                    thumbnail: { url: interaction.guild?.iconURL()! },
                    title:                       `${
                      chosenLanguage === "fr"
                        ? "Nouvelle langue définie !"
                        : "New language defined !"
                    }`,
                    author: {
                      name: interaction.user.username,
                      icon_url: interaction.user.displayAvatarURL(),
                    }
                  }
                ],
              });
              return;
            }
          }
        } catch (err) {
          console.log(err);
        }
      } catch (err) {
        if (guild && guild.language) {
          return interaction.editReply({
            embeds: [
              {
                color: 0xff6666,
                title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
                description: `${
                  guild.language === "fr"
                    ? "❌ Une erreur est survenue en mettant à jour la base de donnée. Veuillez réessayer."
                    : "❌ An error occured while updating the database. Please try again."
                }`,
              },
            ],
          });
        } else {
          return interaction.editReply({
            embeds: [
              {
                color: 0xff6666,
                title: "Oops!",
                description:
                  "❌ An error occured while trying to update the database. Please try again.",
              },
            ],
          });
        }
      }
    } else {
      let guild = await GuildConfig.findOne({ id: interaction.guildId });
      if (guild && guild?.language) {
        interaction.editReply({
          embeds: [
            {
              title: `${chosenLanguage === "fr" ? "Oups!" : "Oops!"}`,
              description: `${
                chosenLanguage === "fr"
                  ? "❌ Veuillez choisir une langue disponible!"
                  : "❌ Please choose an available language!"
              }`,
              color: 0xff6666,
            },
          ],
        });
      } else {
        if (guild && guild.language) {
          return interaction.editReply({
            embeds: [
              {
                color: 0xff6666,
                title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
                description: `${
                  guild.language === "fr"
                    ? "❌ Veuillez choisir une langue disponible !"
                    : "❌ Please choose an avaialble language !"
                }`,
              },
            ],
          });
        } else {
          return interaction.editReply({
            embeds: [
              {
                color: 0xff6666,
                title: "Oops!",
                description: "❌ Please choose an available language!",
              },
            ],
          });
        }
      }
    }
  }
}
