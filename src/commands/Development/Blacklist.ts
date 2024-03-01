import { ApplicationCommandOptionType, PermissionsBitField } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class Blacklist extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: 'blacklist',
            description: `Manage the blacklist of a user.`,
            dev: true,
            cooldown: 5,
            default_member_permissions: PermissionsBitField.Flags.UseApplicationCommands,
            dm_permission: false,
            category: Category.Blacklist,
            options: [
                {
                    name: 'view',
                    description: `View the blacklist of a user.`,
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'target',
                            description: `The user to view.`,
                            type: ApplicationCommandOptionType.User,
                            required: true,
                        }
                    ]
                },
                {
                    name: 'update',
                    description: `Update a user's blacklist.`,
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'target',
                            description: `The user to update.`,
                            type: ApplicationCommandOptionType.User,
                            required: true,
                        },
                        {
                            name:'reason',
                            description: `The reason for updating the user.`,
                            type: ApplicationCommandOptionType.String,
                            required: false,
                        }
                    ]
                },
                {
                    name: 'add',
                    description: `Add a user to the blacklist.`,
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'target',
                            description: `The user to add.`,
                            type: ApplicationCommandOptionType.User,
                            required: true,
                        },
                        {
                            name:'reason',
                            description: `The reason for adding the user.`,
                            type: ApplicationCommandOptionType.String,
                            required: false,
                        }
                    ]
                },
                {
                    name: 'remove',
                    description: `Remove a user from the blacklist.`,
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'target',
                            description: `The user to remove.`,
                            type: ApplicationCommandOptionType.User,
                            required: true,
                        }
                    ]
                }
            ]
        })
    }
}