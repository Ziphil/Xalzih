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
          await message.channel.send(`kocaqat a sotik adak iva “${name}”.`);
        }
      }
    }
  }

  @listener("message")
  private async respondQuiz(client: Client, message: Message): Promise<void> {
    let match;
    if (match = message.content.match(/^!zelad(\-del)?\s+(\d+)$/)) {
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
          let embed = new MessageEmbed();
          embed.title = `第 ${quiz.number} 問`;
          embed.description = quiz.questionMarkup;
          embed.color = 0x33C3FF;
          embed.addField("正解", `||${quiz.answer}||`, true);
          embed.addField("原文リンク", `[こちら](${quizMessage.url})`, true);
          embed.addField("解説", `||${quiz.commentary}||`, false);
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