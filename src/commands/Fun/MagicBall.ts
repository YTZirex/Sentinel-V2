import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  PermissionsBitField,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class MagicBall extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "magicball",
      description: "Ask a question to the magic ball.",
      dm_permission: false,
      default_member_permissions:
        PermissionsBitField.Flags.UseApplicationCommands,
      dev: true,
      cooldown: 3,
      category: Category.Fun,
      options: [
        {
          name: "question",
          description: "The question to ask.",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    });
  }
  async Execute(interaction: ChatInputCommandInteraction) {
    let question = interaction.options.getString("question")!;
    let answers = [
      "Yes",
      "No",
      "Maybe",
      "I don't know",
      "I'm not sure",
      "Probably not",
      "Probably yes",
      "Of course",
      "No way",
    ];

    await interaction.deferReply();

    let finalAnswerIndex = Math.floor(
      Math.random() * Math.floor(answers.length)
    );

    let guild = await GuildConfig.findOne({ id: interaction.guildId });

    let finalAnswer;
    let FrenchAnswer;
    switch (finalAnswerIndex) {
      case 0:
        FrenchAnswer = "Oui";
        break;
      case 1:
        FrenchAnswer = "Non";
        break;
      case 2:
        FrenchAnswer = "Peut être";
        break;
      case 3:
        FrenchAnswer = "Je ne sais pas";
        break;
      case 4:
        FrenchAnswer = "Je ne suis pas sûr";
        break;
      case 5:
        FrenchAnswer = "Probablement pas";
        break;
      case 6:
        FrenchAnswer = "Probablement oui";
        break;
      case 7:
        FrenchAnswer = "Bien sûr";
        break;
      case 8:
        FrenchAnswer = "Jamais";
        break;
    }

    if (guild && guild.language === "fr") {
      return interaction.editReply({
        embeds: [
          {
            color: 0x33cc99,
            title: "🔮 Boule magique",
            description: `
                    **Question:** ${question}

                    **Réponse:** ${FrenchAnswer}
                    `,
          },
        ],
      });
    } else if (!guild || (guild && guild.language === "en")) {
      return interaction.editReply({
        embeds: [
          {
            color: 0x33cc99,
            title: "🔮 Magic ball",
            description: `
                    **Question:** ${question}

                    **Answer:** ${answers[finalAnswerIndex]}
                    `,
          },
        ],
      });
    }
  }
}
