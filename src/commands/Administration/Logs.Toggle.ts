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

export default class LogsToggle extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "logs.toggle",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    const logType = interaction.options.getString("log-type");
    const enabled = interaction.options.getBoolean("toggle");

    let commandCounter = await CommandCounter.findOne({ global: 1 });
    commandCounter!.logs.logsToggle.used += 1;
    await commandCounter?.save();

    let guild = await GuildConfig.findOne({
      id: interaction.guildId,
    });

    await interaction.deferReply({
      ephemeral: true,
    });

    try {
      if (!guild) guild = await GuildConfig.create({ id: interaction.guildId });

      //@ts-ignore
      guild.logs[`${logType}`].enabled = enabled;

      await guild.save();

      if (guild && guild.language) {
        return interaction.editReply({
          embeds: [
            {
              color: 0x33cc99,
              title: `${guild.language === "fr" ? "Succès!" : "Success!"}`,
              description: `${
                guild.language === "fr"
                  ? `✅ J'ai ${
                      enabled ? "activé" : "désactivé"
                    } **${logType}** les logs.`
                  : `✅ ${
                      enabled ? "Enabled" : "Disabled"
                    } **${logType}** logs.`
              }`,
            },
          ],
        });
      } else {
        return interaction.editReply({
          embeds: [
            {
              color: 0x33cc99,
              title: "Success!",
              description: `✅ ${
                enabled ? "Enabled" : "Disabled"
              } **${logType}** logs.`,
            },
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
              title: "Oops!",
              description: `${
                guild.language === "fr"
                  ? "❌ Une erreur est survenue en mettant à jour la base de donnée. Veuillez réessayer."
                  : "❌ An error occured while updating the database. Please try again."
              }`,
            },
          ],
        });
      } else {
        return interaction.editReply({
          embeds: [
            {
              color: 0xff6666,
              title: "Oops!",
              description:
                "❌ An error occured while updating the database. Please try again.",
            },
          ],
        });
      }
    }
  }
}
