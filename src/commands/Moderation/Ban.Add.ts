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
import CommandCounter from "../../base/schemas/CommandCounter";

export default class BanAdd extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "ban.add",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getMember("target") as GuildMember;
    let reason =
      interaction.options.getString("reason") || "No reason was provided.";
    const messages: number = interaction.options.getInteger("messages") || 0;
    const silent = interaction.options.getBoolean("silent") || false;

    let commandCounter = await CommandCounter.findOne({ global: 1 });
    commandCounter!.ban.banAdd.used += 1;
    await commandCounter?.save();

    const errorEmbed = new EmbedBuilder().setColor("Red").setTitle(`Oops!`);

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
            PermissionsBitField.Flags.BanMembers
          )
        )
          return interaction.reply({
            embeds: [
              {
                title: `${guild.language === 'fr' ? "Oups!" :"Oops!"}`,
                color: 0xff6666,
                description: `${guild.language === 'fr' ? "❌Je n'ai pas la permission **Ban Members**" : "❌ I don't have the **Ban Members** permission."}`,
              },
            ],
            ephemeral: true,
          });
  
        if (!target)
          return interaction.reply({
            embeds: [
              {
                title: `${guild.language === 'fr' ? "Oups!" :"Oops!"}`,
                color: 0xff6666,
                description: `${guild.language === 'fr' ? "❌ Veuillez choisir un utilisateur valide." : "❌ Please provide a valid user to ban."}`,
              },
            ],
            ephemeral: true,
          });
  
        if (target.id === interaction.user.id)
          return interaction.reply({
            embeds: [
              {
                color: 0xff6666,
                title: `${guild.language === 'fr' ? "Oups!" :"Oops!"}`,
                description:`${guild.language === 'fr' ? "❌ Vous ne pouvez pas vous bannir vous même." : "❌ You cannot ban yourself."}`,
              },
            ],
            ephemeral: true,
          });
  
        if (
          target.roles.highest.position >=
          (interaction.member?.roles as GuildMemberRoleManager).highest.position
        )
          return interaction.reply({
            embeds: [
              {
                color: 0xff6666,
                title: `${guild.language === 'fr' ? "Oups!" :"Oops!"}`,
                description:
                  `${guild.language === 'fr' ? "❌ Vous ne pouvez pas bannir un utilisateur avec un rôle égal ou supérieur à vous." :"❌ You cannot ban a user with an equal or higher role than you."}`,
              },
            ],
            ephemeral: true,
          });
  
        if (!target.bannable)
          return interaction.reply({
            embeds: [
              {
                color: 0xff6666,
                title: `${guild.language === 'fr' ? "Oups!" :"Oops!"}`,
                description: `${guild.language === 'fr' ? "❌ Cet utilisateur ne peut pas être banni." : "❌ This user cannot be banned."}`,
              },
            ],
            ephemeral: true,
          });
  
        if (reason.length > 512)
          return interaction.reply({
            embeds: [
              {
                title: `${guild.language === 'fr' ? "Oups!" :"Oops!"}`,
                color: 0xff6666,
                description:`${guild.language === 'fr' ? "❌ La raison doit contenir moins de 512 charactères." : "❌ Reason must be less than 512 characters."}`,
              },
            ],
            ephemeral: true,
          });
  
        try {
          await target.send({
            embeds: [
              {
                color: 0xff6666,
                title: `${guild.language === 'fr' ? `Vous avez été banni de **${interaction.guild?.name}** !` :`You have been banned from **${interaction.guild?.name}** !`}`,
                thumbnail: { url: interaction.guild?.iconURL()! },
                description: `${guild.language === 'fr' ? `Veuillez contacter le modérateur si vous voulez contester votre sanction.` : `If you would like to appeal your ban, send a message to the moderator who banned you.`}`,
                fields: [
                  {
                    name: `${guild.language === 'fr' ? "Modérateur:" : "Moderator:"}`,
                    value: interaction.user.username,
                  },
                  {
                    name: `${guild.language === 'fr' ? "Raison" : "Reason:"}`,
                    value: reason,
                  },
                ],
                footer: {
                  text: interaction.user.tag,
                  icon_url: interaction.user.displayAvatarURL({}),
                },
              },
            ],
          });
        } catch (err) {
          console.log(err);
        }
  
        try {
          await target.ban({ deleteMessageSeconds: messages, reason: reason });
  
          interaction.reply({
            embeds: [
              {
                title: `${guild.language === 'fr' ? `🔨 L'utilisateur est banni !`:`🔨 Successfully banned the user!`}`,
                color: 0xff6666,
              },
            ],
            ephemeral: true,
          });
  
          if (!silent) {
            interaction.channel
              ?.send({
                embeds: [
                  {
                    fields: [
                      {
                        name: `${guild.language === 'fr' ? "Utilisateur:" : "Target:"}`,
                        value: target.user.username,
                      },
                      {
                        name: `${guild.language === 'fr' ? "Modérateur:" : "Moderator:"}`,
                        value: interaction.user.username,
                      },
                      {
                        name: `${guild.language === 'fr' ? "Raison" : "Reason:"}`,
                        value: reason,
                      },
                    ],
                    color: 0xff6666,
                    title: `${guild.language === 'fr' ? `🔨 L'utilisateur est banni !`:`🔨 Successfully banned the user!`}`,
                    thumbnail: {
                      url: target.user.displayAvatarURL({ size: 64 }),
                    },
                  },
                ],
              })
              .then(async (x) => await x.react("🔨"));
          }
  
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
                  {
                    fields: [
                      {
                        name: `${guild.language === 'fr' ? "Utilisateur:" : "Target:"}`,
                        value: target.user.username,
                      },
                      {
                        name: `${guild.language === 'fr' ? "Modérateur:" : "Moderator:"}`,
                        value: interaction.user.username,
                      },
                      {
                        name: `${guild.language === 'fr' ? "Raison" : "Reason:"}`,
                        value: reason,
                      },
                    ],
                    title: `${guild.language === 'fr' ? "🔨 Un utilisateur a été banni !":`🔨 A user has been banned!`}`,
                    thumbnail: {
                      url: target.user.displayAvatarURL({ size: 64 }),
                    },
                    color: 0xff6666,
                  },
                ],
              })
              .then(async (x) => x.react("🔨"));
          }
        } catch (err) {
          console.log(err);
          return interaction.reply({
            embeds: [
              {
                color: 0xff6666,
                title: "Oops!",
                description: `${guild.language === 'fr' ? "❌ Une erreur est survenue en essayant de bannir l'utilisateur." :"❌ An error occured while trying to ban the user."}`,
              },
            ],
          });
        }

    } else { // DONT CHANGE DONT CHANGE DONT CHANGE
      if (
        !interaction.guild?.members.me?.permissions.has(
          PermissionsBitField.Flags.BanMembers
        )
      )
        return interaction.reply({
          embeds: [
            {
              title: "Oops!",
              color: 0xff6666,
              description: "❌ I don't have the `Ban Members` permission.",
            },
          ],
          ephemeral: true,
        });

      if (!target)
        return interaction.reply({
          embeds: [
            {
              title: "Oops!",
              color: 0xff6666,
              description: "❌ Please provide a valid user to ban.",
            },
          ],
          ephemeral: true,
        });

      if (target.id === interaction.user.id)
        return interaction.reply({
          embeds: [
            {
              color: 0xff6666,
              title: "Oops!",
              description: "❌ You cannot ban yourself.",
            },
          ],
          ephemeral: true,
        });

      if (
        target.roles.highest.position >=
        (interaction.member?.roles as GuildMemberRoleManager).highest.position
      )
        return interaction.reply({
          embeds: [
            {
              color: 0xff6666,
              title: "Oops!",
              description:
                "❌ You cannot ban a user with an equal or higher role than you.",
            },
          ],
          ephemeral: true,
        });

      if (!target.bannable)
        return interaction.reply({
          embeds: [
            {
              color: 0xff6666,
              title: "Oops!",
              description: "❌ This user cannot be banned.",
            },
          ],
          ephemeral: true,
        });

      if (reason.length > 512)
        return interaction.reply({
          embeds: [
            {
              title: "Oops!",
              color: 0xff6666,
              description: "❌ Reason must be less than 512 characters.",
            },
          ],
          ephemeral: true,
        });

      try {
        await target.send({
          embeds: [
            {
              color: 0xff6666,
              title: `You have been banned from **${interaction.guild?.name}** !`,
              thumbnail: { url: interaction.guild?.iconURL()! },
              description: `If you would like to appeal your ban, send a message to the moderator who banned you.`,
              fields: [
                {
                  name: "Moderator:",
                  value: interaction.user.username,
                },
                {
                  name: "Reason:",
                  value: reason,
                },
              ],
              footer: {
                text: interaction.user.tag,
                icon_url: interaction.user.displayAvatarURL({}),
              },
            },
          ],
        });
      } catch (err) {
        console.log(err);
      }

      try {
        await target.ban({ deleteMessageSeconds: messages, reason: reason });

        interaction.reply({
          embeds: [
            {
              title: `🔨 Successssfully banned ${target.user.username}!`,
              color: 0xff6666,
            },
          ],
          ephemeral: true,
        });

        if (!silent) {
          interaction.channel
            ?.send({
              embeds: [
                {
                  fields: [
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
                  ],
                  color: 0xff6666,
                  title: `🔨 Successfully banned the user!`,
                  thumbnail: {
                    url: target.user.displayAvatarURL({ size: 64 }),
                  },
                },
              ],
            })
            .then(async (x) => await x.react("🔨"));
        }

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
                {
                  fields: [
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
                  ],
                  title: `🔨 A user has been banned!`,
                  thumbnail: {
                    url: target.user.displayAvatarURL({ size: 64 }),
                  },
                  color: 0xff6666,
                },
              ],
            })
            .then(async (x) => x.react("🔨"));
        }
      } catch (err) {
        console.log(err);
        return interaction.reply({
          embeds: [
            {
              color: 0xff6666,
              title: "Oops!",
              description: "❌ An error occured while trying to ban the user.",
            },
          ],
        });
      }
    }
  }
}
