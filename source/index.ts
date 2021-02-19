//

import axios from "axios";
import {
  Client
} from "discord.js";
import express from "express";
import {
  Express
} from "express";
import {
  DISCORD_KEY
} from "./variable";


export class Main {

  private application!: Express;
  private client!: Client;

  public main(): void {
    this.application = express();
    this.client = this.createClient();
    this.setupServer();
    this.setupListeners();
    this.listen();
  }

  private createClient(): Client {
    let client = new Client();
    return client;
  }

  private setupServer(): void {
    this.application.get("/", (request, response) => {
      console.log("awake");
      response.send("awake").end();
    });
  }

  private setupListeners(): void {
    this.client.on("ready", () => {
      console.log("xalzih ready");
      this.client.user?.setPresence({activity: {name: "xalzih"}});
    });
    this.client.on("message", async (message) => {
      try {
        let match;
        if (match = message.content.match(/^!sotik\s*(.+)$/)) {
          let name = match[1].trim();
          let params = {mode: "fetch_discord", name};
          let response = await axios.get("http://ziphil.com/program/interface/3.cgi", {params});
          if ("embeds" in response.data) {
            let embed = response.data.embeds[0];
            await message.channel.send({embed});
          } else {
            let content = `kocaqat a sotik adak iva “${name}”.`;
            await message.channel.send(content);
          }
        }
      } catch (error) {
        console.error(error);
      }
    });
    this.client.on("message", async (message) => {
      try {
        let author = message.author;
        if (author.id === "359323388071903232" && message.content.match(/^\*\*\[\s*\d+\s*\]\*\*\s*\n/)) {
          let matches = Array.from(message.content.matchAll(/(..\u{20E3}|[\u{1F1E6}-\u{1F1FF}])/gu));
          let wrappers = matches.map((match) => {
            let wrapper = function (): Promise<void> {
              return message.react(match[0]).then();
            };
            return wrapper;
          });
          await wrappers.reduce((previous, current) => previous.then(current), Promise.resolve());
        }
      } catch (error) {
        console.error(error);
      }
    });
  }

  private listen(): void {
    this.client.login(DISCORD_KEY);
    this.application.listen(3000, () => {
      console.log("xalzih start");
    });
  }

}


let main = new Main();
main.main();