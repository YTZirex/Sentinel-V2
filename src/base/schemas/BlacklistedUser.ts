import { Schema, model } from "mongoose";

interface BlacklistedUser {
  id: string;
  blacklisted: boolean;
  reason: string;
  moderator: string;
}

export default model<BlacklistedUser>(
  "BlacklistedUser",
  new Schema<BlacklistedUser>({
    id: String,
    blacklisted: Boolean,
    reason: String,
    moderator: String,
  })
);
