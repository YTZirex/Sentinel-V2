import { Schema, model } from "mongoose";

interface IEconomy {
  user: string;
  names: string;
  dateOfBirth: string;
  gender: string;
  balance: number;
  creditCardNumber: string;
  cvc: string;
  expirationDate: string;
}

export default model<IEconomy>(
  "Economy",
  new Schema<IEconomy>(
    {
      user: String,
      names: String,
      dateOfBirth: String,
      gender: String,
      balance: Number,
      creditCardNumber: String,
      cvc: String,
      expirationDate: String,
    },
    {
      timestamps: true,
    }
  )
);
