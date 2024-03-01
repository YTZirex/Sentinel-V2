import { ChatInputCommandInteraction } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import BlacklistedUser from "../../base/schemas/BlacklistedUser";

export default class BlacklistView extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "blacklist.view",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    let target = interaction.options.getUser("target");
    let blacklistedUser = await BlacklistedUser.findOne({
      id: target!.id,
    });
    await interaction.deferReply();

    if (!blacklistedUser) {
      return interaction.editReply({
        embeds: [
          {
            color: 0xff6666,
            title: "Oops!",
            description: `${target} is not blacklisted.`,
            thumbnail: { url: this.client.user?.displayAvatarURL()! },
          },
        ],
      });
    } else if (blacklistedUser && blacklistedUser.blacklisted === false) {
      return interaction.editReply({
        embeds: [
          {
            color: 0xff6666,
            title: "Oops!",
            description: `${target} is not blacklisted.`,
            thumbnail: { url: this.client.user?.displayAvatarURL()! },
          },
        ],
      });
    } else if (blacklistedUser && blacklistedUser.blacklisted === true) {
      return interaction.editReply({
        embeds: [
          {
            thumbnail: { url: this.client.user?.displayAvatarURL()! },
            description: `
                        > ID: ${target!.id}
                        > Username: ${target!.username}
                        
                        > Blacklisted: ✅
                        > Reason: ${blacklistedUser.reason}
                        > Moderator: ${blacklistedUser.moderator}
                        `,
          },
        ],
      });
    }
  }
}
