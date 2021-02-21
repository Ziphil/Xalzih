//

import axios from "axios";
import {
  Client,
  Message,
  MessageEmbed,
  Snowflake,
  TextChannel
} from "discord.js";
import e from "express";
import {
  Quiz
} from "../util/quiz";
import {
  Controller
} from "./controller";
import {
  controller,
  listener
} from "./decorator";


const URLS = {
  dictionary: "http://ziphil.com/program/interface/3.cgi",
  github: "https://github.com/Ziphil/Xalzih"
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
  private async [Symbol()](client: Client): Promise<void> {
    console.log("xalzih ready");
    await client.user?.setPresence({activity: {name: "xalzih", url: URLS.github}});
  }

  // 任意のチャンネルの「!sotik (単語)」という投稿に反応して、オンライン辞典から該当単語のエントリーを抽出して投稿します。
  // コマンド名部分を「!sotik」の代わりに「!sotik-detuk」とすると、そのコマンドの投稿が削除されます。
  // 単語はスペース区切りで複数個指定できます。
  @listener("message")
  private async [Symbol()](client: Client, message: Message): Promise<void> {
    let match;
    if (match = message.content.match(/^!sotik(-detuk)?\s+(.+)$/)) {
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
          await message.channel.send(`kocaqat a sotik adak iva “${name}”.`);
        }
      }
    }
  }

  // 任意のチャンネルの「!zelad (単語)」という投稿に反応して、オンライン辞典から該当単語のエントリーを抽出して投稿します。
  // コマンド名部分を「!zelad」の代わりに「!zelad-detuk」とすると、そのコマンドの投稿が削除されます。
  // 単語はスペース区切りで複数個指定できます。
  @listener("message")
  private async [Symbol()](client: Client, message: Message): Promise<void> {
    let match;
    if (match = message.content.match(/^!zelad(-detuk)?\s+(\d+)$/)) {
      let deleteAfter = match[1];
      let number = +match[2];
      if (deleteAfter) {
        await message.delete();
      }
      let quizMessage = await this.searchQuizMessage(client, number);
      if (quizMessage !== undefined) {
        let content = quizMessage?.content;
        let quiz = Quiz.parse(content);
        if (quiz !== undefined) {
          let embed = quiz.createEmbed(quizMessage.url);
          await message.channel.send({embed});
        } else {
          await message.channel.send("kodat e zel atùk.");
        }
      } else {
        await message.channel.send(`dukocaqat a zelad ac'${number}.`);
      }
    }
  }

  private async searchQuizMessage(client: Client, number: number): Promise<Message | undefined> {
    let channel = client.channels.cache.get(CHANNEL_IDS.sokad.zelad);
    if (channel instanceof TextChannel) {
      let quizMessage = undefined as Message | undefined;
      let before = undefined as Snowflake | undefined;
      while (true) {
        let messages = await channel.messages.fetch({limit: 100, before});
        let regexp = new RegExp(`^\\*\\*\\[\\s*${number}\\s*\\]\\*\\*\\s*解説\\s*\n`);
        quizMessage = messages.find((message) => message.content.match(regexp) !== null);
        before = messages.last()?.id;
        if (quizMessage !== undefined || messages.size < 100) {
          break;
        }
      }
      return quizMessage;
    } else {
      throw new Error("bug: this channel is not a text channel");
    }
  }

  // 検定チャンネルに問題が投稿されたときに、投稿文中に含まれている選択肢の絵文字のリアクションを自動的に付けます。
  // 選択肢として使える絵文字は、数字もしくはラテン文字の絵文字のみです。
  @listener("message")
  private async [Symbol()](client: Client, message: Message): Promise<void> {
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