import { ApplicationCommandOptionType, PermissionsBitField } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class Job extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "job",
      description: "Manage your job",
      dm_permission: false,
      default_member_permissions:
        PermissionsBitField.Flags.UseApplicationCommands,
      cooldown: 3,
      dev: false,
      category: Category.Economy,
      options: [
        {
          name: "informations",
          type: ApplicationCommandOptionType.Subcommand,
          description: "Get informations about your job",
          options: [],
        },
        {
          name: "change",
          type: ApplicationCommandOptionType.Subcommand,
          description: "Change your job",
          options: [
            {
              name: "job",
              type: ApplicationCommandOptionType.String,
              description: "The job you want to change to",
              required: true,
              choices: [
                {
                  name: "0€ - Gardener",
                  value: "gardener",
                },
                {
                  name: "500€ - Writer",
                  value: "writer",
                },
                {
                  name: "1 000€ - Artist",
                  value: "artist",
                },
                {
                  name: "1 500€ - Developer",
                  value: "developer",
                },
                {
                  name: "2 000€ - Musician",
                  value: "musician",
                },
                {
                  name: "2 500€ - Cook",
                  value: "cook",
                },
                {
                  name: "3 000€ - Detective",
                  value: "detective",
                },
                {
                  name: "5 000€ - Pilot",
                  value: "pilot",
                },
                {
                  name: "10 000€ - Astronaut",
                  value: "astronaut",
                },
              ],
            },
          ],
        },
      ],
    });
  }
}
