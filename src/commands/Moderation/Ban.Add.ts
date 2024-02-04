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

export default class BanAdd extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "ban.add",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getMember("target") as GuildMember;
    const reason =
      interaction.options.getString("reason") || "No reason was provided.";
    const messages: number = interaction.options.getInteger("messages") || 0;
    const silent = interaction.options.getBoolean("silent") || false;

    const errorEmbed = new EmbedBuilder().setColor("Red").setTitle(`Oops!`);

    if (!target)
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription("❌ Please provide a valid user to ban."),
        ],
        ephemeral: true,
      });

    if (target.id === interaction.user.id)
      return interaction.reply({
        embeds: [errorEmbed.setDescription("❌ You cannot ban yourself.")],
        ephemeral: true,
      });

    if (
      target.roles.highest.position >=
      (interaction.member?.roles as GuildMemberRoleManager).highest.position
    )
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "❌ You cannot ban a user with a higher or equal role than you."
          ),
        ],
        ephemeral: true,
      });

    if (!target.bannable)
      return interaction.reply({
        embeds: [errorEmbed.setDescription("❌ This user cannot be banned.")],
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
            .setColor("Red")
            .setTitle(
              `You have been banned from **${interaction.guild?.name}**!`
            )
            .setThumbnail(interaction.guild!.iconURL())
            .setDescription(
              `If you would like to appeal your ban, send a message to the moderator who banned you.`
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
            .setTimestamp()
            .setFooter({
              text: interaction.user.tag,
              iconURL: interaction.user.displayAvatarURL({}),
            }),
        ],
      });
    } catch (err) {
      console.log(err);
    }

    try {
      await target.ban({ deleteMessageSeconds: messages, reason: reason });
      
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`🔨 Successssfully banned ${target.user.username}!`)
          .setColor("Red"),
      ],
      ephemeral: true,
    });

    if (!silent) {
      interaction.channel?.send({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle(`🔨 Successfully banned the user!`)
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
      }).then(async(x) => await x.react("🔨"))
    }

    const guild = await GuildConfig.findOne({ id: interaction.guildId });

    if (guild && guild?.logs?.moderation?.enabled && guild?.logs?.moderation?.channelId) {
        (await interaction.guild?.channels.fetch(guild.logs.moderation.channelId) as TextChannel).send({
            embeds: [
                new EmbedBuilder()
            .setColor("Red")
            .setTitle(`🔨 A user has been banned!`)
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
            ]
        }).then(async(x) => x.react("🔨"))
    }
    } catch (err) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "❌ An error occured while trying to ban the user."
          ),
        ],
      });
      console.log(err);
    }

  }
}
