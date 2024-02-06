import {
  Collection,
  ApplicationCommandOptionType,
  ChannelType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  Message,
  PermissionsBitField,
  TextChannel,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class Clear extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "clear",
      description: "Clears a number of messages",
      options: [
        {
          name: "amount",
          description: "The amount of messages to clear.",
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
        {
          name: "target",
          description: "Select a user to delete messages from.",
          required: false,
          type: ApplicationCommandOptionType.User,
        },
        {
          name: "channel",
          description: "Select a channel to delete messages from.",
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
      ],
      default_member_permissions: PermissionsBitField.Flags.ManageMessages,
      dm_permission: false,
      cooldown: 3,
      dev: false,
      category: Category.Moderation,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    let amount = interaction.options.getInteger("amount")!;
    let channel = (interaction.options.getChannel("channel") ||
      interaction.channel!) as TextChannel;
    let target = interaction.options.getMember("target") as GuildMember;
    let silent = interaction.options.getBoolean("silent") || false;

    const errorEmbed = new EmbedBuilder().setColor("Red").setTitle("Oops!");

    if (
      !interaction.guild?.members.me?.permissions.has(
        PermissionsBitField.Flags.ManageMessages
      )
    )
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "❌ I don't have the `Manage Messages` permission."
          ),
        ],
        ephemeral: true
      });

    if (amount < 1 || amount > 100)
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ You can only delete between 1 and 100 messages at a time.`
          ),
        ],
        ephemeral: true,
      });

    const messages: Collection<
      string,
      Message<true>
    > = await channel.messages.fetch({ limit: 100 });

    var filteredMessages = target
      ? messages.filter((m) => m.author.id === target.id)
      : messages;
    let deleted = 0;

    try {
      deleted = (
        await channel.bulkDelete(
          Array.from(filteredMessages.keys()).slice(0, amount),
          true
        )
      ).size;
    } catch (err) {
      console.log(err);
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ An error occured while trying to delete the messages !`
          ),
        ],
        ephemeral: true,
      });
    }

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("Orange")
          .setTitle(
            `🧹 Deleted **${deleted}** messages${
              target ? ` from ${target}` : ``
            } in ${channel}`
          ),
      ],
      ephemeral: true,
    });

    let guild = await GuildConfig.findOne({ id: interaction.guildId });

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
              .setTitle(`🧹 Messages deleted !`)
              .setThumbnail(interaction.guild?.iconURL()!)
              .addFields(
                {
                  name: "Amount:",
                  value: `${deleted}`,
                },
                {
                  name: "Moderator:",
                  value: interaction.user.username,
                },
                {
                  name: "Channel:",
                  value: `${channel}`,
                }
              ),
          ],
        })
        .then((x) => x.react("🧹"));
    }

    if (!silent) {
      channel
        .send({
          embeds: [
            new EmbedBuilder()
              .setColor("Orange")
              .setTitle(`🧹 Messages deleted !`)
              .setThumbnail(interaction.guild?.iconURL()!)
              .addFields(
                {
                  name: "Amount:",
                  value: `${deleted}`,
                },
                {
                  name: "Moderator:",
                  value: interaction.user.username,
                },
                {
                  name: "Channel:",
                  value: `${channel}`,
                }
              ),
          ],
        })
        .then((x) => x.react("🧹"));
    }
  }
}
