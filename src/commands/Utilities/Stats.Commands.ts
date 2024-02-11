import { ChatInputCommandInteraction } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import CommandCounter from "../../base/schemas/CommandCounter";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class StatsCommands extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "stats.commands",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    let commandCounter = await CommandCounter.findOne({ global: 1 });
    let guild = await GuildConfig.findOne({ id: interaction.guildId });

    commandCounter!.stats.commands.used += 1;
    await commandCounter?.save();

    await interaction.deferReply();

    if (guild && guild.language) {
      return interaction.editReply({
        embeds: [
          {
            color: 0x6666ff,
            title:
              guild.language === "ffr"
                ? "Statistiques des commandes"
                : `Commands Statistics`,
            thumbnail: { url: this.client.user?.displayAvatarURL()! },
            description: `
                      __**🛠️ ${
                        guild.language === "fr" ? "Utilitaires" : "Utilities"
                      }**__
  
                      > BotInfo: **${commandCounter!.botInfo.used}**
                      > Help: **${commandCounter!.help.used}**
                      > Profile: **${commandCounter!.profile.used}**
                      > ServerInfo: **${commandCounter!.serverInfo.used}**
                      > Stats - Commands: **${
                        commandCounter!.stats.commands.used
                      }**
                      > UserInfo: **${commandCounter!.userInfo.used}**
                      
                      __**💸 ${
                        guild.language === "fr" ? "Economie" : "Economy"
                      }**__
  
                      > Account - Create: **${
                        commandCounter!.account.accountCreate.used
                      }**
                      > Account - Delete: **${
                        commandCounter!.account.accountDelete.used
                      }**
                      > Job - Change: **${commandCounter!.job.jobChange.used}**
                      > Job - Informations: **${
                        commandCounter!.job.jobInformations.used
                      }**
                      
                      __**🛡️ ${
                        guild.language === "fr" ? "Modération" : "Moderation"
                      }**__
  
                      > Clear: **${commandCounter!.clear.used}**
                      > Kick: **${commandCounter!.kick.used}**
                      > Timeout - Add: **${
                        commandCounter!.timeout.timeoutAdd.used
                      }**
                      > Timeout - Remove: **${
                        commandCounter!.timeout.timeoutRemove.used
                      }**
                      > Ban - Add: **${commandCounter!.ban.banAdd.used}**
                      > Ban - Remove: **${commandCounter!.ban.banRemove.used}**
  
                      __**🔐 Administration**__
  
                      > Announcement: **${commandCounter!.announcement.used}**
                      > Language - Set: **${
                        commandCounter!.language.languageSet.used
                      }**
                      > Language - Preview: **${
                        commandCounter!.language.languagePreview.used
                      }**
                      > Logs - Set: **${commandCounter!.logs.logsSet.used}**
                      > Logs - Toggle: **${
                        commandCounter!.logs.logsToggle.used
                      }**
                      > Slowmode: **${commandCounter!.slowmode.used}**
  
                      `,
          },
        ],
      });
    } else {
      // DONT CHANGE DONT CHANGE DONT CHANGE
      return interaction.editReply({
        embeds: [
          {
            color: 0x6666ff,
            title: `Commands Statistics`,
            thumbnail: { url: this.client.user?.displayAvatarURL()! },
            description: `
                      __**🛠️ Utilities**__
  
                      > BotInfo: **${commandCounter!.botInfo.used}**
                      > Help: **${commandCounter!.help.used}**
                      > Profile: **${commandCounter!.profile.used}**
                      > ServerInfo: **${commandCounter!.serverInfo.used}**
                      > Stats - Commands: **${
                        commandCounter!.stats.commands.used
                      }**
                      > UserInfo: **${commandCounter!.userInfo.used}**
                      
                      __**💸 Economy**__
  
                      > Account - Create: **${
                        commandCounter!.account.accountCreate.used
                      }**
                      > Account - Delete: **${
                        commandCounter!.account.accountDelete.used
                      }**
                      > Job - Change: **${commandCounter!.job.jobChange.used}**
                      > Job - Informations: **${
                        commandCounter!.job.jobInformations.used
                      }**
                      
                      __**🛡️ Moderation**__
  
                      > Clear: **${commandCounter!.clear.used}**
                      > Kick: **${commandCounter!.kick.used}**
                      > Timeout - Add: **${
                        commandCounter!.timeout.timeoutAdd.used
                      }**
                      > Timeout - Remove: **${
                        commandCounter!.timeout.timeoutRemove.used
                      }**
                      > Ban - Add: **${commandCounter!.ban.banAdd.used}**
                      > Ban - Remove: **${commandCounter!.ban.banRemove.used}**
  
                      __**🔐 Administration**__
  
                      > Announcement: **${commandCounter!.announcement.used}**
                      > Language - Set: **${
                        commandCounter!.language.languageSet.used
                      }**
                      > Language - Preview: **${
                        commandCounter!.language.languagePreview.used
                      }**
                      > Logs - Set: **${commandCounter!.logs.logsSet.used}**
                      > Logs - Toggle: **${
                        commandCounter!.logs.logsToggle.used
                      }**
                      > Slowmode: **${commandCounter!.slowmode.used}**
  
                      `,
          },
        ],
      });
    }
  }
}
