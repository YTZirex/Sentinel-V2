import {
  ApplicationCommandOptionType,
  ChannelType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionsBitField,
  TextChannel,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import GuildConfig from "../../base/schemas/GuildConfig";
import CommandCounter from "../../base/schemas/CommandCounter";

export default class Slowmode extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "slowmode",
      description: "Set the slowmode of a channel.",
      category: Category.Administration,
      default_member_permissions: PermissionsBitField.Flags.ManageMessages,
      dm_permission: false,
      cooldown: 5,
      dev: false,
      options: [
        {
          name: "rate",
          description: "Select the slowmode message rate.",
          required: true,
          type: ApplicationCommandOptionType.Integer,
          choices: [
            {
              name: "None",
              value: "0",
            },
            {
              name: "5 seconds",
              value: "5",
            },
            {
              name: "10 seconds",
              value: "10",
            },
            {
              name: "15 seconds",
              value: "15",
            },
            {
              name: "30 seconds",
              value: "30",
            },
            {
              name: "1 minute",
              value: "60",
            },
            {
              name: "2 minutes",
              value: "120",
            },
            {
              name: "5 minutes",
              value: "300",
            },
            {
              name: "10 minutes",
              value: "600",
            },
            {
              name: "15 minutes",
              value: "900",
            },
            {
              name: "30 minutes",
              value: "1800",
            },
            {
              name: "1 hour",
              value: "3600",
            },
            {
              name: "2 hours",
              value: "7200",
            },
            {
              name: "6 hours",
              value: "21600",
            },
          ],
        },
        {
          name: "channel",
          description: "Select the channel.",
          required: false,
          type: ApplicationCommandOptionType.Channel,
          channel_types: [ChannelType.GuildText],
        },
        {
          name: "silent",
          description: "Don't send a message in the channel.",
          required: false,
          type: ApplicationCommandOptionType.Boolean,
        },
        {
          name: "reason",
          description: "Reason for the slowmode.",
          required: false,
          type: ApplicationCommandOptionType.String,
        },
      ],
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    let rate = interaction.options.getInteger("rate")!;
    let channel = (interaction.options.getChannel("channel") ||
      interaction.channel!) as TextChannel;
    let silent = interaction.options.getBoolean("silent") || false;
    let reason =
      interaction.options.getString("reason") || "No reason was provided.";

      let commandCounter = await CommandCounter.findOne({ global: 1 });
      commandCounter!.slowmode.used += 1;
      await commandCounter?.save();

    const errorEmbed = new EmbedBuilder().setColor("Red").setTitle("Oops!");

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
          PermissionsBitField.Flags.ManageChannels
        )
      )
        return interaction.reply({
          embeds: [
            {
              color: 0xff6666,
              description: `${
                guild.language === "fr"
                  ? "❌ Je n'ai pas la permission **Manage Channels**."
                  : `❌ I don't have the **Manage Channels** permission.`
              }`,
              title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
            },
          ],
          ephemeral: true,
        });

      if (rate < 0 || rate > 21600)
        return interaction.reply({
          embeds: [
            {
              color: 0xff6666,
              description: `${
                guild.language === "fr"
                  ? "❌ Le slowmode peut seulement être entre 0 secondes et 6 heures."
                  : `❌ You can only set slowmode between 0 seconds and 6 hours.`
              }`,
              title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
            },
          ],
          ephemeral: true,
        });

      try {
        channel.setRateLimitPerUser(rate, reason);
        interaction.reply({
          embeds: [
            {
              color: 0x33cc99,
              thumbnail: { url: interaction.guild?.iconURL()! },
              title: `${
                guild.language === "fr"
                  ? `🕘 Le slowmode est maintenant de ${rate} seconds dans ${channel}.`
                  : `🕘 The slowmode has been set to ${rate} seconds in ${channel}.`
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
                      ? "🕘 Nouveau slowmode !"
                      : "🕘 New slowmode !"
                  }`,
                  thumbnail: { url: interaction.guild?.iconURL()! },
                  fields: [
                    {
                      name: `${
                        guild.language === "fr"
                          ? "Délai d'attente:"
                          : "Message rate:"
                      }`,
                      value: `${rate} seconds`,
                    },
                    {
                      name: `${
                        guild.language === "fr" ? "Modérateur:" : "Moderator:"
                      }`,
                      value: interaction.user.username,
                    },
                    {
                      name: `${
                        guild.language === "fr" ? "Salon:" : "Channel:"
                      }`,
                      value: `${channel}`,
                    },
                  ],
                },
              ],
            })
            .then((x) => x.react("🕘"));
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
                      ? "🕘 Nouveau slowmode !"
                      : "🕘 New slowmode !"
                  }`,
                  thumbnail: { url: interaction.guild?.iconURL()! },
                  fields: [
                    {
                      name: `${
                        guild.language === "fr"
                          ? "Délai d'attente:"
                          : "Message rate:"
                      }`,
                      value: `${rate} seconds`,
                    },
                    {
                      name: `${
                        guild.language === "fr" ? "Modérateur:" : "Moderator:"
                      }`,
                      value: interaction.user.username,
                    },
                    {
                      name: `${
                        guild.language === "fr" ? "Salon:" : "Channel:"
                      }`,
                      value: `${channel}`,
                    },
                  ],
                },
              ],
            })
            .then((x) => x.react("🕘"));
        }
      } catch (err) {
        console.log(err);
        return interaction.reply({
          embeds: [
            {
              color: 0xff6666,
              description: `${
                guild.language === "fr"
                  ? "❌ Une erreur est survenue en essayant de changer le slowmode."
                  : "❌ An error occured while trying to set the slowmode."
              }`,
              title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
            },
          ],
          ephemeral: true,
        });
      }
    } else {
      if (
        !interaction.guild?.members.me?.permissions.has(
          PermissionsBitField.Flags.ManageChannels
        )
      )
        return interaction.reply({
          embeds: [
            {
              color: 0xff6666,
              description: `❌ I don't have the **Manage Channels** permission.`,
              title: "Oops!",
            },
          ],
          ephemeral: true,
        });

      if (rate < 0 || rate > 21600)
        return interaction.reply({
          embeds: [
            {
              color: 0xff6666,
              description: `❌ You can only set slowmode between 0 seconds and 6 hours.`,
              title: "Oops!",
            },
          ],
          ephemeral: true,
        });

      try {
        channel.setRateLimitPerUser(rate, reason);
        interaction.reply({
          embeds: [
            {
              color: 0x33cc99,
              thumbnail: { url: interaction.guild?.iconURL()! },
              title: `🕘 The slowmode has been set to ${rate} seconds in ${channel}.`,
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
                  title: "🕘 New slowmode !",
                  thumbnail: { url: interaction.guild?.iconURL()! },
                  fields: [
                    {
                      name: "Message rate:",
                      value: `${rate} seconds`,
                    },
                    {
                      name: "Moderator:",
                      value: interaction.user.username,
                    },
                    {
                      name: "Channel:",
                      value: `${channel}`,
                    },
                  ],
                },
              ],
            })
            .then((x) => x.react("🕘"));
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
                  title: "🕘 New slowmode !",
                  thumbnail: { url: interaction.guild?.iconURL()! },
                  fields: [
                    {
                      name: "Message rate:",
                      value: `${rate} seconds`,
                    },
                    {
                      name: "Moderator:",
                      value: interaction.user.username,
                    },
                    {
                      name: "Channel:",
                      value: `${channel}`,
                    },
                  ],
                },
              ],
            })
            .then((x) => x.react("🕘"));
        }
      } catch (err) {
        console.log(err);
        return interaction.reply({
          embeds: [
            {
              color: 0xff6666,
              description:
                "❌ An error occured while trying to set the slowmode.",
              title: "Oops!",
            },
          ],
          ephemeral: true,
        });
      }
    }
  }
}
