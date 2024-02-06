import { Schema, model } from "mongoose";

interface IGuildConfig {
  id: string;
  language: string;
  logs: {
    moderation: {
      enabled: boolean;
      channelId: string;
    };
  };
}

export default model<IGuildConfig>(
  "GuildConfig",
  new Schema<IGuildConfig>(
    {
      id: String,
      language: String,
      logs: {
        moderation: {
          enabled: Boolean,
          channelId: String,
        },
      },
    },
    {
      timestamps: true,
    }
  )
);
