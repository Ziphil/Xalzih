//

import {
  Client
} from "discord.js";
import express from "express";
import {
  Express
} from "express";
import {
  MainController
} from "./controller/main";
import {
  DISCORD_KEY,
  PORT
} from "./variable";


export class Main {

  private application!: Express;
  private client!: Client;

  public main(): void {
    this.application = express();
    this.client = this.createClient();
    this.setupServer();
    this.setupControllers();
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

  private setupControllers(): void {
    MainController.setup(this.client);
  }

  private listen(): void {
    this.client.login(DISCORD_KEY);
    this.application.listen(+PORT, () => {
      console.log("xalzih start");
    });
  }

}


let main = new Main();
main.main();