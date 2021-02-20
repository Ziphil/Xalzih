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


const URLS = {
  dictionary: "http://ziphil.com/program/interface/3.cgi"
};
const CHANNEL_IDS = {
  sokad: {
    rafles: "809024729419481148",
    zelad: "809386921792241686",
    sotik: "811477456300146698"
  },
  qilxaleh: {
    rel: "809027836034809876"
  },
  tacatkuv: "809023120135946291",
  test: "809151049608200192"
};
const ROLE_IDS = {
  zisvalod: "809147316991950908",
  xenoh: "809147578443759676"
};


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
    if (match = message.content.match(/^!sotik(\-del)?\s+(.+)$/)) {
      let deleteAfter = match[1];
      let names = match[2].trim().split(/\s+/);
      if (deleteAfter) {
        await message.delete();
      }
      for (let name of names) {
        let params = {mode: "fetch_discord", name};
        let response = await axios.get(URLS.dictionary, {params});
        if ("embeds" in response.data) {
          let embed = response.data.embeds[0];
          await message.channel.send({embed});
        } else {
          let content = `kocaqat a sotik adak iva “${name}”.`;
          await message.channel.send(content);
        }
      }
    }
  }

  @listener("message")
  private async reactQuiz(client: Client, message: Message): Promise<void> {
    let hasPermission = message.member?.roles.cache.find((role) => role.id === ROLE_IDS.zisvalod) !== undefined;
    let correctChannel = message.channel.id === CHANNEL_IDS.sokad.zelad || message.channel.id === CHANNEL_IDS.test;
    if (hasPermission && correctChannel) {
      if (message.content.match(/^\*\*\[\s*\d+\s*\]\*\*\s*\n/)) {
        let matches = Array.from(message.content.matchAll(/(..\u{20E3}|[\u{1F1E6}-\u{1F1FF}])/gu));
        for (let match of matches) {
          await message.react(match[0]);
        }
      }
    }
  }

}