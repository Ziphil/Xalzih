//

import axios from "axios";
import {
  Client
} from "discord.js";
import * as http from "http";
import {
  Server
} from "http";
import * as query from "querystring";
import {
  DISCORD_KEY
} from "./variable";


export class Main {

  private server!: Server;
  private client!: Client;

  public main(): void {
    this.makeServer();
    this.makeClient();
    this.setupListeners();
    this.listen();
  }

  private makeServer(): void {
    let server = http.createServer((request, response) => {
      if (request.method === "POST") {
        let data = "";
        request.on("data", (chunk) => {
          data += chunk;
        });
        request.on("end", () => {
          if (data !== "") {
            let dataObject = query.parse(data);
            if (dataObject.type === "wake") {
              console.log("woke up");
            }
          }
          response.end();
        });
      } else if (request.method === "GET") {
        response.writeHead(200);
        response.end("active");
      }
    });
    this.server = server;
  }

  private makeClient(): void {
    let client = new Client();
    client.on("ready", () => {
      console.log("xalzih ready");
      client.user?.setPresence({activity: {name: "xalzih"}});
    });
    this.client = client;
  }

  private setupListeners(): void {
    this.client.on("message", async (message) => {
      try {
        let match;
        if (match = message.content.match(/^!sotik\s*(.+)$/)) {
          let params = {mode: "fetch_discord", name: match[1]};
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
  }

  private listen(): void {
    this.client.login(DISCORD_KEY);
    this.server.listen(3000);
  }

}


let main = new Main();
main.main();