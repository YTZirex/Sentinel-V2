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

export default class TimeoutRemove extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "timeout.remove",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getMember("target") as GuildMember;
    const reason =
      interaction.options.getString("reason") || "No reason was provided.";
    const silent = interaction.options.getBoolean("silent") || false;

    const errorEmbed = new EmbedBuilder().setColor("Red").setTitle(`Oops!`);

    if (
      !interaction.guild?.members.me?.permissions.has(
        PermissionsBitField.Flags.ModerateMembers
      )
    )
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "❌ I don't have the `Moderate Members` permission."
          ),
        ],
        ephemeral: true
      });

    if (!target)
      return interaction.reply({
        embeds: [errorEmbed.setDescription("❌ Please provide a valid user.")],
        ephemeral: true,
      });

    if (
      target.roles.highest.position >=
      (interaction.member?.roles as GuildMemberRoleManager).highest.position
    )
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "❌ You cannot remove a timeout from a user with an equal or higher role than you."
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

    if (target.isCommunicationDisabled == null)
      return interaction.reply({
        embeds: [errorEmbed.setDescription("❌ This user is not timed out.")],
        ephemeral: true,
      });

    try {
      await target.send({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setTitle(
              `Your timeout in ${interaction.guild?.name} has been removed!`
            )
            .addFields(
              {
                name: "Moderator:",
                value: interaction.user.username,
              },
              {
                name: "Reason:",
                value: reason,
              }
            )
            .setThumbnail(interaction.guild!.iconURL()),
        ],
      });
    } catch (err) {
      console.log(err);
    }

    try {
      await target.timeout(null, reason);

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setTitle("⏳The timeout for this user has been removed!"),
        ],
        ephemeral: true,
      });

      if (!silent) {
        interaction.channel
          ?.send({
            embeds: [
              new EmbedBuilder()
                .setColor("Green")
                .setTitle("⏳The timeout for this user has been removed!")
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
                  }
                ),
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
                new EmbedBuilder()
                  .setColor("Green")
                  .setTitle("⏳ The timeout for this user has been removed!")
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
            "❌ An error occured while trying to remove the timeout."
          ),
        ],
        ephemeral: true,
      });
    }
  }
}
