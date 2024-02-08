import { ChatInputCommandInteraction } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import GuildConfig from "../../base/schemas/GuildConfig";
import Job from "../../base/schemas/Job";
import CommandCounter from "../../base/schemas/CommandCounter";

export default class JobInformation extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "job.informations",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    let job = await Job.findOne({ user: interaction.user.id });
    let guild = await GuildConfig.findOne({ id: interaction.guildId });

    let commandCounter = await CommandCounter.findOne({ global: 1 });
    commandCounter!.job.jobInformations.used += 1;
    await commandCounter?.save();

    if (guild && guild.language) {
      if (!job) {

        return interaction.reply({
          embeds: [
            {
              color: 0xff6666,
              title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
              description: `${
                guild.language === "fr"
                  ? `❌ Vous n'avez pas d'emploi actuellement.`
                  : `❌ You do not have a job currently.`
              }`,
            },
          ],
        });
      } else {
        let userJob: string = job.job;

        if (guild.language === "fr") {
          switch (job.job) {
            case "gardener":
              userJob = "jardinier";
              break;
            case "writer":
              userJob = "ecrivain";
              break;
            case "musician":
              userJob = "musicien";
              break;
            case "artist":
              userJob = "artiste";
              break;
            case "developer":
              userJob = "développeur";
              break;
            case "cook":
              userJob = "cuisinier";
              break;
            case "detective":
              userJob = "détective";
              break;
            case "pilot":
              userJob = "pilote d'avion";
              break;
            case "astronaut":
              userJob = "astronaute";
              break;
          }
        }
        return interaction.reply({
          embeds: [
            {
              color: 0xff6633,
              title: `${
                guild.language === "fr"
                  ? "Informations Métier"
                  : "Job Informations"
              }`,
              description: `${
                guild.language === "fr"
                  ? `Vous travaillez actuellement en tant que **${this.capitalizeFirstLetter(
                      userJob
                    )}**.`
                  : `You are currently working as a **${this.capitalizeFirstLetter(
                      userJob
                    )}**.`
              }`,
            },
          ],
        });

      }
    } else {
      // DONT CHANGE DONT CHANGE DONT CHANGE
      if (!job) {
        return interaction.reply({
          embeds: [
            {
              color: 0xff6666,
              title: "Oops!",
              description: `❌ You do not have a job currently.`,
            },
          ],
        });
      } else {
        let userJob: string = job.job;

        return interaction.reply({
          embeds: [
            {
              color: 0xff6633,
              title: "Job Informations",
              description: `You are currently working as a **${this.capitalizeFirstLetter(
                userJob
              )}**.`,
            },
          ],
        });
      }
    }
  }
  private capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
