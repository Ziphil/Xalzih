//

import {
  Client
} from "discord.js";


export class Controller {

  private setup(client: Client): void {
  }

  public static setup<C extends Controller>(this: new() => C, client: Client): C {
    let controller = new this();
    controller.setup(client);
    return controller;
  }

}