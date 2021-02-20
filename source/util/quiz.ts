//

import {
  MessageEmbed
} from "discord.js";


export class Quiz {

  public readonly number: number;
  public readonly shaleian: string;
  public readonly translation: string;
  public readonly choices: string;
  public readonly answer: string;
  public readonly commentary: string;

  private constructor(number: number, shaleian: string, translation: string, choices: string, answer: string, commentary: string) {
    this.number = number;
    this.shaleian = shaleian;
    this.translation = translation;
    this.choices = choices;
    this.answer = answer;
    this.commentary = commentary;
  }

  public static parse(source: string): Quiz | undefined {
    let wholeMatch = source.match(/^(.+?)―{2,}\s*\n\s*\|\|(.+?)\|\|/s);
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
        let quiz = new Quiz(number, shaleian, translation, choices, answer, commentary);
        return quiz;
      } else {
        return undefined;
      }
    }
  }

  public createEmbed(url: string): MessageEmbed {
    let embed = new MessageEmbed();
    embed.title = `第 ${this.number} 問`;
    embed.description = this.questionMarkup;
    embed.color = 0x33C3FF;
    embed.addField("正解", `||${this.answer}||`, true);
    embed.addField("原文リンク", `[こちら](${url})`, true);
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