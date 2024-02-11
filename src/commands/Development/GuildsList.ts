import {
  CacheType,
  ChatInputCommandInteraction,
  PermissionsBitField,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class GuildsList extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "guildslist",
      description: "List all the guilds the bot is in.",
      options: [],
      dm_permission: false,
      default_member_permissions: PermissionsBitField.Flags.Administrator,
      dev: true,
      cooldown: 3,
      category: Category.Development,
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    const guildsInfo: any[] = [];

    // Loop through each guild the bot is in
    this.client.guilds.cache.forEach((guild) => {
      // Create an object containing ID, name, and member count of the guild
      const guildInfo = {
        id: guild.id,
        name: guild.name,
        memberCount: guild.memberCount,
      };

      // Push the guild info object into the array
      guildsInfo.push(guildInfo);
    });

    interaction.reply(`Sent the informations in the console.`);

    // Log the array containing guild information
    console.log("Guilds Information:", guildsInfo);
  }
}
