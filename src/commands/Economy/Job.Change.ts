import { ChatInputCommandInteraction, TextChannel } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import Job from "../../base/schemas/Job";
import GuildConfig from "../../base/schemas/GuildConfig";
import Economy from "../../base/schemas/Economy";
import CommandCounter from "../../base/schemas/CommandCounter";

export default class JobChange extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "job.change",
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    let job = await Job.findOne({
      user: interaction.user.id,
    });

    let commandCounter = await CommandCounter.findOne({ global: 1 });
    commandCounter!.job.jobChange.used += 1;
    await commandCounter?.save();

    let guild = await GuildConfig.findOne({ id: interaction.guildId });

    let economy = await Economy.findOne({ user: interaction.user.id });

    let chosenJob: keyof typeof jobs = interaction.options.getString(
      "job"
    ) as keyof typeof jobs;

    let jobs = {
      gardener: {
        price: 0,
      },
      writer: {
        price: 500,
      },
      artist: {
        price: 1000,
      },
      developer: {
        price: 1500,
      },
      musician: {
        price: 2000,
      },
      cook: {
        price: 2500,
      },
      detective: {
        price: 3000,
      },
      pilot: {
        price: 5000,
      },
      astronaut: {
        price: 10000,
      },
    };

    if (guild && guild.language) {
      if (!job) {
        if (!economy) {
          return interaction.reply({
            embeds: [
              {
                color: 0xff6666,
                title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
                description: `${
                  guild.language === "fr"
                    ? "❌Vous ne possédez pas de compte bancaire.\nVous pouvez en créer un en utilisant la commande </account create:1204810971416236072>."
                    : "❌ You do not have a bank account.\nYou can create one using </account create:1204810971416236072>."
                }`,
              },
            ],
            ephemeral: true,
          });
        } else {
          if (economy.balance >= jobs[chosenJob].price) {
            economy.balance -= jobs[chosenJob].price;
            job = await Job.create({ user: interaction.user.id });
            job.job = chosenJob;
            try {
              economy.save();
              job.save();
              try {
                (
                  (await interaction.client.channels.fetch(
                    "1187843483181011004"
                  )) as TextChannel
                ).send({
                  content: `# ${
                    interaction.user.username
                  } has changed their job to **${this.capitalizeFirstLetter(
                    job.job
                  )}**.\nJob_ID: **${job._id}**\nEconomy_ID: **${
                    economy._id
                  }**`,
                });
              } catch (err) {
                console.log(err);
              }

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
                    color: 0x33cc99,
                    title: `${
                      guild.language === "fr" ? "Succès!" : "Success!"
                    }`,
                    description: `${
                      guild.language === "fr"
                        ? `✅ Vous avez changé votre emploi pour être **${this.capitalizeFirstLetter(
                            userJob
                          )}**.`
                        : `✅ Your job has been changed to **${this.capitalizeFirstLetter(
                            job.job
                          )}**.`
                    }`,
                  },
                ],
              });
            } catch (err) {
              console.error(err);
              return interaction.reply({
                embeds: [
                  {
                    color: 0xff6666,
                    title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
                    description: `${
                      guild.language === "fr"
                        ? `❌ Une erreur est survenue en essayant de sauvegarder votre métier. Veuillez prendre une capture d'écran de ce message et l'envoyer à notre Support.\n\nJob_ID: ${job._id}\nEconomy_ID: ${economy._id}\nJob Chosen: ${chosenJob}`
                        : `❌ An error occured while saving your job. Please take a screenshot of this message and send it to our support.\n\nJob_ID: ${job._id}\nEconomy_ID: ${economy._id}\nJob Chosen: ${chosenJob}`
                    }`,
                  },
                ],
                ephemeral: true,
              });
            }
          } else {
            return interaction.reply({
              embeds: [
                {
                  color: 0xff6666,
                  title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
                  description: `${
                    guild.language === "fr"
                      ? "❌ Vous n'avez pas assez d'argent pour faire ce travail."
                      : `❌ You do not have enough money to afford this job.`
                  }`,
                },
              ],
              ephemeral: true,
            });
          }
        }
      } else if (job) {
        if (!economy) {
          return interaction.reply({
            embeds: [
              {
                color: 0xff6666,
                title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
                description: `${
                  guild.language === "fr"
                    ? "❌Vous ne possédez pas de compte bancaire.\nVous pouvez en créer un en utilisant la commande </account create:1204810971416236072>."
                    : "❌ You do not have a bank account.\nYou can create one using </account create:1204810971416236072>."
                }`,
              },
            ],
            ephemeral: true,
          });
        } else {
          if (economy.balance >= jobs[chosenJob].price) {
            economy.balance -= jobs[chosenJob].price;
            job.job = chosenJob;
            try {
              economy.save();
              job.save();
              try {
                (
                  (await interaction.client.channels.fetch(
                    "1187843483181011004"
                  )) as TextChannel
                ).send({
                  content: `# ${
                    interaction.user.username
                  } has changed their job to **${this.capitalizeFirstLetter(
                    job.job
                  )}**.\nJob_ID: **${job._id}**\nEconomy_ID: **${
                    economy._id
                  }**`,
                });
              } catch (err) {
                console.log(err);
              }

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
                    color: 0x33cc99,
                    title: `${
                      guild.language === "fr" ? "Succès!" : "Success!"
                    }`,
                    description: `${
                      guild.language === "fr"
                        ? `✅ Vous avez changé votre emploi pour être **${this.capitalizeFirstLetter(
                            userJob
                          )}**.`
                        : `✅ Your job has been changed to **${this.capitalizeFirstLetter(
                            job.job
                          )}**.`
                    }`,
                  },
                ],
              });
            } catch (err) {
              console.error(err);
              return interaction.reply({
                embeds: [
                  {
                    color: 0xff6666,
                    title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
                    description: `${
                      guild.language === "fr"
                        ? `❌ Une erreur est survenue en essayant de sauvegarder votre métier. Veuillez prendre une capture d'écran de ce message et l'envoyer à notre Support.\n\nJob_ID: ${job._id}\nEconomy_ID: ${economy._id}\nJob Chosen: ${chosenJob}`
                        : `❌ An error occured while saving your job. Please take a screenshot of this message and send it to our support.\n\nJob_ID: ${job._id}\nEconomy_ID: ${economy._id}\nJob Chosen: ${chosenJob}`
                    }`,
                  },
                ],
                ephemeral: true,
              });
            }
          } else {
            return interaction.reply({
              embeds: [
                {
                  color: 0xff6666,
                  title: `${guild.language === "fr" ? "Oups!" : "Oops!"}`,
                  description: `${
                    guild.language === "fr"
                      ? "❌ Vous n'avez pas assez d'argent pour faire ce travail."
                      : `❌ You do not have enough money to afford this job.`
                  }`,
                },
              ],
              ephemeral: true,
            });
          }
        }
      }
    } else {
      // DONT CHANGE DONT CHANGE DONT CHANGE
      if (!job) {
        if (!economy) {
          return interaction.reply({
            embeds: [
              {
                color: 0xff6666,
                title: "Oops!",
                description:
                  "❌ You do not have a bank account.\nYou can create one using </account create:1204810971416236072>.",
              },
            ],
            ephemeral: true,
          });
        } else {
          if (economy.balance >= jobs[chosenJob].price) {
            economy.balance -= jobs[chosenJob].price;
            job = await Job.create({ user: interaction.user.id });
            job.job = chosenJob;
            try {
              economy.save();
              job.save();
              try {
                (
                  (await interaction.client.channels.fetch(
                    "1187843483181011004"
                  )) as TextChannel
                ).send({
                  content: `# ${
                    interaction.user.username
                  } has changed their job to **${this.capitalizeFirstLetter(
                    job.job
                  )}**.\nJob_ID: **${job._id}**\nEconomy_ID: **${
                    economy._id
                  }**`,
                });
              } catch (err) {
                console.log(err);
              }
              return interaction.reply({
                embeds: [
                  {
                    color: 0x33cc99,
                    title: "Success!",
                    description: `✅ Your job has been changed to **${this.capitalizeFirstLetter(
                      job.job
                    )}**.`,
                  },
                ],
              });
            } catch (err) {
              console.error(err);
              return interaction.reply({
                embeds: [
                  {
                    color: 0xff6666,
                    title: "Oops!",
                    description: `❌ An error occured while saving your job. Please take a screenshot of this message and send it to our support.\n\nJob_ID: ${job._id}\nEconomy_ID: ${economy._id}\nJob Chosen: ${chosenJob}`,
                  },
                ],
                ephemeral: true,
              });
            }
          } else {
            return interaction.reply({
              embeds: [
                {
                  color: 0xff6666,
                  title: "Oops!",
                  description: `❌ You do not have enough money to afford this job.`,
                },
              ],
              ephemeral: true,
            });
          }
        }
      } else if (job) {
        if (!economy) {
          return interaction.reply({
            embeds: [
              {
                color: 0xff6666,
                title: "Oops!",
                description:
                  "❌ You do not have a bank account.\nYou can create one using </account create:1204810971416236072>.",
              },
            ],
            ephemeral: true,
          });
        } else {
          if (economy.balance >= jobs[chosenJob].price) {
            economy.balance -= jobs[chosenJob].price;
            job.job = chosenJob;
            try {
              economy.save();
              job.save();
              try {
                (
                  (await interaction.client.channels.fetch(
                    "1187843483181011004"
                  )) as TextChannel
                ).send({
                  content: `# ${
                    interaction.user.username
                  } has changed their job to **${this.capitalizeFirstLetter(
                    job.job
                  )}**.\nJob_ID: **${job._id}**\nEconomy_ID: **${
                    economy._id
                  }**`,
                });
              } catch (err) {
                console.log(err);
              }
              return interaction.reply({
                embeds: [
                  {
                    color: 0x33cc99,
                    title: "Success!",
                    description: `✅ Your job has been changed to **${this.capitalizeFirstLetter(
                      job.job
                    )}**.`,
                  },
                ],
              });
            } catch (err) {
              console.error(err);
              return interaction.reply({
                embeds: [
                  {
                    color: 0xff6666,
                    title: "Oops!",
                    description: `❌ An error occured while saving your job. Please take a screenshot of this message and send it to our support.\n\nJob_ID: ${job._id}\nEconomy_ID: ${economy._id}\nJob Chosen: ${chosenJob}`,
                  },
                ],
                ephemeral: true,
              });
            }
          } else {
            return interaction.reply({
              embeds: [
                {
                  color: 0xff6666,
                  title: "Oops!",
                  description: `❌ You do not have enough money to afford this job.`,
                },
              ],
              ephemeral: true,
            });
          }
        }
      }
    }
  }
  private capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
