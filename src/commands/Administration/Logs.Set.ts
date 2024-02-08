import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  Guild,
  TextChannel,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import GuildConfig from "../../base/schemas/GuildConfig";
import CommandCounter from "../../base/schemas/CommandCounter";

export default class LogsSet extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "logs.set",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    const logType = interaction.options.getString("log-type");
    const channel = interaction.options.getChannel("channel") as TextChannel;

    let commandCounter = await CommandCounter.findOne({ global: 1 });
    commandCounter!.logs.logsSet.used += 1;
    await commandCounter?.save();

    await interaction.deferReply({
      ephemeral: true,
    });

    let guild = await GuildConfig.findOne({
      id: interaction.guildId,
    });

    try {

      if (!guild) guild = await GuildConfig.create({ id: interaction.guildId });

      //@ts-ignore
      guild.logs[`${logType}`].channelId = channel.id;

      await guild.save();

      if (guild && guild.language) {
        return interaction.editReply({
          embeds: [
            {
              title: `${guild.language === 'fr' ? "Succès!" : `Success!`}`,
              color: 0x33cc99,
              description: `${guild.language === 'fr' ? `✅ Les logs **${logType}** sont maintenant dans ${channel}.`: `✅ Updated **${logType}** logs to **${channel}**`}`,
            }
          ],
        });
      } else {
        return interaction.editReply({
          embeds: [
            {
              title: `${guild.language === 'fr' ? "Succès!" : `Success!`}`,
              color: 0x33cc99,
              description: `${guild.language === 'fr' ? `✅ Les logs **${logType}** sont maintenant dans ${channel}.`: `✅ Updated **${logType}** logs to **${channel}**`}`,
            }
          ],
        });
      }
    } catch (err) {
      console.log(err);
      if (guild && guild.language) {
      return interaction.editReply({
        embeds: [
          {
            color: 0xff6666,
            title: `${guild.language === 'fr' ? "Oups!" : "Oops!"}`,
            description: `${guild.language === 'fr'? `❌ Une erreur est survenue en mettant à jour la base de donnée. Veuillez réessayer.` : `❌ An error occured while updating the database. Please try again.`}`,
          }
        ],
      });
    } else {
      return interaction.editReply({
        embeds: [
          {
            color: 0xff6666,
            title: 'Oops!',
            description: '❌ An error occured while trying to update the database. Please try again.'
          }
        ]
      })
    }
    }
  }
}
