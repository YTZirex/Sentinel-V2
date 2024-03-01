import {
  ChatInputCommandInteraction,
  CacheType,
  TextChannel,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import BlacklistedUser from "../../base/schemas/BlacklistedUser";
import UserConfig from "../../base/schemas/UserConfig";
import { black } from "colors";

export default class BlacklistAdd extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "blacklist.add",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    let target = interaction.options.getUser("target")!;
    let reason =
      interaction.options.getString("reason") || "No reason was provided.";

    let blacklistedUser = await BlacklistedUser.findOne({ id: target.id });
    let userConfig = await UserConfig.findOne({ id: target.id });

    if (reason.length > 1024)
      return interaction.reply(
        `The reason can not be more than 1024 characters.`
      );

    if (userConfig && userConfig.canBlacklist === true)
      return interaction.reply(
        `${target} has Blacklist Permission. Please remove their permission before blacklisting them.`
      );
    let mod = `${interaction.user.username} - ${interaction.user.id}`;

    if (blacklistedUser && blacklistedUser.blacklisted === true)
      return interaction.reply(
        `${target} is already blacklisted. You can either remove their blacklist or update it.`
      );

    if (!blacklistedUser) {
      blacklistedUser = await BlacklistedUser.create({
        id: target.id,
        blacklisted: true,
        reason: reason,
        moderator: mod,
      });
      await blacklistedUser.save();
      (
        (await this.client.channels.fetch("1207753995062476810")) as TextChannel
      ).send(
        `# ${target.username} - ${target.id} has been blacklisted by ${interaction.user.username} - ${interaction.user.id}.\nBlacklist_ID: **${blacklistedUser._id}**`
      );
      ((await this.client.channels.fetch("1185963458966073517")) as TextChannel)
        .send({
          embeds: [
            {
              color: 0x6666ff,
              title: "🛡️ New Blacklisted User",
              thumbnail: { url: target.displayAvatarURL({ size: 64 }) },
              fields: [
                { name: "User:", value: `${target.username} - ${target.id}` },
                { name: "Reason:", value: reason },
                {
                  name: "Moderator",
                  value: `${interaction.user.username} - ${interaction.user.id}`,
                },
              ],
            },
          ],
        })
        .then((x) => x.react("🛡️"));
      return interaction.reply(`${target} is now blacklisted!`);
    }

    blacklistedUser.blacklisted = true;
    blacklistedUser.reason = reason;
    blacklistedUser.moderator = mod;
    await blacklistedUser.save();
    (
      (await this.client.channels.fetch("1207753995062476810")) as TextChannel
    ).send(
      `# ${target.username} - ${target.id} has been blacklisted by ${interaction.user.username} - ${interaction.user.id}.\nBlacklist_ID: **${blacklistedUser._id}**`
    );
    ((await this.client.channels.fetch("1185963458966073517")) as TextChannel)
      .send({
        embeds: [
          {
            color: 0x6666ff,
            title: "🛡️ New Blacklisted User",
            thumbnail: { url: target.displayAvatarURL({ size: 64 }) },
            fields: [
              { name: "User:", value: `${target.username} - ${target.id}` },
              { name: "Reason:", value: reason },
              {
                name: "Moderator",
                value: `${interaction.user.username} - ${interaction.user.id}`,
              },
            ],
          },
        ],
      })
      .then((x) => x.react("🛡️"));
    return interaction.reply(`${target} is now blacklisted!`);
  }
}
