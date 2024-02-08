import {
  ApplicationCommandOptionType,
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Guild,
  GuildMember,
  GuildMemberRoleManager,
  PermissionsBitField,
  TextChannel,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import GuildConfig from "../../base/schemas/GuildConfig";
import CommandCounter from "../../base/schemas/CommandCounter";

export default class Kick extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "kick",
      description: "Kicks a user from the server.",
      category: Category.Moderation,
      options: [
        {
          name: "target",
          description: "The user to kick.",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: "reason",
          description: "The reason for kicking the user.",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "silent",
          description: "Don't send a message to the channel.",
          type: ApplicationCommandOptionType.Boolean,
          required: false,
        },
      ],
      default_member_permissions: PermissionsBitField.Flags.KickMembers,
      dm_permission: false,
      cooldown: 5,
      dev: false,
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    let target = interaction.options.getMember("target") as GuildMember;

    let silent = interaction.options.getBoolean("silent") || false;

    let commandCounter = await CommandCounter.findOne({ global: 1 });
    commandCounter!.kick.used += 1;
    await commandCounter?.save();

    const errorEmbed = new EmbedBuilder().setColor("Red").setTitle(`Oops!`);
    let guild = await GuildConfig.findOne({
      id: interaction.guildId,
    });

    let reason =
      interaction.options.getString("reason") || "No reason was provided.";

    if (guild && guild.language) {
      reason =
        interaction.options.getString("reason") ||
        `${
          guild.language === "fr"
            ? "Aucune raison fournie."
            : "No reason was provived."
        }`;
      if (
        !interaction.guild?.members.me?.permissions.has(
          PermissionsBitField.Flags.KickMembers
        )
      )
        return interaction.reply({
          embeds: [
            {
              description: `${
                guild.language === "fr"
                  ? "❌ Je n'ai pas la permission **Kick Members**. "
                  : "❌ I don't have the `Kick Members` permission."
              }`,
              color: 0xff6666,
              title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
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
                  ? "❌ Veuillez choisir un utilisateur valide."
                  : "❌ Please provide a valid user."
              }`,
              color: 0xff6666,
              title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
            },
          ],
          ephemeral: true,
        });

      if (target.id === interaction.user.id)
        return interaction.reply({
          embeds: [
            {
              description: `${
                guild.language === "fr"
                  ? "❌ Vous ne pouvez pas vous expulser vous même."
                  : "❌ You cannot kick yourself."
              }`,
              color: 0xff6666,
              title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
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
                  ? "❌ Vous ne pouvez pas expulser un utilisateur avec un rôle égal ou supérieur à vous."
                  : "❌ You cannot kick a user with an equal or higher role than you."
              }`,
              color: 0xff6666,
              title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
            },
          ],
          ephemeral: true,
        });

      if (!target.kickable)
        return interaction.reply({
          embeds: [
            {
              description: `${
                guild.language === "fr"
                  ? "❌ Cet utilisateur ne peut pas être expulsé."
                  : "❌ This user cannot be kicked."
              }`,
              color: 0xff6666,
              title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
            },
          ],
          ephemeral: true,
        });

      if (reason.length > 512)
        return interaction.reply({
          embeds: [
            {
              description: `${
                guild.language === "fr"
                  ? "❌ La raison doit contenir moins de 512 charactères."
                  : "❌ Reason must be less than 512 characters."
              }`,
              color: 0xff6666,
              title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
            },
          ],
          ephemeral: true,
        });

      try {
        await target.send({
          embeds: [
            {
              color: 0xff6633,
              title: `${
                guild.language === "fr"
                  ? `🔨 Vous avez été expulsé de **${interaction.guild.name}** !`
                  : `🔨 You have been kicked from **${interaction.guild?.name}** !`
              }`,
              fields: [
                {
                  name: `${
                    guild.language === "fr" ? "Modérateur:" : "Moderator:"
                  }`,
                  value: interaction.user.username,
                },
                {
                  name: `${
                    guild.language === "fr" ? "Utilisateur:" : "Target:"
                  }`,
                  value: target.user.username,
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
        await target.kick(reason);
        interaction.reply({
          embeds: [
            {
              color: 0xff6633,
              title: `${
                guild.language === "fr"
                  ? "🔨 L'utilisateur a été expulsé !"
                  : `🔨 Successfully kicked the user!`
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
                  title: `${
                    guild.language === "fr"
                      ? "🔨 L'utilisateur a été expulsé !"
                      : `🔨 Successfully kicked the user!`
                  }`,
                  color: 0xff6633,
                  fields: [
                    {
                      name: `${
                        guild.language === "fr" ? "Utilisateur:" : "Target:"
                      }`,
                      value: target.user.username,
                    },
                    {
                      name: `${
                        guild.language === "fr" ? "Modérateur:" : "Moderator:"
                      }`,
                      value: interaction.user.username,
                    },
                    {
                      name: `${guild.language === "fr" ? "Raison" : "Reason:"}`,
                      value: reason,
                    },
                  ],
                  thumbnail: {
                    url: target.user.displayAvatarURL({ size: 64 }),
                  },
                },
              ],
            })
            .then(async (x) => await x.react("🔨"));
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
          ).send({
            embeds: [
              {
                title: `${
                  guild.language === "fr"
                    ? "🔨 Un utilisateur a été expulsé !"
                    : `🔨 A user has been kicked !`
                }`,
                color: 0xff6633,
                fields: [
                  {
                    name: `${
                      guild.language === "fr" ? "Utilisateur:" : "Target:"
                    }`,
                    value: target.user.username,
                  },
                  {
                    name: `${
                      guild.language === "fr" ? "Modérateur:" : "Moderator:"
                    }`,
                    value: interaction.user.username,
                  },
                  {
                    name: `${guild.language === "fr" ? "Raison" : "Reason:"}`,
                    value: reason,
                  },
                ],
                thumbnail: {
                  url: target.user.displayAvatarURL({ size: 64 }),
                },
              },
            ],
          });
        }
      } catch (err) {
        console.log(err);
        return interaction.reply({
          embeds: [
            {
              color: 0xff6666,
              description: `${
                guild.language === "fr"
                  ? "❌ Une erreur est survenue en essayant d'expulser l'utilisateur."
                  : "❌ An error occured while trying to kick the user."
              }`,
              title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
            },
          ],
          ephemeral: true,
        });
      }
    } else {
      // DONT CHANGE DONT CHANGE DONT CHANGE
      if (
        !interaction.guild?.members.me?.permissions.has(
          PermissionsBitField.Flags.KickMembers
        )
      )
        return interaction.reply({
          embeds: [
            {
              description: "❌ I don't have the `Kick Members` permission.",
              color: 0xff6666,
              title: "Oops!",
            },
          ],
          ephemeral: true,
        });

      if (!target)
        return interaction.reply({
          embeds: [
            {
              description: "❌ Please provide a valid user.",
              color: 0xff6666,
              title: "Oops!",
            },
          ],
          ephemeral: true,
        });

      if (target.id === interaction.user.id)
        return interaction.reply({
          embeds: [
            {
              description: "❌ You cannot kick yourself.",
              color: 0xff6666,
              title: "Oops!",
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
              description:
                "❌ You cannot kick a user with an equal or higher role than you.",
              color: 0xff6666,
              title: "Oops!",
            },
          ],
          ephemeral: true,
        });

      if (!target.kickable)
        return interaction.reply({
          embeds: [
            {
              description: "❌ This user cannot be kicked.",
              color: 0xff6666,
              title: "Oops!",
            },
          ],
          ephemeral: true,
        });

      if (reason.length > 512)
        return interaction.reply({
          embeds: [
            {
              description: "❌ Reason must be less than 512 characters.",
              color: 0xff6666,
              title: "Oops!",
            },
          ],
          ephemeral: true,
        });

      try {
        await target.send({
          embeds: [
            {
              color: 0xff6633,
              title: `🔨 You have been kicked from **${interaction.guild?.name}** !`,
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
        await target.kick(reason);
        interaction.reply({
          embeds: [
            {
              color: 0xff6633,
              title: `🔨 Successfully kicked the user!`,
            },
          ],
          ephemeral: true,
        });

        if (!silent) {
          interaction.channel
            ?.send({
              embeds: [
                {
                  title: `🔨 Successfully kicked the user!`,
                  color: 0xff6633,
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
                  thumbnail: {
                    url: target.user.displayAvatarURL({ size: 64 }),
                  },
                },
              ],
            })
            .then(async (x) => await x.react("🔨"));
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
          ).send({
            embeds: [
              {
                title: `🔨 A user has been kicked !`,
                color: 0xff6633,
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
                thumbnail: {
                  url: target.user.displayAvatarURL({ size: 64 }),
                },
              },
            ],
          });
        }
      } catch (err) {
        console.log(err);
        return interaction.reply({
          embeds: [
            {
              color: 0xff6666,
              description: "❌ An error occured while trying to kick the user.",
              title: "Oops!",
            },
          ],
          ephemeral: true,
        });
      }
    }
  }
}
