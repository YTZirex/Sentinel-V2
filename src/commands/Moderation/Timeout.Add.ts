import {
  ChatInputCommandInteraction,
  CacheType,
  GuildMember,
  EmbedBuilder,
  GuildMemberRoleManager,
  TextChannel,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import ms from "ms";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class TimeoutAdd extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "timeout.add",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getMember("target") as GuildMember;
    const duration = interaction.options.getString("duration") || "5m";
    const reason =
      interaction.options.getString("reason") || "No reason was provided.";
    const silent = interaction.options.getBoolean("silent") || false;
    const msDuration = ms(duration);

    const errorEmbed = new EmbedBuilder().setColor("Red").setTitle(`Oops!`);

    if (!target)
      return interaction.reply({
        embeds: [errorEmbed.setDescription("❌ Please provide a valid user.")],
        ephemeral: true,
      });

    if (target.id === interaction.user.id)
      return interaction.reply({
        embeds: [errorEmbed.setDescription("❌ You cannot timeout yourself.")],
        ephemeral: true,
      });

    if (
      target.roles.highest.position >=
      (interaction.member?.roles as GuildMemberRoleManager).highest.position
    )
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "❌ You cannot timeout a user with an equal or higher role than you."
          ),
        ],
        ephemeral: true,
      });

    if (
      target.communicationDisabledUntil != null &&
      target.communicationDisabledUntil > new Date()
    )
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ ${target} is already timed out until **${target.communicationDisabledUntil.toLocaleDateString()}**`
          ),
        ],
        ephemeral: true,
      });

    if (reason.length > 512)
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "❌ Reason must be less than 512 characters."
          ),
        ],
        ephemeral: true,
      });

    try {
      await target.send({
        embeds: [
          new EmbedBuilder()
            .setColor("Orange")
            .setTitle(
              `⏳ You have been timed out from ${interaction.guild?.name}!`
            )
            .setDescription(
              `If you would like to appeal, please send a message to the moderation who timed you out.`
            )
            .setThumbnail(interaction.guild!.iconURL())
            .addFields(
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
                value: `<t:${((Date.now() + msDuration) / 1000).toFixed(0)}:F>`,
              }
            ),
        ],
      });
    } catch (err) {
      console.log(err);
    }

    try {
      await target.timeout(msDuration, reason);
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Orange")
            .setTitle(`⏳ Successfully timed out the user!`),
        ],
        ephemeral: true,
      });

      if (!silent) {
        interaction.channel
          ?.send({
            embeds: [
              new EmbedBuilder()
                .setColor("Orange")
                .setTitle(`⏳ Successfully timed out the user!`)
                .setThumbnail(target.displayAvatarURL({ size: 64 }))
                .addFields(
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
                  }
                ),
            ],
          })
          .then(async (x) => await x.react("⏳"));
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
              new EmbedBuilder()
                .setColor("Orange")
                .setTitle("⏳ A user has been timed out!")
                .setThumbnail(target.displayAvatarURL({ size: 64 }))
                .addFields(
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
                  }
                ),
            ],
          })
          .then((x) => x.react("⏳"));
      }
    } catch (err) {
      console.log(err);
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "❌ An error occured while trying to timeout the user."
          ),
        ],
        ephemeral: true,
      });
    }
  }
}
