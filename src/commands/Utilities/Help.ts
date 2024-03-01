import { ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import GuildConfig from "../../base/schemas/GuildConfig";
import CommandCounter from "../../base/schemas/CommandCounter";

export default class Select extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "help",
      description: "Lists all available commands.",
      dm_permission: false,
      default_member_permissions:
        PermissionsBitField.Flags.UseApplicationCommands,
      cooldown: 3,
      dev: false,
      options: [],
      category: Category.Utilities,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    let interactionUserId = interaction.user.id;

    let commandCounter = await CommandCounter.findOne({ global: 1 });
    commandCounter!.help.used += 1;
    await commandCounter?.save();

    let guild = await GuildConfig.findOne({
      id: interaction.guildId,
    });
    if (guild && guild.language) {
      interaction.editReply({
        embeds: [
          {
            title:
              guild.language === "fr"
                ? "Veuillez sélectionner une catégorie de commandes."
                : "Please select a commands category.",
            color: 0x6666ff,
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                type: 3,
                custom_id: "help_select",
                options: [
                  {
                    label:
                      guild.language === "fr" ? "Utilitaires" : "Utilities",
                    value: "utilities",
                    emoji: {
                      name: "🛠️",
                    },
                    //description: "",
                  },
                  {
                    label: guild.language === "fr" ? "Economie" : "Economy",
                    value: "economy",
                    emoji: {
                      name: "💸",
                    },
                  },
                  {
                    label: "Moderation",
                    value: "moderation",
                    emoji: {
                      name: "🛡️",
                    },
                    // description: "bibouuu",
                  },
                  {
                    label: "Administration",
                    value: "administration",
                    emoji: {
                      name: "🔐",
                    },
                  },
                ],
                placeholder:
                  guild.language === "fr"
                    ? "Choisissez une catégorie"
                    : "Pick a category",
                min_values: 1,
                max_values: 1,
              },
            ],
          },
        ],
      });
    } else {
      interaction.editReply({
        embeds: [
          {
            title: "Please select a commands category.",
            color: 0x6666ff,
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                type: 3,
                custom_id: "help_select",
                options: [
                  {
                    label: "Utilities",
                    value: "utilities",
                    emoji: {
                      name: "🛠️",
                    },
                    //description: "",
                  },
                  {
                    label: "Economy",
                    value: "economy",
                    emoji: {
                      name: "💸",
                    },
                  },
                  {
                    label: "Moderation",
                    value: "moderation",
                    emoji: {
                      name: "🛡️",
                    },
                    // description: "bibouuu",
                  },
                  {
                    label: "Administration",
                    value: "administration",
                    emoji: {
                      name: "🔐",
                    },
                  },
                ],
                placeholder: "Pick a category",
                min_values: 1,
                max_values: 1,
              },
            ],
          },
        ],
      });
    }

    this.client.on("interactionCreate", async (interaction) => {
      if (interaction.isStringSelectMenu()) {
        if (interaction.user.id !== interactionUserId) {
          if (guild && guild.language) {
            interaction.reply({
              content: `${
                guild.language === "fr"
                  ? "Ce n'est pas votre commande !"
                  : "This is not your command ! "
              }`,
              ephemeral: true,
            });
          } else {
            interaction.reply({
              content: `This is not your command !`,
              ephemeral: true,
            });
          }

          return;
        }
        if (interaction.customId === "help_select") {
          const [choices] = interaction.values;
          if (guild && guild.language) {
            if (choices === "utilities") {
              interaction.update({
                embeds: [
                  {
                    title:
                      guild.language === "fr"
                        ? "🛠️ Utilitaires"
                        : "🛠️ Utilities",
                    color: 0x6666ff,
                    thumbnail: {
                      url: this.client.user!.displayAvatarURL(),
                    },
                    fields: [
                      {
                        name: "</help:1205979101765173258>",
                        value:
                          guild.language === "fr"
                            ? "Donne des informations sur une catégorie de commandes."
                            : `Provides informations about a category of commands.`,
                      },
                      {
                        name: "</botinfo:1204396655840075788>",
                        value:
                          guild.language === "fr"
                            ? "Donne des informations sur le bot."
                            : `Provides informations about the bot.`,
                      },
                      {
                        name: "</profile:1204177049275732019>",
                        value:
                          guild.language === "fr"
                            ? "Donne le profile de l'utilisateur sélectionné."
                            : `Provides the profile of the user selected.`,
                      },
                      {
                        name: "</userinfo:1204183882149138472>",
                        value:
                          guild.language === "fr"
                            ? "Donne des informations à propos de l'utilisateur sélectionné."
                            : `Provides informations about the user selected.`,
                      },
                      {
                        name: "</serverinfo:1204396655840075787>",
                        value:
                          guild.language === "fr"
                            ? "Donne des informations à propos du serveur."
                            : `Provides informations about the server.`,
                      },
                    ],
                  },
                ],
              });
            } else if (choices === "economy") {
              interaction.update({
                embeds: [
                  {
                    title:
                      guild.language === "fr?" ? "💸 Economie" : "💸 Economy",
                    color: 0x6666ff,
                    thumbnail: {
                      url: this.client.user!.displayAvatarURL(),
                    },
                    fields: [
                      {
                        name: "</account create:1204810971416236072>",
                        value:
                          guild.language === "fr"
                            ? "Créer un nouveau compte bancaire."
                            : "Creates a new bank account.",
                      },
                      {
                        name: "</account delete:1204810971416236072>",
                        value:
                          guild.language === "fr"
                            ? "Supprime votre compte bancaire. Nous ne pouvons pas annuler cette action."
                            : `Deletes your bank account. We can't undo this action.`,
                      },
                      {
                        name: "</job change:1205982914131791973>",
                        value:
                          guild.language === "fr"
                            ? "Vous permet de changer d'emploi."
                            : `Allows you to change your job.`,
                      },
                      {
                        name: "</job informations:1205982914131791973>",
                        value:
                          guild.language === "fr"
                            ? "Donne des informations à propos de votre emploi actuel."
                            : `Provides informations about your current job.`,
                      },
                    ],
                  },
                ],
              });
            } else if (choices === "moderation") {
              interaction.update({
                embeds: [
                  {
                    title:
                      guild.language === "fr"
                        ? "🛡️ Modération"
                        : "🛡️ Moderation",
                    color: 0x6666ff,
                    thumbnail: {
                      url: this.client.user!.displayAvatarURL(),
                    },
                    fields: [
                      {
                        name: "</timeout add:1203786292404682752>",
                        value:
                          guild.language === "fr"
                            ? "Ajoute un timeout à l'utilisateur sélectionné."
                            : `Adds a timeout to the user selected.`,
                      },
                      {
                        name: "</timeout remove:1203786292404682752>",
                        value:
                          guild.language === "fr"
                            ? "Enlève un timeout à l'utilisateur sélectionné."
                            : `Removes a timeout from the user selected.`,
                      },
                      {
                        name: "</ban add:1203429758977839174>",
                        value:
                          guild.language === "fr"
                            ? "Banni l'utilisateur sélectionné du serveur."
                            : "Bans the selected user from the server.",
                      },
                      {
                        name: "</ban remove:1203429758977839174>",
                        value:
                          guild.language === "fr"
                            ? "Enlève le banissement d'un utilisateur sélectionné."
                            : "Unbans the selected user from the server.",
                      },
                      {
                        name: "</kick:1203779567886536714>",
                        value:
                          guild.language === "fr"
                            ? "Expulse l'utilisateur sélectionné du serveur."
                            : "Kicks the selected user from the server.",
                      },
                      {
                        name: "</clear:1204118823075188806>",
                        value:
                          guild.language === "fr"
                            ? "Supprime un nombre de messages sélectionnés dans un salon."
                            : "Clears a selected amount of messages in a channel.",
                      },
                    ],
                  },
                ],
              });
            } else if (choices === "administration") {
              interaction.update({
                embeds: [
                  {
                    title: "🔐 Administration",
                    color: 0x6666ff,
                    thumbnail: {
                      url: this.client.user!.displayAvatarURL(),
                    },
                    fields: [
                      {
                        name: "</announcement:1206014845267480618>",
                        value:
                          guild.language === "fr"
                            ? "Permet de créer une annonce."
                            : `Allows you to create an announcement.`,
                      },
                      {
                        name: "</language set:1206014845267480617>",
                        value:
                          guild.language === "fr"
                            ? "Permet de changer la langue du bot."
                            : `Allows you to change the bot's language.`,
                      },
                      {
                        name: "</language preview:1206014845267480617>",
                        value:
                          guild.language === "fr"
                            ? "Permet de montrer un example de la langue du bot."
                            : `Allows you to preview the bot's language with an example.`,
                      },
                      {
                        name: "</logs set:1206014844785000522>",
                        value:
                          guild.language === "fr"
                            ? "Permet de définir les paramètres des logs du bot"
                            : `Allows you to set the bot's logs settings.`,
                      },
                      {
                        name: "</logs toggle:1206014844785000522>",
                        value:
                          guild.language === "fr"
                            ? "Permet d'activer ou désactiver les logs du bot."
                            : `Allows you to toggle the bot's logs.`,
                      },
                      {
                        name: "</slowmode:1206014844785000521>",
                        value:
                          guild.language === "fr"
                            ? "Permet de changer le slowmode d'un salon."
                            : `Allows you to set the slowmode of a channel.`,
                      },
                    ],
                  },
                ],
              });
            }
          } else {
            if (choices === "utilities") {
              interaction.update({
                embeds: [
                  {
                    title: "🛠️ Utilities",
                    color: 0x6666ff,
                    thumbnail: {
                      url: this.client.user!.displayAvatarURL(),
                    },
                    fields: [
                      {
                        name: "</help:1205979101765173258>",
                        value: `Provides informations about a category of commands.`,
                      },
                      {
                        name: "</botinfo:1204396655840075788>",
                        value: `Provides informations about the bot.`,
                      },
                      {
                        name: "</profile:1204177049275732019>",
                        value: `Provides the profile of the user selected.`,
                      },
                      {
                        name: "</userinfo:1204183882149138472>",
                        value: `Provides informations about the user selected.`,
                      },
                      {
                        name: "</serverinfo:1204396655840075787>",
                        value: `Provides informations about the server.`,
                      },
                    ],
                  },
                ],
              });
            } else if (choices === "economy") {
              interaction.update({
                embeds: [
                  {
                    title: "💸 Economy",
                    color: 0x6666ff,
                    thumbnail: {
                      url: this.client.user!.displayAvatarURL(),
                    },
                    fields: [
                      {
                        name: "</account create:1204810971416236072>",
                        value: "Creates a new bank account.",
                      },
                      {
                        name: "</account delete:1204810971416236072>",
                        value: `Deletes your bank account. We can't undo this action.`,
                      },
                      {
                        name: "</job change:1205982914131791973>",
                        value: `Allows you to change your job.`,
                      },
                      {
                        name: "</job informations:1205982914131791973>",
                        value: `Provides informations about your current job.`,
                      },
                    ],
                  },
                ],
              });
            } else if (choices === "moderation") {
              interaction.update({
                embeds: [
                  {
                    title: "🛡️ Moderation",
                    color: 0x6666ff,
                    thumbnail: {
                      url: this.client.user!.displayAvatarURL(),
                    },
                    fields: [
                      {
                        name: "</timeout add:1203786292404682752>",
                        value: `Adds a timeout to the user selected.`,
                      },
                      {
                        name: "</timeout remove:1203786292404682752>",
                        value: `Removes a timeout from the user selected.`,
                      },
                      {
                        name: "</ban add:1203429758977839174>",
                        value: "Bans the selected user from the server.",
                      },
                      {
                        name: "</ban remove:1203429758977839174>",
                        value: "Unbans the selected user from the server.",
                      },
                      {
                        name: "</kick:1203779567886536714>",
                        value: "Kicks the selected user from the server.",
                      },
                      {
                        name: "</clear:1204118823075188806>",
                        value:
                          "Clears a selected amount of messages in a channel.",
                      },
                    ],
                  },
                ],
              });
            } else if (choices === "administration") {
              interaction.update({
                embeds: [
                  {
                    title: "🔐 Administration",
                    color: 0x6666ff,
                    thumbnail: {
                      url: this.client.user!.displayAvatarURL(),
                    },
                    fields: [
                      {
                        name: "</announcement:1206014845267480618>",
                        value: `Allows you to create an announcement.`,
                      },
                      {
                        name: "</language set:1206014845267480617>",
                        value: `Allows you to change the bot's language.`,
                      },
                      {
                        name: "</language preview:1206014845267480617>",
                        value: `Allows you to preview the bot's language with an example.`,
                      },
                      {
                        name: "</logs set:1206014844785000522>",
                        value: `Allows you to set the bot's logs settings.`,
                      },
                      {
                        name: "</logs toggle:1206014844785000522>",
                        value: `Allows you to toggle the bot's logs settings.`,
                      },
                      {
                        name: "</slowmode:1206014844785000521>",
                        value: `Allows you to set the slowmode of a channel.`,
                      },
                    ],
                  },
                ],
              });
            }
          }
        } else {
          console.log("boop");
        }
      }
    });
  }
}
