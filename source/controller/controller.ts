//

import {
  Client,
  TextChannel
} from "discord.js";
import {
  CHANNEL_IDS
} from "../data/id";


export class Controller {

  private setup(client: Client): void {
  }

  protected async log(client: Client, message: string): Promise<void> {
    try {
      let channel = client.channels.resolve(CHANNEL_IDS.bot);
      if (channel instanceof TextChannel) {
        await channel.send(message);
      } else {
        throw new Error("cannot happen");
      }
    } catch (error) {
      console.error(error);
    }
  }

  protected async error(client: Client, message: string, error: Error): Promise<void> {
    try {
      let channel = client.channels.resolve(CHANNEL_IDS.bot);
      if (channel instanceof TextChannel) {
        let nextMessage = message + "\n```\n" + error.stack + "```";
        await channel.send(nextMessage);
      } else {
        throw new Error("cannot happen");
      }
    } catch (error) {
      console.error(error);
    }
  }

  public static setup<C extends Controller>(this: new() => C, client: Client): C {
    let controller = new this();
    controller.setup(client);
    return controller;
  }

}