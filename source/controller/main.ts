//

import axios from "axios";
import {
  Client,
  Message
} from "discord.js";
import {
  Controller
} from "./controller";
import {
  controller,
  listener
} from "./decorator";


@controller()
export class MainController extends Controller {

  @listener("ready")
  private async ready(client: Client): Promise<void> {
    console.log("xalzih ready");
    await client.user?.setPresence({activity: {name: "xalzih"}});
  }

  @listener("message")
  private async repsondWord(client: Client, message: Message): Promise<void> {
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
  }

  @listener("message")
  private async reactForQuiz(client: Client, message: Message): Promise<void> {
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
  }

}