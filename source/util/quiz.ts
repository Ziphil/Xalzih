//

import {
  Client,
  Message,
  MessageEmbed,
  Snowflake,
  TextChannel
} from "discord.js";
import {
  CHANNEL_IDS
} from "../data/id";


export class Quiz {

  public readonly number: number;
  public readonly shaleian: string;
  public readonly translation: string;
  public readonly choices: string;
  public readonly answer: string;
  public readonly commentary: string;
  public readonly urls: QuizUrls;

  private constructor(number: number, shaleian: string, translation: string, choices: string, answer: string, commentary: string, urls: QuizUrls) {
    this.number = number;
    this.shaleian = shaleian;
    this.translation = translation;
    this.choices = choices;
    this.answer = answer;
    this.commentary = commentary;
    this.urls = urls;
  }

  public static async *iterate(client: Client): AsyncGenerator<Quiz> {
    for await (let quizMessages of this.iterateRaw(client)) {
      let quiz = this.parse(quizMessages);
      if (quiz !== undefined) {
        yield quiz;
      }
    }
  }

  public static async *iterateRaw(client: Client): AsyncGenerator<QuizMessages> {
    let channel = client.channels.cache.get(CHANNEL_IDS.sokad.zelad);
    if (channel instanceof TextChannel) {
      let before = undefined as Snowflake | undefined;
      let quizMessageMaps = new Map<number, Partial<QuizMessages>>();
      while (true) {
        let messages = await channel.messages.fetch({limit: 100, before});
        for (let [, message] of messages) {
          let problemMatch = message.content.match(/^\*\*\[\s*(\d+)\s*\]\*\*\s*\n/);
          let commentaryMatch = message.content.match(/^\*\*\[\s*(\d+)\s*\]\*\*\s*解説\s*\n/);
          if (problemMatch !== null || commentaryMatch !== null) {
            let number = +(problemMatch ?? commentaryMatch)![1];
            let quizMessages = quizMessageMaps.get(number) ?? {};
            if (problemMatch !== null) {
              quizMessages.problem = message;
            } else {
              quizMessages.commentary = message;
            }
            if (quizMessages.problem !== undefined && quizMessages.commentary !== undefined) {
              quizMessageMaps.delete(number);
              yield quizMessages as QuizMessages;
            } else {
              quizMessageMaps.set(number, quizMessages);
            }
          }
        }
        before = messages.last()?.id;
        if (messages.size < 100) {
          break;
        }
      }
    }
  }

  public static parse(quizMessages: QuizMessages): Quiz | undefined {
    let wholeMatch = quizMessages.commentary.content.match(/^(.+?)―{2,}\s*\n\s*\|\|(.+?)\|\|/s);
    if (wholeMatch) {
      let mainLines = wholeMatch[1].trim().split(/\n/);
      let commentaryLines = wholeMatch[2].trim().split(/\n/);
      let numberMatch = mainLines[0]?.match(/^\*\*\[\s*(\d+)\s*\]\*\*/);
      let shaleianMatch = mainLines[1]?.match(/^>\s*(.+)/);
      let translationMatch = mainLines[2]?.match(/^>\s*(.+)/);
      let answerMatch = commentaryLines[0]?.match(/\*\*\s*正解\s*\*\*\s*:\s*(.+)/);
      if (mainLines.length >= 4 && commentaryLines.length >= 2 && numberMatch && shaleianMatch && translationMatch && answerMatch) {
        let number = +numberMatch[1];
        let shaleian = shaleianMatch[1].trim();
        let translation = translationMatch[1].trim();
        let choices = mainLines[3].trim();
        let answer = answerMatch[1].trim();
        let commentary = commentaryLines.slice(1, -1).join("").trim();
        let urls = {problem: quizMessages.problem.url, commentary: quizMessages.commentary.url};
        let quiz = new Quiz(number, shaleian, translation, choices, answer, commentary, urls);
        return quiz;
      } else {
        return undefined;
      }
    }
  }

  public createEmbed(): MessageEmbed {
    let embed = new MessageEmbed();
    embed.title = `第 ${this.number} 問`;
    embed.description = this.questionMarkup;
    embed.color = 0x33C3FF;
    embed.addField("正解", `||${this.answer}||`, true);
    embed.addField("問題リンク", `[こちら](${this.urls.problem})`, true);
    embed.addField("解説リンク", `[こちら](${this.urls.commentary})`, true);
    embed.addField("解説", `||${this.commentary}||`, false);
    return embed;
  }

  public get questionMarkup(): string {
    let result = "";
    result += `> ${this.shaleian}\n`;
    result += `> ${this.translation}\n`;
    result += this.choices;
    return result;
  }

}


type QuizMessages = {problem: Message, commentary: Message};
type QuizUrls = {problem: string, commentary: string};