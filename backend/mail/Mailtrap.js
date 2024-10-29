import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv"

dotenv.config()

const TOKEN = "87c64b5a89e9d54ce26753cefb5de701"; 

export const client = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email: "hello@demomailtrap.com",
  name: "Mailtrap Test",
};

