import { ChatInputCommandInteraction, TextChannel } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import Economy from "../../base/schemas/Economy";
import GuildConfig from "../../base/schemas/GuildConfig";
import CommandCounter from "../../base/schemas/CommandCounter";

export default class AccountCreate extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "account.create",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    let fullname = interaction.options.getString("names");
    let dateOfBirth = interaction.options.getString("date-of-birth");
    let gender = interaction.options.getString("gender");

    let commandCounter = await CommandCounter.findOne({ global: 1 });
    commandCounter!.account.accountCreate.used += 1;
    await commandCounter?.save();

    let guild = await GuildConfig.findOne({
      id: interaction.guildId,
    });

    let economy = await Economy.findOne({
      user: interaction.user.id,
    });

    let fetchedMember = interaction.user.fetch();

    if (economy) {
      if (guild && guild.language) {
        return interaction.reply({
          embeds: [
            {
              title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
              description: `${
                guild.language === "fr"
                  ? "❌ Vous possédez déjà un compte."
                  : "❌ You already have an account."
              }`,
              color: 0xff6666,
            },
          ],
          ephemeral: true,
        });
      } else {
        return interaction.reply({
          embeds: [
            {
              title: "Oops!",
              description: "❌ You already have an account.",
              color: 0xff6666,
            },
          ],
          ephemeral: true,
        });
      }
    } else {
      if (guild && guild.language) {
        const dateOfBirthRegex = /^\d{2}\/\d{2}\/\d{4}$/;
        const eighteenYearsAgo = new Date();
        eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

        if (!dateOfBirthRegex.test(dateOfBirth!)) {
          return await interaction.reply({
            embeds: [
              {
                title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
                color: 0xff6666,
                description: `${
                  guild.language === "fr"
                    ? "❌ Le format de la date de naissance est incorrect. Veuillez utiliser le format JJ/MM/AAAA."
                    : `❌ The date of birth format is incorrect. Please use the DD/MM/YYYY format.`
                }`,
              },
            ],
            ephemeral: true,
          });
        }

        const birthDateParts = dateOfBirth!.split("/");
        const userBirthDate = new Date(
          parseInt(birthDateParts[2], 10),
          parseInt(birthDateParts[1], 10) - 1,
          parseInt(birthDateParts[0], 10)
        );

        if (userBirthDate > eighteenYearsAgo) {
          return await interaction.reply({
            embeds: [
              {
                title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
                color: 0xff6666,
                description: `${
                  guild.language === "fr"
                    ? "❌ Vous devez être majeur pour créer un compte bancaire."
                    : "❌ You must be atleast 18 years old to create an account."
                }`,
              },
            ],
            ephemeral: true,
          });
        }

        if (gender !== "male" && gender !== "female") {
          return interaction;
        }

        if (fullname!.length > 24 || fullname!.length < 6) {
          return interaction.reply({
            embeds: [
              {
                color: 0xff6666,
                title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
                description: `${
                  guild.language === "fr"
                    ? "Vos noms doivent contenir entre 6 et 24 charactères."
                    : "❌ The full name must be between 6 and 24 characters."
                }`,
              },
            ],
            ephemeral: true,
          });
        }

        let uniqueCreditCardNumber = await this.generateCreditCard();
        let crypto = await this.generateRandomNumber();
        try {
          economy = await Economy.create({
            user: interaction.user.id,
            names: fullname,
            dateOfBirth: dateOfBirth,
            gender: gender,
            balance: 0,
            creditCardNumber: uniqueCreditCardNumber,
            cvc: crypto,
            expirationDate: "11/27",
          });
          await economy.save();
          await interaction.reply({
            embeds: [
              {
                color: 0x33cc99,
                title: `${
                  guild.language === "fr"
                    ? "✅ Compte créé !"
                    : "✅ Account created !"
                }`,
                thumbnail: {
                  url: (await fetchedMember).displayAvatarURL({ size: 64 }),
                },
                fields: [
                  {
                    name: `${
                      guild.language === "fr"
                        ? "👤 **Noms:**"
                        : "👤 **Fullname:**"
                    }`,
                    value: `${economy.names}`,
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
                    value: `${economy.dateOfBirth}`,
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
                    value: `${economy.gender === "male" ? "Male" : "Female"}`,
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
                    value: `${economy.balance}`,
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
                    value: `${economy.creditCardNumber}`,
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
                    value: `${economy.cvc}`,
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
            ephemeral: true,
          });
          try {
            if (guild && guild.language) {
              (
                (await interaction.client.channels.fetch(
                  "1187843483181011004"
                )) as TextChannel
              ).send({
                content: `${
                  guild.language === "fr"
                    ? `✅ Un nouveau compte bancaire a été ouvert par ${interaction.user.username}\n_ID: ${economy._id}`
                    : `✅ A new account has been opened by ${interaction.user.username}\n_ID: ${economy._id}`
                }`,
                embeds: [
                  {
                    color: 0x33cc99,
                    title: `${
                      guild.language === "fr"
                        ? "✅ Compte créé !"
                        : "✅ Account created !"
                    }`,
                    thumbnail: {
                      url: (await fetchedMember).displayAvatarURL({ size: 64 }),
                    },
                    fields: [
                      {
                        name: `${
                          guild.language === "fr"
                            ? "👤 **Noms:**"
                            : "👤 **Fullname:**"
                        }`,
                        value: `${economy.names}`,
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
                        value: `${economy.dateOfBirth}`,
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
                          economy.gender === "male" ? "Male" : "Female"
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
                        value: `${economy.balance}`,
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
                        value: `${economy.creditCardNumber}`,
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
                        value: `${economy.cvc}`,
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
            } else {
              (
                (await interaction.client.channels.fetch(
                  "1187843483181011004"
                )) as TextChannel
              ).send({
                content: `✅ A new account has been opened by ${interaction.user.username}\n_ID: ${economy._id}`,
                embeds: [
                  {
                    color: 0x33cc99,
                    title: "✅ Account created !",
                    thumbnail: {
                      url: (await fetchedMember).displayAvatarURL({ size: 64 }),
                    },
                    fields: [
                      {
                        name: "👤 **Fullname:**",
                        value: `${economy.names}`,
                      },
                      {
                        name: "\u200a",
                        value: "\u200a",
                      },
                      {
                        name: "👶 **Date Of Birth:**",
                        value: `${economy.dateOfBirth}`,
                      },
                      {
                        name: "\u200a",
                        value: "\u200a",
                      },
                      {
                        name: "👤 **Gender:**",
                        value: `${
                          economy.gender === "male" ? "Male" : "Female"
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
                        value: `${economy.creditCardNumber}`,
                      },
                      {
                        name: "\u200a",
                        value: "\u200a",
                      },
                      {
                        name: "💳 **Cryptogram:**",
                        value: `${economy.cvc}`,
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
            }
          } catch (err) {
            console.log(err);
          }
        } catch (err) {
          console.log(err);
          return interaction.reply({
            embeds: [
              {
                color: 0xff666,
                title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
                description:
                  "❌ An error occured while trying to update the database.",
              },
            ],
            ephemeral: true,
          });
        }
      } else {
        // DONT CHANGE DONT CHANGE DONT CHANGE
        const dateOfBirthRegex = /^\d{2}\/\d{2}\/\d{4}$/;
        const eighteenYearsAgo = new Date();
        eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

        if (!dateOfBirthRegex.test(dateOfBirth!)) {
          return await interaction.reply({
            embeds: [
              {
                title: "Oops!",
                color: 0xff6666,
                description: `❌ The date of birth format is incorrect. Please use the DD/MM/YYYY format.`,
              },
            ],
            ephemeral: true,
          });
        }

        const birthDateParts = dateOfBirth!.split("/");
        const userBirthDate = new Date(
          parseInt(birthDateParts[2], 10),
          parseInt(birthDateParts[1], 10) - 1,
          parseInt(birthDateParts[0], 10)
        );

        if (userBirthDate > eighteenYearsAgo) {
          return await interaction.reply({
            embeds: [
              {
                title: "Oops!",
                color: 0xff6666,
                description:
                  "❌ You must be atleast 18 years old to create an account.",
              },
            ],
            ephemeral: true,
          });
        }

        if (gender !== "male" && gender !== "female") {
          return interaction;
        }

        if (fullname!.length > 24 || fullname!.length < 6) {
          return interaction.reply({
            embeds: [
              {
                color: 0xff6666,
                title: "Oops!",
                description:
                  "❌ The full name must be between 6 and 24 characters.",
              },
            ],
            ephemeral: true,
          });
        }

        let uniqueCreditCardNumber = await this.generateCreditCard();
        let crypto = await this.generateRandomNumber();
        try {
          economy = await Economy.create({
            user: interaction.user.id,
            names: fullname,
            dateOfBirth: dateOfBirth,
            gender: gender,
            balance: 0,
            creditCardNumber: uniqueCreditCardNumber,
            cvc: crypto,
            expirationDate: "11/27",
          });
          await economy.save();
          await interaction.reply({
            embeds: [
              {
                color: 0x33cc99,
                title: "✅ Account created !",
                thumbnail: {
                  url: (await fetchedMember).displayAvatarURL({ size: 64 }),
                },
                fields: [
                  {
                    name: "👤 **Fullname:**",
                    value: `${economy.names}`,
                  },
                  {
                    name: "\u200a",
                    value: "\u200a",
                  },
                  {
                    name: "👶 **Date Of Birth:**",
                    value: `${economy.dateOfBirth}`,
                  },
                  {
                    name: "\u200a",
                    value: "\u200a",
                  },
                  {
                    name: "👤 **Gender:**",
                    value: `${economy.gender === "male" ? "Male" : "Female"}`,
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
                    value: `${economy.creditCardNumber}`,
                  },
                  {
                    name: "\u200a",
                    value: "\u200a",
                  },
                  {
                    name: "💳 **Cryptogram:**",
                    value: `${economy.cvc}`,
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
            ephemeral: true,
          });
        } catch (err) {
          console.log(err);
          return interaction.reply({
            embeds: [
              {
                color: 0xff666,
                title: "Oops!",
                description:
                  "❌ An error occured while trying to update the database.",
              },
            ],
            ephemeral: true,
          });
        }
      }
    }
  }
  private generateRandomNumber() {
    let randomNumber;

    do {
      randomNumber = Math.floor(Math.random() * 999) + 1;
    } while (randomNumber === 0);

    // Add leading zero for numbers between 1 and 99
    return randomNumber < 100
      ? `00${randomNumber}`.slice(-3)
      : randomNumber.toString();
  }

  private async generateCreditCard() {
    const prefix = "4098 ";

    let isUnique = false;
    let generatedNumber;

    while (!isUnique) {
      const randomDigits = Array.from({ length: 12 }, () =>
        Math.floor(Math.random() * 10)
      ).join("");

      // Add a space every four digits after the prefix
      const formattedNumber = prefix + randomDigits.replace(/(.{4})/g, "$1 ");

      generatedNumber = formattedNumber.trim(); // Remove trailing space

      // Check if the generated number already exists in the database
      const existingRecord = await Economy.findOne({
        creditCardNumber: generatedNumber.toString(),
      });

      if (!existingRecord) {
        isUnique = true;
      }
      // If the number already exists, generate a new one in the next iteration
    }

    return generatedNumber;
  }
}
