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

export default class BanRemove extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "ban.remove",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getString("target");
    let reason =
      interaction.options.getString("reason") || "No reason was provided.";
    const silent = interaction.options.getBoolean("silent") || false;

    let commandCounter = await CommandCounter.findOne({ global: 1 });
    commandCounter!.ban.banRemove.used += 1;
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
          PermissionsBitField.Flags.BanMembers
        )
      )
        return interaction.reply({
          embeds: [
            {
              title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
              color: 0xff6666,
              description: `${
                guild.language === "fr"
                  ? "❌ Je n'ai pas la permission **Ban Members**."
                  : "❌ I don't have the `Ban Members` permission."
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
              color: 0xff6666,
              description: `${
                guild.language === "fr"
                  ? "❌ La raison doit contenir moins de 512 charactères."
                  : "❌ Reason must be less than 512 characters."
              }`,
            },
          ],
          ephemeral: true,
        });

      try {
        await interaction.guild?.bans.fetch(target!);
      } catch {
        return interaction.reply({
          embeds: [
            {
              color: 0xff6633,
              title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
              description: `${
                guild.language === "fr" ? "❌ Cet utilisateur n'est pas banni." : "❌ This user is not banned."
              }`,
            },
          ],
          ephemeral: true,
        });
      }

      try {
        await interaction.guild?.bans.remove(target!, reason);

        interaction.reply({
          embeds: [
            {
              color: 0x33cc99,
              title: `${guild.language === 'fr' ? `🔨 ${target} est débanni !` :`🔨 Successssfully unbanned ${target}!`}`,
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
                  title: `${guild.language === 'fr' ? `🔨 ${target} est débanni !` :`🔨 Successssfully unbanned ${target}!`}`,
                  fields: [
                    {
                      name: `${guild.language === 'fr' ? "Utilisateur:" :"Target:"}`,
                      value: target!,
                    },
                    {
                      name: `${guild.language === 'fr' ? "Modérateur:" : "Moderator:"}`,
                      value: interaction.user.username,
                    },
                    {
                      name: `${guild.language === 'fr' ? "Raison:" : "Reason:"}`,
                      value: reason,
                    },
                  ],
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
              guild.logs.moderation.channelId
            )) as TextChannel
          )
            .send({
              embeds: [
                {
                  fields: [
                    {
                      name: `${guild.language === 'fr' ? "Utilisateur:" :"Target:"}`,
                      value: target!,
                    },
                    {
                      name: `${guild.language === 'fr' ? "Modérateur:" : "Moderator:"}`,
                      value: interaction.user.username,
                    },
                    {
                      name: `${guild.language === 'fr' ? "Raison:" : "Reason:"}`,
                      value: reason,
                    },
                  ],
                  color: 0x33cc99,
                  title: `${guild.language === 'fr' ? `🔨 Un utilisateur a été débanni !` :`🔨 A user has been unbanned!`}`,
                },
              ],
            })
            .then(async (x) => x.react("🔨"));
        }
      } catch (err) {
        console.log(err);
        return interaction.reply({
          embeds: [
            {
              color: 0xff6666,
              title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
              description:
                `${guild.language === 'fr' ? "❌ Une erreur est survenue en essayant de débannir l'utilisateur." : "❌ An error occured while trying to unban the user."}`,
            },
          ],
        });
      }
    } else {
      // DONT CHANGE DONT CHANGE DONT CHANGE
      if (
        !interaction.guild?.members.me?.permissions.has(
          PermissionsBitField.Flags.BanMembers
        )
      )
        return interaction.reply({
          embeds: [
            {
              title: "Oops!",
              color: 0xff6666,
              description: "❌ I don't have the `Ban Members` permission.",
            },
          ],
          ephemeral: true,
        });

      if (reason.length > 512)
        return interaction.reply({
          embeds: [
            {
              title: "Oops!",
              color: 0xff6666,
              description: "❌ Reason must be less than 512 characters.",
            },
          ],
          ephemeral: true,
        });

      try {
        await interaction.guild?.bans.fetch(target!);
      } catch {
        return interaction.reply({
          embeds: [
            {
              color: 0xff6633,
              title: "Oops!",
              description: "❌ This user is not banned.",
            },
          ],
          ephemeral: true,
        });
      }

      try {
        await interaction.guild?.bans.remove(target!, reason);

        interaction.reply({
          embeds: [
            {
              color: 0x33cc99,
              title: `🔨 Successssfully unbanned ${target}!`,
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
                  title: `🔨 Successssfully unbanned ${target}!`,
                  fields: [
                    {
                      name: "Target:",
                      value: target!,
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
            .then(async (x) => await x.react("🔨"));
        }

        if (
          guild &&
          guild?.logs?.moderation?.enabled &&
          guild?.logs?.moderation?.channelId
        ) {
          (
            (await interaction.guild?.channels.fetch(
              guild.logs.moderation.channelId
            )) as TextChannel
          )
            .send({
              embeds: [
                {
                  fields: [
                    {
                      name: "Target:",
                      value: target!,
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
                  color: 0x33cc99,
                  title: `🔨 A user has been unbanned!`,
                },
              ],
            })
            .then(async (x) => x.react("🔨"));
        }
      } catch (err) {
        console.log(err);
        return interaction.reply({
          embeds: [
            {
              color: 0xff6666,
              title: "Oops!",
              description:
                "❌ An error occured while trying to unban the user.",
            },
          ],
        });
      }
    }
  }
}
