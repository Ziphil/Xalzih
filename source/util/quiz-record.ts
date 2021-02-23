//

import {
  Client,
  Message,
  MessageEmbed,
  Snowflake,
  TextChannel,
  User
} from "discord.js";
import {
  Quiz,
  QuizUrls
} from "./quiz";


export class QuizRecord {

  public readonly user: User;
  public readonly results: Map<number, QuizResult>;

  private constructor(user: User, results: Map<number, QuizResult>) {
    this.user = user;
    this.results = results;
  }

  public static async fetch(client: Client, user: User) {
    let results = new Map<number, QuizResult>();
    for await (let {sources, quiz} of Quiz.iterate(client)) {
      let winners = await sources.problem.reactions.resolve(quiz.answer)?.users.fetch();
      if (winners) {
        let win = winners.find((winner) => winner.id === user.id) !== undefined;
        let urls = quiz.urls;
        results.set(quiz.number, {win, urls});
      }
    }
    let record = new QuizRecord(user, results);
    return record;
  }

  public createEmbed(): MessageEmbed {
    let embed = new MessageEmbed();
    let counts = this.counts;
    embed.title = "シャレイア語検定成績";
    embed.color = 0x33C3FF;
    embed.setAuthor(this.user.username, this.user.avatarURL() ?? undefined);
    embed.addField("正解", `**${counts.win}** / ${counts.all}`, true);
    embed.addField("不正解",  `**${counts.lose}** / ${counts.all}`, true);
    embed.addField("個別成績", this.resultMarkup, false);
    return embed;
  }

  public get resultMarkup(): string {
    let markup = "";
    let resultMarkups = Array.from(this.results.entries()).map(([number, result]) => {
      let winChar = (result.win) ? "\u2B55" : "\u274C";
      return `[${number}](${result.urls.commentary}) ${winChar}`;
    });
    markup += resultMarkups.join("　");
    return markup;
  }

  public get counts(): QuizResultCounts {
    let counts = {all: 0, win: 0, lose: 0};
    this.results.forEach((result) => {
      counts.all ++;
      if (result.win) {
        counts.win ++;
      } else {
        counts.lose ++;
      }
    });
    return counts;
  }

}


export type QuizResult = {win: boolean, urls: QuizUrls};
export type QuizResultCounts = {all: number, win: number, lose: number};