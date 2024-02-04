import { EmbedBuilder, Events, Guild } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class GuildCreate extends Event {
  constructor(client: CustomClient) {
    super(client, {
      name: Events.GuildCreate,
      description: "Guild Create Event",
      once: false,
    });
  }
  async Execute(guild: Guild) {
    try {
      if (!(await GuildConfig.exists({ id: guild.id })))
        await GuildConfig.create({ id: guild.id });
    } catch (err) {
      console.log(err);
    }

    const owner = await guild.fetchOwner();
    owner
      ?.send({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(`Hey! Thanks for inviting me to your server!`),
        ],
      })
      .catch();
  }
}
