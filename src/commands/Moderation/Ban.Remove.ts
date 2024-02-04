import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  GuildMemberRoleManager,
  TextChannel,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class BanRemove extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "ban.remove",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getString("target");
    const reason =
      interaction.options.getString("reason") || "No reason was provided.";
    const silent = interaction.options.getBoolean("silent") || false;

    const errorEmbed = new EmbedBuilder().setColor("Red").setTitle(`Oops!`);

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
      await interaction.guild?.bans.fetch(target!);
    } catch {
      return interaction.reply({
        embeds: [errorEmbed.setDescription("❌ This user is not banned.")],
        ephemeral: true,
      });
    }

    try {
      await interaction.guild?.bans.remove(target!, reason);
    } catch (err) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "❌ An error occured while trying to unban the user."
          ),
        ],
      });
      console.log(err);
    }

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`🔨 Successssfully unbanned ${target}!`)
          .setColor("Green"),
      ],
      ephemeral: true,
    });

    if (!silent) {
      interaction.channel
        ?.send({
          embeds: [
            new EmbedBuilder()
              .setColor("Green")
              .setTitle(`🔨 Successfully unbanned the user!`)
              .addFields(
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
                }
              ),
          ],
        })
        .then(async (x) => await x.react("🔨"));
    }

    const guild = await GuildConfig.findOne({ id: interaction.guildId });

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
            new EmbedBuilder()
              .setColor("Green")
              .setTitle(`🔨 A user has been unbanned!`)
              .addFields(
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
                }
              ),
          ],
        })
        .then(async (x) => x.react("🔨"));
    }
  }
}
