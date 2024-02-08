import { ChatInputCommandInteraction, TextChannel } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import GuildConfig from "../../base/schemas/GuildConfig";
import Economy from "../../base/schemas/Economy";
import CommandCounter from "../../base/schemas/CommandCounter";

export default class AccountDelete extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "account.delete",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    let confirm = interaction.options.getBoolean("confirm");

    let guild = await GuildConfig.findOne({
      id: interaction.guildId,
    });

    let commandCounter = await CommandCounter.findOne({ global: 1 });
    commandCounter!.account.accountDelete.used += 1;
    await commandCounter?.save();

    let economy = await Economy.findOne({
      user: interaction.user.id,
    });

    if (confirm === false) {
      return interaction.reply({
        embeds: [
          {
            color: 0xff6666,
            title: "❔ Oops!",
            description: `To delete your account, you must select **True**.\nPlease understand that if you delete your account, we can't undo this action.`,
          },
        ],
      });
    }

    if (guild && guild.language) {
      if (!economy) {
        return interaction.reply({
          embeds: [
            {
              description: `${
                guild.language === "fr"
                  ? "❌ Vous ne possédez pas de compte."
                  : "❌ You do not have an account."
              }`,
              title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
              color: 0xff6666,
            },
          ],
          ephemeral: true,
        });
        return;
      } else {
        let tempEconomy = await Economy.findOne({ user: interaction.user.id });
        try {
          (
            (await interaction.client.channels.fetch(
              "1187843483181011004"
            )) as TextChannel
          ).send({
            content: `${
              guild!.language === "fr"
                ? `🗑️ Une procédure de suppression a été lancé sur le compte de ${
                    interaction.user.username
                  }\n_ID: ${tempEconomy!._id}.`
                : `🗑️ A deletion procedure has been initiated on ${
                    interaction.user.username
                  }'s account.\n_ID: ${tempEconomy!._id}.`
            }`,
            embeds: [
              {
                color: 0xff6666,
                thumbnail: {
                  url: (await interaction.user.fetch()).displayAvatarURL({
                    size: 64,
                  }),
                },
                fields: [
                  {
                    name: `${
                      guild.language === "fr"
                        ? "👤 **Noms:**"
                        : "👤 **Fullname:**"
                    }`,
                    value: `${tempEconomy!.names}`,
                  },
                  {
                    name: "\u200a",
                    value: "\u200a",
                  },
                  {
                    name: `${
                      guild.language === "fr"
                        ? "👶 **Date de naissance:**"
                        : "👶 **Date Of Birth:**"
                    }`,
                    value: `${tempEconomy!.dateOfBirth}`,
                  },
                  {
                    name: "\u200a",
                    value: "\u200a",
                  },
                  {
                    name: `${
                      guild.language === "fr"
                        ? "👤 **Sexe:**"
                        : "👤 **Gender:**"
                    }`,
                    value: `${
                      tempEconomy!.gender === "male" ? "Male" : "Female"
                    }`,
                  },
                  {
                    name: "\u200a",
                    value: "\u200a",
                  },
                  {
                    name: `${
                      guild.language === "fr"
                        ? "🏦 **Banque:**"
                        : "🏦 **Bank: **"
                    }`,
                    value: "Sentinel Finance",
                  },
                  {
                    name: "\u200a",
                    value: "\u200a",
                  },
                  {
                    name: `${
                      guild.language === "fr"
                        ? "💸 **Balance:**"
                        : "💸 **Balance: **"
                    }`,
                    value: `${tempEconomy!.balance}`,
                  },
                  {
                    name: "\u200a",
                    value: "\u200a",
                  },
                  {
                    name: `${
                      guild.language === "fr"
                        ? "💳 **Numéro de carte bancaire:**"
                        : "💳 **Credit card number:**"
                    }`,
                    value: `${tempEconomy!.creditCardNumber}`,
                  },
                  {
                    name: "\u200a",
                    value: "\u200a",
                  },
                  {
                    name: `${
                      guild.language === "fr"
                        ? "💳 **Cryptogram:**"
                        : "💳 **Cryptogram:**"
                    }`,
                    value: `${tempEconomy!.cvc}`,
                  },
                  {
                    name: "\u200a",
                    value: "\u200a",
                  },
                  {
                    name: `${
                      guild.language === "fr"
                        ? "💳 **Expire:**"
                        : "💳** Expires:**"
                    }`,
                    value: "11/27",
                  },
                ],
              },
            ],
          });
          let economyDelete = await Economy.findOneAndDelete({
            user: interaction.user.id,
          });

          return interaction.reply({
            embeds: [
              {
                color: 0xff6666,
                description: `${
                  guild.language === "fr"
                    ? "✅ Votre compte a été supprimé avec succès."
                    : "✅ Your account has been deleted successfully."
                }`,
                title: `${guild!.language === "fr" ? "Succès!" : "Success!"}`,
              },
            ],
            ephemeral: true,
          });
        } catch (err) {
          console.log(err);
          return interaction.reply({
            embeds: [
              {
                color: 0xff6666,
                description: `${
                  guild.language === "fr"
                    ? "❌Une erreur est survenue en essayant de supprimer votre compte."
                    : "❌ An error occured while trying to delete your account."
                }`,
                title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
              },
            ],
          });
        }
      }
    } else {
      // DONT CHANGE DONT CHANGE DONT CHANGE
      if (!economy) {
        return interaction.reply({
          embeds: [
            {
              description: "❌ You do not have an account.",
              title: "Oops!",
              color: 0xff6666,
            },
          ],
          ephemeral: true,
        });
      } else {
        let tempEconomy = await Economy.findOne({ user: interaction.user.id });
        try {
          (
            (await interaction.client.channels.fetch(
              "1187843483181011004"
            )) as TextChannel
          ).send({
            content: `🗑️ A deletion procedure has been initiated on ${
              interaction.user.username
            }'s account.\n_ID: ${tempEconomy!._id}.`,
            embeds: [
              {
                color: 0xff6666,
                thumbnail: {
                  url: (await interaction.user.fetch()).displayAvatarURL({
                    size: 64,
                  }),
                },
                fields: [
                  {
                    name: "👤 **Fullname:**",
                    value: `${tempEconomy!.names}`,
                  },
                  {
                    name: "\u200a",
                    value: "\u200a",
                  },
                  {
                    name: "👶 **Date Of Birth:**",
                    value: `${tempEconomy!.dateOfBirth}`,
                  },
                  {
                    name: "\u200a",
                    value: "\u200a",
                  },
                  {
                    name: "👤 **Gender:**",
                    value: `${
                      tempEconomy!.gender === "male" ? "Male" : "Female"
                    }`,
                  },
                  {
                    name: "\u200a",
                    value: "\u200a",
                  },
                  {
                    name: "🏦 **Bank: **",
                    value: "Sentinel Finance",
                  },
                  {
                    name: "\u200a",
                    value: "\u200a",
                  },
                  {
                    name: "💸 **Amount: **",
                    value: "0",
                  },
                  {
                    name: "\u200a",
                    value: "\u200a",
                  },
                  {
                    name: "💳 **Number:**",
                    value: `${tempEconomy!.creditCardNumber}`,
                  },
                  {
                    name: "\u200a",
                    value: "\u200a",
                  },
                  {
                    name: "💳 **Cryptogram:**",
                    value: `${tempEconomy!.cvc}`,
                  },
                  {
                    name: "\u200a",
                    value: "\u200a",
                  },
                  {
                    name: "💳** Expires:**",
                    value: "11/27",
                  },
                ],
              },
            ],
          });
          let economyDelete = await Economy.findOneAndDelete({
            user: interaction.user.id,
          });
          interaction.reply({
            embeds: [
              {
                color: 0xff6666,
                description: "✅ Your account has been deleted successfully.",
                title: "Success!",
              },
            ],
            ephemeral: true,
          });
        } catch (err) {
          console.log(err);
          return interaction.reply({
            embeds: [
              {
                color: 0xff6666,
                description:
                  "❌ An error occured while trying to delete your account.",
                title: "Oops!",
              },
            ],
          });
        }
      }
    }
  }
}
