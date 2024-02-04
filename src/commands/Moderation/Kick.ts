import { ApplicationCommandOptionType, CacheType, ChatInputCommandInteraction, GuildMember, PermissionsBitField } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class Kick extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "kick",
            description: "Kicks a user from the server.",
            category: Category.Moderation,
            options: [
                {
                    name: "target",
                    description: "The user to kick.",
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: "reason",
                    description: "The reason for kicking the user.",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                    
                },
                {
                    name: "silent",
                    description: "Whether or not to delete the messages.",
                    type: ApplicationCommandOptionType.Boolean,
                    required: false,
                },
            ],
            default_member_permissions: PermissionsBitField.Flags.KickMembers,
            dm_permission: false,
            cooldown: 5,
            dev: false,
        })
    }
    async Execute(interaction: ChatInputCommandInteraction) {
        let target = interaction.options.getMember('target') as GuildMember;
    }
}