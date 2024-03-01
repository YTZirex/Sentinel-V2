import CustomClient from "./base/classes/CustomClient";

export function startBot() {
  new CustomClient().Init();
}

startBot();
