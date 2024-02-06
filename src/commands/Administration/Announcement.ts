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

export default class Announcement extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "announcement",
      description: "Allows you to send an announcement in the channel.",
      category: Category.Administration,
      dm_permission: false,
      default_member_permissions: PermissionsBitField.Flags.ManageGuild,
      cooldown: 3,
      options: [
        {
          name: "content",
          description: "The content of the announcement.",
          required: true,
          type: ApplicationCommandOptionType.String,
        },
        {
          name: "channel",
          required: false,
          type: ApplicationCommandOptionType.Channel,
          description: "The channel where to send the announcement",
          channel_types: [ChannelType.GuildText, ChannelType.GuildAnnouncement]
        },
      ],
      dev: false,
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    let content = interaction.options.getString("content");
    let channel = (interaction.options.getChannel("channel") ||
      interaction.channel) as TextChannel;

    let errorEmbed = new EmbedBuilder().setTitle("Oops!").setColor("Red");

    if (content!.length > 1024) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "The announcement must be less than 1024 characters!"
          ),
        ],
        ephemeral: true,
      });
    }

    try {
      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setThumbnail(interaction.guild?.iconURL()!)
            .setColor("Yellow")
            .setTitle("📢 Announcement")
            .setDescription((content!).replace(/\|/g, '\n'))
            .setAuthor({
              name: interaction.user.username,
              iconURL: interaction.user.displayAvatarURL(),
            }),
        ],
      });

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Yellow")
            .setDescription("📢 Successfully sent the announcement!"),
        ],
      });

      let guild = await GuildConfig.findOne({ id: interaction.guildId });

      if (
        guild &&
        guild?.logs?.moderation?.enabled &&
        guild?.logs?.moderation?.channelId
      ) {
        try {
          (
            (await interaction.guild?.channels.fetch(
              guild?.logs?.moderation?.channelId
            )) as TextChannel
          ).send({
            embeds: [
              new EmbedBuilder()
                .setThumbnail(interaction.guild?.iconURL()!)
                .setColor("Yellow")
                .setTitle("📢 New Announcement")
                .setDescription((content!).replace(/\|/g, '\n'))
                .setAuthor({
                  name: interaction.user.username,
                  iconURL: interaction.user.displayAvatarURL(),
                }),
            ],
          });
        } catch (err) {}
      }
    } catch (err) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "❌ An error occured while trying to send the announcement."
          ),
        ],
      });
    }
  }
}
