import {
  ApplicationCommandOptionType,
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  GuildMemberRoleManager,
  PermissionsBitField,
  TextChannel,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import GuildConfig from "../../base/schemas/GuildConfig";

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
          description: "Whether or not to delete the messages.",
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
    let reason =
      interaction.options.getString("reason") || "No reason provided.";
    let silent = interaction.options.getBoolean("silent") || false;

    const errorEmbed = new EmbedBuilder().setColor("Red").setTitle(`Oops!`);

    if (!target)
      return interaction.reply({
        embeds: [errorEmbed.setDescription(`❌ Please provide a valid user.`)],
        ephemeral: true,
      });

    if (target.id === interaction.user.id)
      return interaction.reply({
        embeds: [errorEmbed.setDescription(`❌ You cannot kick yourself.`)],
        ephemeral: true,
      });

    if (
      target.roles.highest.position >=
      (interaction.member?.roles as GuildMemberRoleManager).highest.position
    )
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ You cannot kick a user with an equal or higher role than you.`
          ),
        ],
        ephemeral: true,
      });

    if (!target.kickable)
      return interaction.reply({
        embeds: [errorEmbed.setDescription(`❌ This user cannot be kicked.`)],
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
              `🔨 You have been kicked from ${interaction.guild?.name}!`
            )
            .setThumbnail(`${interaction.guild?.iconURL()}`)
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
      });
    } catch (err) {
      console.log(err);
    }

    try {
      await target.kick(reason);
    } catch (err) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "❌ An error occured while trying to kick the user."
          ),
        ],
        ephemeral: true,
      });
      console.log(err);
    }

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("Orange")
          .setTitle(`🔨 Successfully kicked the user!`)],
      ephemeral: true,
    });

    if (!silent) {
      interaction.channel
        ?.send({
          embeds: [
            new EmbedBuilder()
              .setColor("Orange")
              .setTitle(`🔨 Successfully kicked the user!`)
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
        .then(async (x) => await x.react("🔨"));

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
        ).send({
          embeds: [
            new EmbedBuilder()
              .setTitle("🔨 A user has been kicked!")
              .setThumbnail(target.displayAvatarURL({ size: 64 }))
              .setColor('Orange')
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
        });
      }
    }
  }
}
