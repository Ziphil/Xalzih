//

import axios from "axios";
import {
  Client,
  Message
} from "discord.js";
import {
  CHANNEL_IDS,
  ROLE_IDS,
  URLS
} from "../data/id";
import {
  Quiz
} from "../util/quiz";
import {
  QuizRecord
} from "../util/quiz-record";
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
  private async [Symbol()](client: Client): Promise<void> {
    console.log("xalzih ready");
    await client.user?.setPresence({activity: {name: "xalzih", url: URLS.github}});
  }

  // 任意のチャンネルの「!sotik (単語)」という投稿に反応して、オンライン辞典から該当単語のエントリーを抽出して投稿します。
  // コマンド名部分を「!sotik」の代わりに「!sotik-detuk」とすると、そのコマンドの投稿が削除されます。
  // 単語はスペース区切りで複数個指定できます。
  @listener("message")
  private async [Symbol()](client: Client, message: Message): Promise<void> {
    let match = message.content.match(/^!sotik(-detuk)?\s+(.+)$/);
    if (match) {
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

  // 任意のチャンネルの「!zelad (番号)」という投稿に反応して、検定チャンネルの該当番号の解説投稿を検索し、その内容を整形して投稿します。
  // コマンド名部分を「!zelad」の代わりに「!zelad-detuk」とすると、そのコマンドの投稿が削除されます。
  @listener("message")
  private async [Symbol()](client: Client, message: Message): Promise<void> {
    let match = message.content.match(/^!zelad(-detuk)?\s+(\d+)$/);
    if (match) {
      let deleteAfter = match[1];
      let number = +match[2];
      if (deleteAfter) {
        await message.delete();
      }
      let quiz = await Quiz.findByNumber(client, number);
      if (quiz !== undefined) {
        let embed = quiz.createEmbed();
        await message.channel.send({embed});
      } else {
        await message.channel.send("kodat e zel atùk.");
      }
    }
  }

  @listener("message")
  private async [Symbol()](client: Client, message: Message): Promise<void> {
    let match = message.content.match(/^!result(-detuk)?(?:\s+(\d+))?$/);
    if (match) {
      let deleteAfter = match[1];
      let userId = match[2];
      if (deleteAfter) {
        await message.delete();
      }
      let user = (userId) ? await client.users.fetch(userId) : message.author;
      let record = await QuizRecord.fetch(client, user);
      let embed = record.createEmbed();
      await message.channel.send({embed});
    }
  }

  @listener("message")
  private async [Symbol()](client: Client, message: Message): Promise<void> {
    let match = message.content.match(/^!save\s+(\d+)$/);
    if (match) {
      let number = +match[1];
      await message.delete();
      await QuizRecord.save(client, number);
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
        let matches = message.content.matchAll(/(..\u{20E3}|[\u{1F1E6}-\u{1F1FF}])/gu);
        for (let match of matches) {
          await message.react(match[0]);
        }
      }
    }
  }

}