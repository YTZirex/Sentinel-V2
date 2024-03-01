import SubCommand from "../../base/classes/SubCommand";
import CustomClient from "../../base/classes/CustomClient";
import { ChatInputCommandInteraction, TextChannel } from "discord.js";
import BlacklistedUser from "../../base/schemas/BlacklistedUser";
export default class BlacklistRemove extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "blacklist.remove",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    let target = interaction.options.getUser("target")!;

    let blacklistedUser = await BlacklistedUser.findOne({ id: target.id });

    if (!blacklistedUser)
      return interaction.reply(`${target} is not  blacklisted !`);

    if (blacklistedUser.blacklisted === false)
      return interaction.reply(`${target} is not blacklisted !`);

    await BlacklistedUser.findOneAndDelete({ id: target.id });
    (
      (await this.client.channels.fetch("1207753995062476810")) as TextChannel
    ).send(`# ${target.username} - ${target.id} was removed from the blacklist by ${interaction.user.username} - ${interaction.user.id}`);
    return interaction.reply(`${target} is removed from the blacklist !`);
  }
}
