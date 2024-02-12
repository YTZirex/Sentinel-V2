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
import CommandCounter from "../../base/schemas/CommandCounter";
import GuildConfig from "../../base/schemas/GuildConfig";

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

    let commandCounter = await CommandCounter.findOne({ global: 1 });
    commandCounter!.userInfo.used += 1;
    await commandCounter?.save();

    await interaction.deferReply({ ephemeral: false });

    let fetchedMember = await target.fetch();

    let guild = await GuildConfig.findOne({ id: interaction.guildId });

    if (guild && guild.language) {
      return interaction.editReply({
        embeds: [
          {
            //@ts-ignore
            color: 0x6666ff,
            thumbnail: {
              url: fetchedMember.user.displayAvatarURL({ size: 64 }),
            },
            author: {
              name: `${
                guild.language === "fr"
                  ? `Profile de ${fetchedMember.user.tag}`
                  : `${fetchedMember.user.tag}'s profile`
              }`,
              icon_url: fetchedMember.displayAvatarURL(),
            },
            description: `
  
            __**${
              guild.language === "fr" ? "Informations Utilisateur" : "User Info"
            }**__
            > **ID:** ${fetchedMember.user.id}
            > **Bot:** ${fetchedMember.user.bot ? "✅" : "❌"}
            > ${
              guild.language === "fr"
                ? "**Compte crée:**"
                : "**Account Created:**"
            } <t:${(fetchedMember.user.createdTimestamp / 1000).toFixed(0)}:D>
  
            __**${
              guild.language === "fr" ? "Informations Membre" : "Member Infos"
            }**__
            > ${guild.language === "fr" ? "**Surnom:**" : "**Nickname:**"} ${
              fetchedMember.nickname || fetchedMember.user.username
            }
            > **Roles:** ${fetchedMember.roles.cache.size - 1}: ${
              fetchedMember.roles.cache
                .map((r) => r)
                .join(", ")
                .replace("@everyone", "") ||
              (guild.language === "fr" ? "Aucun" : "None")
            }
            > ${
              guild.language === "fr"
                ? "**Permission Administrateur:**"
                : "**Administrator Permission:**"
            } ${
              fetchedMember.permissions.has(
                PermissionsBitField.Flags.Administrator
              )
                ? "✅"
                : "❌"
            }
            > **${guild.language === "fr" ? "Rejoint:" : "Joined:"}** <t:${(
              fetchedMember.joinedTimestamp! / 1000
            ).toFixed(0)}:D>
            > ${
              guild.language === "fr" ? "**Position:**" : `**Join Position:**`
            } ${this.GetJoinPosition(interaction, fetchedMember)! + 1} / ${
              interaction.guild?.memberCount
            }
            `,
          },
        ],
      });
    } else {
      // DONT CHANGE DONT CHANGE DONT CHANGE
      return interaction.editReply({
        embeds: [
          {
            //@ts-ignore
            color: 0x6666ff,
            thumbnail: {
              url: fetchedMember.user.displayAvatarURL({ size: 64 }),
            },
            author: {
              name: `${fetchedMember.user.tag}'s profile`,
              icon_url: fetchedMember.displayAvatarURL(),
            },
            description: `
  
            __**User Info**__
            > **ID:** ${fetchedMember.user.id}
            > **Bot:** ${fetchedMember.user.bot ? "✅" : "❌"}
            > **Account Created:** <t:${(
              fetchedMember.user.createdTimestamp / 1000
            ).toFixed(0)}:D>
  
            __**Member Info**__
            > **Nickname:** ${
              fetchedMember.nickname || fetchedMember.user.username
            }
            > **Roles:** ${fetchedMember.roles.cache.size - 1}: ${
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
            > **Joined:** <t:${(fetchedMember.joinedTimestamp! / 1000).toFixed(
              0
            )}:D>
            > **Join Position:** ${
              this.GetJoinPosition(interaction, fetchedMember)! + 1
            } / ${interaction.guild?.memberCount}
            `,
          },
        ],
      });
    }
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
