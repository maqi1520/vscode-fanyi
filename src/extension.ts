import * as vscode from "vscode";
import CryptoJS from "crypto-js";
import axios from "axios";
import querystring from "querystring";

export interface Word {
  key: string;
  value: string[];
}

function truncate(q: string): string {
  var len = q.length;
  if (len <= 20) {
    return q;
  }
  return q.substring(0, 10) + len + q.substring(len - 10, len);
}

function changeWord(text: string): string {
  if (!text.includes(" ") && text.match(/[A-Z]/)) {
    const str = text.replace(/([A-Z])/g, " $1");
    let value = str.substr(0, 1).toUpperCase() + str.substr(1);
    return value;
  }
  return text;
}

async function youdao(query: string, appKey: string, appSecret: string) {
  var appKey = appKey;
  var key = appSecret; //注意：暴露appSecret，有被盗用造成损失的风险
  var salt = new Date().getTime();
  var curtime = Math.round(new Date().getTime() / 1000);
  // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
  var from = "auto";
  var to = "auto";
  var str1 = appKey + truncate(query) + salt + curtime + key;

  var sign = CryptoJS.SHA256(str1).toString(CryptoJS.enc.Hex);

  const res = await axios.post(
    "http://openapi.youdao.com/api",
    querystring.stringify({
      q: changeWord(query),
      appKey,
      salt,
      from,
      to,
      sign,
      signType: "v3",
      curtime,
    })
  );

  return res.data;
}

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("vscodeFanyi");
  const appKey = config.get("youdaoAppkey") as string;
  const appSecret = config.get("youdaoAppSecret") as string;

  console.log(appSecret);
  console.log(appKey);

  vscode.languages.registerHoverProvider("*", {
    async provideHover(document, position, token) {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return; // No open text editor
      }

      const selection = editor.selection;
      const text = document.getText(selection);

      const res = await youdao(text, appKey, appSecret);

      const markdownString = new vscode.MarkdownString();

      markdownString.appendMarkdown(
        `#### 翻译 \n\n ${res.translation[0]} \n\n`
      );
      if (res.basic) {
        markdownString.appendMarkdown(
          `**美** ${res.basic["us-phonetic"]}　　　　**英** ${res.basic["uk-phonetic"]}　\n\n`
        );

        if (res.basic.explains) {
          res.basic.explains.forEach((w: string) => {
            markdownString.appendMarkdown(`${w} \n\n`);
          });
        }
      }
      if (res.web) {
        markdownString.appendMarkdown(`#### 网络释义 \n\n`);
        res.web.forEach((w: Word) => {
          markdownString.appendMarkdown(
            `**${w.key}:** ${String(w.value).toString()} \n\n`
          );
        });
      }
      markdownString.supportHtml = true;
      markdownString.isTrusted = true;

      return new vscode.Hover(markdownString);
    },
  });

  context.subscriptions.push(
    vscode.commands.registerCommand("vscode-fanyi.replace", async () => {
      let editor = vscode.window.activeTextEditor;
      if (!editor) {
        return; // No open text editor
      }
      let selection = editor.selection;
      let text = editor.document.getText(selection);

      //有选中翻译选中的词
      if (text.length) {
        const res = await youdao(text, appSecret, appSecret);
        console.log(res);

        vscode.window.showInformationMessage(res.translation[0]);
        editor.edit((builder) => {
          builder.replace(selection, res.translation[0]);
        });
      }
    })
  );
}

export function deactivate() {}
