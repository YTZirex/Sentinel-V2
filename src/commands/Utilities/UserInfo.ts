import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  PermissionsBitField,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class UserInfo extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "userinfo",
      description: "Get the informations about a user",
      category: Category.Utilities,
      cooldown: 3,
      dev: false,
      options: [
        {
          name: "target",
          description: "Select a target.",
          type: ApplicationCommandOptionType.User,
          required: false,
        },
      ],
      default_member_permissions:
        PermissionsBitField.Flags.UseApplicationCommands,
      dm_permission: false,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    let target = (interaction.options.getUser("target") ||
      interaction.member) as GuildMember;

    await interaction.deferReply({ ephemeral: false });

    let fetchedMember = await target.fetch();

    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(fetchedMember.user.accentColor || "Blurple")
          .setThumbnail(fetchedMember.displayAvatarURL({ size: 64 }))
          .setAuthor({
            name: `${fetchedMember.user.tag}'s profile`,
            iconURL: fetchedMember.displayAvatarURL(),
          })
          .setDescription(
            `

                            __**User Info**__
                            > **ID:** ${fetchedMember.user.id}
                            > **Bot:** ${fetchedMember.user.bot ? "✅" : "❌"}
                            > **Account Created:** <t:${(
                              fetchedMember.user.createdTimestamp / 1000
                            ).toFixed(0)}:D>

                            __**Member Info**__
                            > **Nickname:** ${
                              fetchedMember.nickname ||
                              fetchedMember.user.username
                            }
                            > **Roles:** ${
                              fetchedMember.roles.cache.size - 1
                            }: ${
              fetchedMember.roles.cache
                .map((r) => r)
                .join(", ")
                .replace("@everyone", "") || "None"
            }
                            > **Administrator Permission:** ${
                              fetchedMember.permissions.has(
                                PermissionsBitField.Flags.Administrator
                              )
                                ? "✅"
                                : "❌"
                            }
                            > **Joined:** <t:${(
                              fetchedMember.joinedTimestamp! / 1000
                            ).toFixed(0)}:D>
                            > **Join Position:** ${
                              this.GetJoinPosition(
                                interaction,
                                fetchedMember
                              )! + 1
                            } / ${interaction.guild?.memberCount}
                            `
          ),
      ],
    });
  }
  GetJoinPosition(
    interaction: ChatInputCommandInteraction,
    target: GuildMember
  ) {
    let pos = null;
    const joinPosition = interaction.guild?.members.cache.sort(
      (a, b) => a.joinedTimestamp! - b.joinedTimestamp!
    )!;
    Array.from(joinPosition).find((member, index) => {
      if (member[0] == target.user.id) {
        pos = index;
      }
    });
    return pos;
  }
}