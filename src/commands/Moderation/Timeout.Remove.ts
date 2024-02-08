import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  GuildMemberRoleManager,
  PermissionsBitField,
  TextChannel,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import GuildConfig from "../../base/schemas/GuildConfig";
import CommandCounter from "../../base/schemas/CommandCounter";

export default class TimeoutRemove extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "timeout.remove",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    let guild = await GuildConfig.findOne({ id: interaction.guildId });
    const target = interaction.options.getMember("target") as GuildMember;
    let reason =
      interaction.options.getString("reason") || "No reason was provided.";
    const silent = interaction.options.getBoolean("silent") || false;

    const errorEmbed = new EmbedBuilder().setColor("Red").setTitle("Oops!");

    let commandCounter = await CommandCounter.findOne({ global: 1 });
    commandCounter!.timeout.timeoutRemove.used += 1;
    await commandCounter?.save();

    if (guild && guild?.language) {
      reason =
        interaction.options.getString("reason") ||
        `${
          guild.language === "fr"
            ? "Aucune raison fournie."
            : "No reason was provived."
        }`;
      if (
        !interaction.guild?.members.me?.permissions.has(
          PermissionsBitField.Flags.ModerateMembers
        )
      )
        return interaction.reply({
          embeds: [
            {
              description: `${
                guild.language === "fr"
                  ? "❌ Je n'ai pas la permission **Moderate Members** !"
                  : "❌ I don't have the `Moderate Members` permission."
              }`,
              title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
              color: 0xff6666,
            },
          ],
          ephemeral: true,
        });

      if (!target)
        return interaction.reply({
          embeds: [
            {
              description: `${
                guild.language === "fr"
                  ? "❌ Veuillez choisir un utilisateur valide !"
                  : "❌ Please provide a valid user !"
              }`,
              title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
              color: 0xff6666,
            },
          ],
          ephemeral: true,
        });

      if (
        target.roles.highest.position >=
        (interaction.member?.roles as GuildMemberRoleManager).highest.position
      )
        return interaction.reply({
          embeds: [
            {
              description: `${
                guild.language === "fr"
                  ? "❌ Vous ne pouvez pas enlever le timeout d'un utilisateur qui a un role égal ou supérieur à vous."
                  : `❌ You cannot remove a timeout from a user with an equal or higher role than you.`
              }`,
              title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
              color: 0xff6666,
            },
          ],
          ephemeral: true,
        });

      if (reason.length > 512)
        return interaction.reply({
          embeds: [
            {
              title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
              description: `${
                guild.language === "fr"
                  ? "❌ La raison doit contenir moins de 512 charactères !"
                  : "❌ The reason must be less than 512 characters !"
              }`,
              color: 0xff6666,
            },
          ],
          ephemeral: true,
        });

      if (target.isCommunicationDisabled == null)
        return interaction.reply({
          embeds: [
            {
              title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
              description: `${
                guild.language === "fr"
                  ? "❌ L'utilisateur n'est pas timeout."
                  : "❌ This user is not timed out."
              }`,
              color: 0xff6666,
            },
          ],
          ephemeral: true,
        });

      try {
        await target.send({
          embeds: [
            {
              color: 0x33cc99,
              title: `${
                guild.language === "fr"
                  ? `⏳Votre timeout dans **${interaction.guild?.name}** a été enlevé !`
                  : `⏳ Your timeout in **${interaction.guild?.name}** has been removed!`
              }`,
              fields: [
                {
                  name: `${
                    guild.language === "fr" ? "Modérateur:" : "Moderator:"
                  }`,
                  value: interaction.user.username,
                },
                {
                  name: `${guild.language === "fr" ? "Raison:" : "Reason:"}`,
                  value: reason,
                },
              ],
              thumbnail: {
                url: interaction.guild?.iconURL()!,
              },
            },
          ],
        });
      } catch (err) {
        console.log(err);
      }

      try {
        await target.timeout(null, reason);

        interaction.reply({
          embeds: [
            {
              color: 0x33cc99,
              title: `${
                guild.language === "fr"
                  ? "⏳ Le timeout de cette utilisateur a été supprimé !"
                  : `⏳ The timeout for this user has been removed!`
              }`,
            },
          ],
          ephemeral: true,
        });

        if (!silent) {
          interaction.channel
            ?.send({
              embeds: [
                {
                  color: 0x33cc99,
                  thumbnail: {
                    url: target.user.displayAvatarURL({ size: 64 }),
                  },
                  title: `${
                    guild.language === "fr"
                      ? "⏳ Le timeout de cette utilisateur a été supprimé !"
                      : `⏳ The timeout for this user has been removed!`
                  }`,
                  fields: [
                    {
                      name: `${
                        guild.language === "fr" ? "Utilisateur:" : "Target:"
                      }`,
                      value: target.user.username,
                    },
                    {
                      name: `${
                        guild.language === "fr" ? "Modérateur" : "Moderator:"
                      }`,
                      value: interaction.user.username,
                    },
                    {
                      name: `${
                        guild.language === "fr" ? "Raison:" : "Reason:"
                      }`,
                      value: reason,
                    },
                  ],
                },
              ],
            })
            .then((x) => x.react("⏳"));
        }

        if (
          guild &&
          guild?.logs?.moderation?.enabled &&
          guild?.logs?.moderation?.channelId
        ) {
          (
            (await interaction.guild?.channels.fetch(
              guild?.logs?.moderation?.channelId
            )) as TextChannel
          )
            .send({
              embeds: [
                {
                  color: 0x33cc99,
                  thumbnail: {
                    url: target.user.displayAvatarURL({ size: 64 }),
                  },
                  title: `${
                    guild.language === "fr"
                      ? "⏳ Le timeout de cette utilisateur a été supprimé !"
                      : `⏳ The timeout for this user has been removed!`
                  }`,
                  fields: [
                    {
                      name: `${
                        guild.language === "fr" ? "Utilisateur:" : "Target:"
                      }`,
                      value: target.user.username,
                    },
                    {
                      name: `${
                        guild.language === "fr" ? "Modérateur" : "Moderator:"
                      }`,
                      value: interaction.user.username,
                    },
                    {
                      name: `${
                        guild.language === "fr" ? "Raison:" : "Reason:"
                      }`,
                      value: reason,
                    },
                  ],
                },
              ],
            })
            .then((x) => x.react("⏳"));
        }
      } catch (err) {
        console.log(err);
        return interaction.reply({
          embeds: [
            {
              title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
              description: `${
                guild.language === "fr"
                  ? "❌ Une erreur est survenue pendant la suppression du timeout de l'utilisateur."
                  : `❌ An error occured while removing the timeout for this user.`
              }`,
              color: 0xff6666,
            },
          ],
          ephemeral: true,
        });
      }
    } else {
      // DONT CHANGE DONT CHANGE DONT CHANGE
      if (
        !interaction.guild?.members.me?.permissions.has(
          PermissionsBitField.Flags.ModerateMembers
        )
      )
        return interaction.reply({
          embeds: [
            {
              description: "❌ I don't have the `Moderate Members` permission.",
              title: "Oops!",
              color: 0xff6666,
            },
          ],
          ephemeral: true,
        });

      if (!target)
        return interaction.reply({
          embeds: [
            {
              description: "❌ Please provide a valid user.",
              title: "Oops!",
              color: 0xff6666,
            },
          ],
          ephemeral: true,
        });

      if (
        target.roles.highest.position >=
        (interaction.member?.roles as GuildMemberRoleManager).highest.position
      )
        return interaction.reply({
          embeds: [
            {
              description: `❌ You cannot remove a timeout from a user with an equal or higher role than you.`,
              title: "Oops!",
              color: 0xff6666,
            },
          ],
          ephemeral: true,
        });

      if (reason.length > 512)
        return interaction.reply({
          embeds: [
            {
              title: "Oops!",
              description: "❌ Reason must be less than 512 characters.",
              color: 0xff6666,
            },
          ],
          ephemeral: true,
        });

      if (target.isCommunicationDisabled == null)
        return interaction.reply({
          embeds: [
            {
              title: "Oops!",
              description: "❌ This user is not timed out.",
              color: 0xff6666,
            },
          ],
          ephemeral: true,
        });

      try {
        await target.send({
          embeds: [
            {
              color: 0x33cc99,
              title: `⏳ Your timeout in **${interaction.guild?.name}** has been removed!`,
              fields: [
                {
                  name: "Moderator:",
                  value: interaction.user.username,
                },
                {
                  name: "Reason:",
                  value: reason,
                },
              ],
              thumbnail: {
                url: interaction.guild?.iconURL()!,
              },
            },
          ],
        });
      } catch (err) {
        console.log(err);
      }

      try {
        await target.timeout(null, reason);

        interaction.reply({
          embeds: [
            {
              color: 0x33cc99,
              title: `⏳ The timeout for this user has been removed!`,
            },
          ],
          ephemeral: true,
        });

        if (!silent) {
          interaction.channel
            ?.send({
              embeds: [
                {
                  color: 0x33cc99,
                  thumbnail: {
                    url: target.user.displayAvatarURL({ size: 64 }),
                  },
                  title: `⏳ The timeout for this user has been removed !`,
                  fields: [
                    {
                      name: "Target:",
                      value: target.user.username,
                    },
                    {
                      name: "Moderator:",
                      value: interaction.user.username,
                    },
                    {
                      name: "Reason:",
                      value: reason,
                    },
                  ],
                },
              ],
            })
            .then((x) => x.react("⏳"));
        }

        const guild = await GuildConfig.findOne({ id: interaction.guildId });

        if (
          guild &&
          guild?.logs?.moderation?.enabled &&
          guild?.logs?.moderation?.channelId
        ) {
          (
            (await interaction.guild?.channels.fetch(
              guild?.logs?.moderation?.channelId
            )) as TextChannel
          )
            .send({
              embeds: [
                {
                  color: 0x33cc99,
                  thumbnail: {
                    url: target.user.displayAvatarURL({ size: 64 }),
                  },
                  title: `⏳ The timeout for this user has been removed !`,
                  fields: [
                    {
                      name: "Target:",
                      value: target.user.username,
                    },
                    {
                      name: "Moderator:",
                      value: interaction.user.username,
                    },
                    {
                      name: "Reason:",
                      value: reason,
                    },
                  ],
                },
              ],
            })
            .then((x) => x.react("⏳"));
        }
      } catch (err) {
        console.log(err);
        return interaction.reply({
          embeds: [
            {
              title: "Oops!",
              description: `❌ An error occured while removing the timeout for this user.`,
              color: 0xff6666,
            },
          ],
          ephemeral: true,
        });
      }
    }
  }
}
