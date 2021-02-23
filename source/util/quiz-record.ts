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
    let iterations = [];
    for await (let iteration of Quiz.iterate(client)) {
      iterations.push(iteration);
    }
    let promises = iterations.map(async ({quiz, sources}) => {
      let selectPromises = quiz.choices.map((choice) => {
        let mark = choice.mark;
        let reaction = sources.problem.reactions.resolve(mark);
        let selectPromise = reaction?.users.fetch().then((selectUsers) => {
          let selected = selectUsers.find((selectUser) => selectUser.id === user.id) !== undefined;
          return {mark, selected};
        });
        return selectPromise ?? {mark, selected: false};
      });
      let selectResults = await Promise.all(selectPromises);
      let correct = false;
      let wrong = false;
      for (let selectResult of selectResults) {
        if (selectResult.selected) {
          if (selectResult.mark === quiz.answer) {
            correct = true;
          } else {
            wrong = true;
          }
        }
      }
      if (correct || wrong) {
        let status = (correct && wrong) ? "invalid" : (correct) ? "correct" : "wrong" as any;
        let urls = quiz.urls;
        results.set(quiz.number, {status, urls});
      }
    });
    await Promise.all(promises);
    let record = new QuizRecord(user, results);
    return record;
  }

  public createEmbed(): MessageEmbed {
    let embed = new MessageEmbed();
    let counts = this.counts;
    embed.title = "シャレイア語検定成績";
    embed.color = 0x33C3FF;
    embed.setAuthor(this.user.username, this.user.avatarURL() ?? undefined);
    embed.addField("\u{2705} 正解", `**${counts.correct}** / ${counts.all}`, true);
    embed.addField("\u{274E} 不正解",  `**${counts.wrong}** / ${counts.all}`, true);
    embed.addField("\u{1F196} 無効",  `**${counts.invalid}** / ${counts.all}`, true);
    embed.addField("個別成績", this.resultMarkup, false);
    return embed;
  }

  public get resultMarkup(): string {
    let markup = "";
    if (this.results.size > 0) {
      let entries = Array.from(this.results.entries());
      let resultMarkups = entries.map(([number, result]) => {
        let statusMark = (result.status === "invalid") ? "\u{1F196}" : (result.status === "correct") ? "\u{2705}" : "\u{274E}";
        return `[${number}](${result.urls.commentary}) ${statusMark}`;
      });
      markup += resultMarkups.join("　");
    } else {
      markup += "データがありません";
    }
    return markup;
  }

  public get counts(): QuizResultCounts {
    let counts = {all: 0, correct: 0, wrong: 0, invalid: 0};
    this.results.forEach((result) => {
      counts.all ++;
      counts[result.status] ++;
    });
    return counts;
  }

}


export type QuizResult = {status: "correct" | "wrong" | "invalid", urls: QuizUrls};
export type QuizResultCounts = {all: number, correct: number, wrong: number, invalid: number};