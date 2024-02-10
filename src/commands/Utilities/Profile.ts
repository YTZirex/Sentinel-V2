import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  PermissionsBitField,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import { profileImage } from "discord-arts";
import CommandCounter from "../../base/schemas/CommandCounter";

export default class Profile extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "profile",
      description: "Get a user's profile.",
      category: Category.Utilities,
      default_member_permissions:
        PermissionsBitField.Flags.UseApplicationCommands,
      dm_permission: false,
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
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    let target = (interaction.options.getUser("target") ||
      interaction.member) as GuildMember;

    let commandCounter = await CommandCounter.findOne({ global: 1 });
    commandCounter!.profile.used += 1;
    await commandCounter?.save();

    await interaction.deferReply({ ephemeral: false });

    const buffer = await profileImage(target.id, {
      //borderColor: ["#000000", "#ffffff"],
      badgesFrame: true,
      backgroundBrightness: 100,
      removeAvatarFrame: false,
      moreBackgroundBlur: true,
      // customBackground: 'https://i.imgur.com/LWcWzlc.png',
      presenceStatus: target.presence?.status,
    });

    let attachment = new AttachmentBuilder(buffer).setName(`profile.png`);

    interaction.editReply({
      files: [attachment],
    });
  }
}
