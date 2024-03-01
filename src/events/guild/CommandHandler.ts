import {
  ChatInputCommandInteraction,
  Collection,
  EmbedBuilder,
  Events,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import Command from "../../base/classes/Command";
import UserConfig from "../../base/schemas/UserConfig";
import BlacklistedUser from "../../base/schemas/BlacklistedUser";
import GuildConfig from "../../base/schemas/GuildConfig";
import Category from "../../base/enums/Category";

export default class CommandHandler extends Event {
  constructor(client: CustomClient) {
    super(client, {
      name: Events.InteractionCreate,
      description: "Command Handler Event",
      once: false,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    let failEmbed = new EmbedBuilder().setTitle(`Oops!`).setColor("Red");

    if (!interaction.isChatInputCommand()) return;

    const command: Command = this.client.commands.get(interaction.commandName)!;

    if (!command)
      return interaction.reply({
        embeds: [
          failEmbed.setDescription(`❌ This command does not seem to exist.`),
        ],
        ephemeral: true,
      });

    let userConfig = await UserConfig.findOne({ id: interaction.user.id });

    if (!userConfig) {
      userConfig = await UserConfig.create({
        id: interaction.user.id,
        dev: false,
        canBlacklist: false,
      });
      await userConfig.save();
    }

    let blacklistedUser = await BlacklistedUser.findOne({
      id: interaction.user.id,
    });

    if (!blacklistedUser) {
      blacklistedUser = await BlacklistedUser.create({
        id: interaction.user.id,
        blacklisted: false,
        reason: "None",
        moderator: "None",
      });
      await blacklistedUser.save();
    }

    if (blacklistedUser.blacklisted === true) {
      let guild = await GuildConfig.findOne({ id: interaction.guildId });
      if (guild && guild.language) {
        return interaction.reply({
          embeds: [
            {
              color: 0xff6666,
              title: guild.language === "fr" ? "Oups!" : "Oops!",
              description:
                guild.language === "fr"
                  ? "❌ Vous êtes actuellement blacklist de Sentinel. Pour contester votre sanction, veuillez rejoindre notre Support."
                  : "❌ You are currently blacklisted from Sentinel. To appeal, please join our Support.",
              thumbnail: { url: this.client.user!.displayAvatarURL() },
            },
          ],
          ephemeral: true,
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 5,
                  url: "https://discord.gg/My2BVCmJEY",
                  label: "Support",
                  emoji: "💬",
                },
              ],
            },
          ],
        });
      } else {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            {
              color: 0xff6666,
              title: "Oops!",
              description: `❌ You are currently blacklisted from Sentinel. To appeal, please join our Support.`,
              thumbnail: {
                url: this.client.user?.displayAvatarURL()!,
              },
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 5,
                  url: "https://discord.gg/My2BVCmJEY",
                  label: "Support",
                  emoji: "💬",
                },
              ],
            },
          ],
        });
      }
    }

    if (
      command.dev &&
      command.category === Category.Blacklist &&
      userConfig.canBlacklist === false
    ) {
      return interaction.reply({
        embeds: [
          {
            color: 0xff6666,
            title: "Oops!",
            description: `❌ You are not allowed to use this command.`,
            thumbnail: {
              url: this.client.user?.displayAvatarURL()!,
            },
          },
        ],
        ephemeral: true,
      });
    }

    if (
      command.dev &&
      command.category !== Category.Blacklist &&
      userConfig.dev === false
    )
      return interaction.reply({
        embeds: [
          failEmbed.setDescription(`❌ This command is only for developers.`),
        ],
        ephemeral: true,
      });

    const { cooldowns } = this.client;

    if (!cooldowns.has(command.name))
      cooldowns.set(command.name, new Collection());

    const now = Date.now();
    const timestamps = cooldowns.get(command.name)!;
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (
      timestamps.has(interaction.user.id) &&
      now < (timestamps.get(interaction.user.id) || 0) + cooldownAmount
    )
      return interaction.reply({
        embeds: [
          failEmbed.setDescription(
            `❌ Please wait another \`${(
              ((timestamps.get(interaction.user.id) || 0) +
                cooldownAmount -
                now) /
              1000
            ).toFixed(1)}\` seconds to run this command.`
          ),
        ],
        ephemeral: true,
      });

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    try {
      const subCommandGroup = interaction.options.getSubcommandGroup(false);
      const subCommand = `${interaction.commandName}${
        subCommandGroup ? `.${subCommandGroup}` : ""
      }.${interaction.options.getSubcommand(false) || ""}`;

      return (
        this.client.subCommands.get(subCommand)?.Execute(interaction) ||
        command.Execute(interaction)
      );
    } catch (err) {
      console.log(err);
    }
  }
}
