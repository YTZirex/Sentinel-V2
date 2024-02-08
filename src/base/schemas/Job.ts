import { Schema, model } from "mongoose";

interface Job {
  user: string;
  job: string;
}

export default model<Job>(
  "Job",
  new Schema<Job>({
    user: String,
    job: String,
  })
);
