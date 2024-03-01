import { ChatInputCommandInteraction, TextChannel } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import BlacklistedUser from "../../base/schemas/BlacklistedUser";
import { black } from "colors";

export default class BlacklistUpdate extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "blacklist.update",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser("target");
    const reason =
      interaction.options.getString("reason") || "No reason was provided.";

    let blacklistedUser = await BlacklistedUser.findOne({ id: target!.id });

    await interaction.deferReply();

    if (!blacklistedUser)
      return interaction.editReply({
        embeds: [
          {
            color: 0xff6666,
            title: "Oops!",
            description: `${target} is not blacklisted.`,
          },
        ],
      });

    if (blacklistedUser && blacklistedUser.blacklisted === false)
      return interaction.editReply({
        embeds: [
          {
            color: 0xff6666,
            title: "Oops!",
            description: `${target} is not blacklisted.`,
          },
        ],
      });

    if (blacklistedUser && blacklistedUser.blacklisted === true) {
      let mod = `${interaction.user.username} - ${interaction.user.id}`;
      blacklistedUser.moderator = mod;
      blacklistedUser.reason = reason;
      await blacklistedUser.save();
      (
        (await this.client.channels.fetch("1207753995062476810")) as TextChannel
      ).send(
        `# ${target!.username} - ${target!.id} got their blacklist updated by ${
          interaction.user.username
        } - ${interaction.user.id}.\nBlacklist_ID: **${blacklistedUser._id}**`
      );
      return interaction.editReply({
        embeds: [
          {
            color: 0x33cc99,
            title: "Success!",
            description: `${target}'s blacklist has been updated:
                        
                        Reason: ${reason}`,
          },
        ],
      });
    }
  }
}
