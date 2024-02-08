import {
  ChatInputCommandInteraction,
  CacheType,
  GuildMember,
  EmbedBuilder,
  GuildMemberRoleManager,
  TextChannel,
  PermissionsBitField,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import ms from "ms";
import GuildConfig from "../../base/schemas/GuildConfig";
import CommandCounter from "../../base/schemas/CommandCounter";

export default class TimeoutAdd extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "timeout.add",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getMember("target") as GuildMember;
    const duration = interaction.options.getString("duration") || "5m";
    let reason =
      interaction.options.getString("reason") || "No reason was provided.";
    const silent = interaction.options.getBoolean("silent") || false;
    const msDuration = ms(duration);

    let commandCounter = await CommandCounter.findOne({ global: 1 });
    commandCounter!.timeout.timeoutAdd.used += 1;
    await commandCounter?.save();

    const errorEmbed = new EmbedBuilder().setColor("Red").setTitle(`Oops!`);

    let guild = await GuildConfig.findOne({ id: interaction.guildId });

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

      if (target.id === interaction.user.id)
        return interaction.reply({
          embeds: [
            {
              description: `${
                guild.language === "fr"
                  ? "❌ Vous ne pouvez pas vous timeout vous même."
                  : "❌ You cannot timeout yourself."
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
                  ? `❌ Vous ne pouvez pas timeout un utilisateur avec un rôle égal ou supérieur à vous.`
                  : `❌ You cannot timeout from a user with an equal or higher role than you.`
              }`,
              title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
              color: 0xff6666,
            },
          ],
          ephemeral: true,
        });

      if (
        target.communicationDisabledUntil != null &&
        target.communicationDisabledUntil > new Date()
      )
        return interaction.reply({
          embeds: [
            {
              title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
              color: 0xff6666,
              description: `${
                guild.language === "fr"
                  ? `❌ ${target} est déjà timeout jusqu'au **${target.communicationDisabledUntil.toLocaleDateString()}**`
                  : `❌ ${target} is already timed out until **${target.communicationDisabledUntil.toLocaleDateString()}**`
              }`,
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
                  ? "❌La raison doit contenir moins de 512 charactères."
                  : "❌ Reason must be less than 512 characters."
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
              title: `${
                guild.language === "fr"
                  ? `⏳ Vous avez été timeout sur **${interaction.guild?.name}** !`
                  : `⏳ You have been timed out from **${interaction.guild?.name}** !`
              }`,
              thumbnail: {
                url: interaction.guild?.iconURL()!,
              },
              color: 0xff6633,
              description: `${
                guild.language === "fr"
                  ? "Veuillez contacter le modérateur si vous voulez contester votre sanction."
                  : `If you would like to appeal, please send a message to the moderation who timed you out.`
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
                {
                  name: `${guild.language === "fr" ? "Expire:" : "Expires:"}`,
                  value: `<t:${((Date.now() + msDuration) / 1000).toFixed(
                    0
                  )}:F>`,
                },
              ],
            },
          ],
        });
      } catch (err) {
        console.log(err);
      }

      try {
        await target.timeout(msDuration, reason);
        interaction.reply({
          embeds: [
            {
              color: 0xff6633,
              title: `${
                guild.language === "fr"
                  ? "⏳ L'utilisateur est maintenant time out !"
                  : `⏳ Successfully timed out the user!`
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
                  color: 0xff6633,
                  title: `${
                    guild.language === "fr"
                      ? "⏳ L'utilisateur est maintenant time out !"
                      : `⏳ Successfully timed out the user!`
                  }`,
                  thumbnail: {
                    url: target.displayAvatarURL({ size: 64 }),
                  },
                  fields: [
                    {
                      name: `${
                        guild.language === "fr" ? "Utilisateur: " : "Target:"
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
                      name: `${
                        guild.language === "fr" ? "Raison:" : "Reason:"
                      }`,
                      value: reason,
                    },
                    {
                      name: `${
                        guild.language === "fr" ? "Expire:" : "Expires:"
                      }`,
                      value: `<t:${((Date.now() + msDuration) / 1000).toFixed(
                        0
                      )}:F>`,
                    },
                  ],
                },
              ],
            })
            .then(async (x) => await x.react("⏳"));
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
                  color: 0xff6633,
                  title: `${
                    guild.language === "fr"
                      ? "⏳ Un utilisateur a été timeout !"
                      : `⏳ A user has been timed out!`
                  }`,
                  thumbnail: {
                    url: target.displayAvatarURL({ size: 64 }),
                  },
                  fields: [
                    {
                      name: `${
                        guild.language === "fr" ? "Utilisateur: " : "Target:"
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
                      name: `${
                        guild.language === "fr" ? "Raison:" : "Reason:"
                      }`,
                      value: reason,
                    },
                    {
                      name: `${
                        guild.language === "fr" ? "Expire:" : "Expires:"
                      }`,
                      value: `<t:${((Date.now() + msDuration) / 1000).toFixed(
                        0
                      )}:F>`,
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
              description: `${
                guild.language === "fr"
                  ? "❌ Une erreur est survenue en essayant de time out l'utilisateur."
                  : "❌ An error occured while trying to time out the user."
              }`,
              color: 0xff6666,
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

      if (target.id === interaction.user.id)
        return interaction.reply({
          embeds: [
            {
              description: "❌ You cannot timeout yourself.",
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
              description: `❌ You cannot timeout from a user with an equal or higher role than you.`,
              title: "Oops!",
              color: 0xff6666,
            },
          ],
          ephemeral: true,
        });

      if (
        target.communicationDisabledUntil != null &&
        target.communicationDisabledUntil > new Date()
      )
        return interaction.reply({
          embeds: [
            {
              title: "Oops!",
              color: 0xff6666,
              description: `❌ ${target} is already timed out until **${target.communicationDisabledUntil.toLocaleDateString()}**`,
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

      try {
        await target.send({
          embeds: [
            {
              title: `⏳ You have been timed out from ${interaction.guild?.name}!`,
              thumbnail: {
                url: interaction.guild?.iconURL()!,
              },
              color: 0xff6633,
              description: `If you would like to appeal, please send a message to the moderation who timed you out.`,
              fields: [
                {
                  name: "Moderator:",
                  value: interaction.user.username,
                },
                {
                  name: "Reason:",
                  value: reason,
                },
                {
                  name: "Expires:",
                  value: `<t:${((Date.now() + msDuration) / 1000).toFixed(
                    0
                  )}:F>`,
                },
              ],
            },
          ],
        });
      } catch (err) {
        console.log(err);
      }

      try {
        await target.timeout(msDuration, reason);
        interaction.reply({
          embeds: [
            {
              color: 0xff6633,
              title: `⏳ Successfully timed out the user!`,
            },
          ],
          ephemeral: true,
        });

        if (!silent) {
          interaction.channel
            ?.send({
              embeds: [
                {
                  color: 0xff6633,
                  title: `⏳ Successfully timed out the user!`,
                  thumbnail: {
                    url: target.displayAvatarURL({ size: 64 }),
                  },
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
                    {
                      name: "Expires:",
                      value: `<t:${((Date.now() + msDuration) / 1000).toFixed(
                        0
                      )}:F>`,
                    },
                  ],
                },
              ],
            })
            .then(async (x) => await x.react("⏳"));
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
                  color: 0xff6633,
                  title: `⏳ A user has been timed out!`,
                  thumbnail: {
                    url: target.displayAvatarURL({ size: 64 }),
                  },
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
                    {
                      name: "Expires:",
                      value: `<t:${((Date.now() + msDuration) / 1000).toFixed(
                        0
                      )}:F>`,
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
              description:
                "❌ An error occured while trying to time out the user.",
              color: 0xff6666,
              title: "Oops!",
            },
          ],
          ephemeral: true,
        });
      }
    }
  }
}
