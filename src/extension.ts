import * as vscode from "vscode";
import { Iparams, IQuery, fileTextData, Iconfig } from "./types/index";
const translate = require("@vitalets/google-translate-api");
const chalk = require("chalk");
const request = require("co-request");
const { stringify } = require("query-string");
const stringifyPretty = require("json-stringify-pretty-compact");

async function googleWords(
  q: string,
  params: { from: string; to: string; tld: string }
) {
  return translate(q, params)
    .then((res: { text: string }) => res.text)
    .catch((err: any) => console.log(err));
}

async function google(query: { q: string }): Promise<string | null> {
  let { q } = query;
  const from = "zh-CN",
    to = "en",
    tld = "cn";
  const result = await googleWords(q, { from, to, tld });
  console.log(chalk.yellow(`${q}:${result}`));
  return result;
}

async function words(params: Iparams): Promise<string | null> {
  const url = "http://fanyi.youdao.com/translate";
  try {
    //http://fanyi.youdao.com/translate?smartresult=dict&smartresult=rule&sessionFrom=https://www.baidu.com/link&from=AUTO&to=AUTO&smartresult=dict&client=fanyideskweb&salt=1500092479607&sign=c98235a85b213d482b8e65f6b1065e26&doctype=json&version=2.1&keyfrom=fanyi.web&action=FY_BY_CL1CKBUTTON&typoResult=true&i=hello
    let data = {
      smartresult: "dict",
      sessionFrom: "https://www.baidu.com/link",
      from: "AUTO",
      to: "AUTO",
      client: "fanyideskweb",
      salt: "1500092479607",
      sign: "c98235a85b213d482b8e65f6b1065e26",
      doctype: "json",
      version: "2.1",
      keyfrom: "fanyi.web",
      action: "FY_BY_CL1CKBUTTON",
      typoResult: "true",
      i: params.q,
    };
    const { body } = (await request(`${url}?${stringify(data)}`)) as any;
    return JSON.parse(body).translateResult[0][0]["tgt"];
  } catch (e) {
    console.log(e);
  }
  console.log(
    chalk.yellow(
      "youdao:apikey is forbidden, apply another in http://fanyi.youdao.com/openapi?path=data-mode"
    )
  );
  return null;
}
async function youdao(query: IQuery): Promise<string | null> {
  let { apiname, apikey, q } = query;
  if (apikey === "") {
    apiname = "iamatestmanx";
    apikey = "2137553564";
  }
  const result = await words({
    keyfrom: apiname,
    key: apikey,
    type: "data",
    doctype: "json",
    version: "1.1",
    q,
  });
  console.log(chalk.yellow(`${q}:${result}`));
  return result;
}

function getProxyConfig(): Iconfig {
  const config = vscode.workspace.getConfiguration("vscodeEverestFanyi");
  return {
    apikey: config.get("youdaoApikey") || "2137553564",
    apiname: config.get("youdaoApiname") || "iamatestmanx",
    translateZhCN: config.get("translateZhCN") || false,
    useGoogleAPI: config.get("useGoogleAPI") || false,
  };
}

function trans(params: { q: string }) {
  const { useGoogleAPI, apikey, apiname } = getProxyConfig();
  return useGoogleAPI ? google(params) : youdao({ ...params, apikey, apiname });
}

function fanyiFile(fileText: string, translateZhCN: boolean) {
  let translateIndex = translateZhCN ? 0 : 1;
  let data = [] as fileTextData;
  try {
    data = JSON.parse(fileText);
  } catch (err) {
    vscode.window.showInformationMessage(
      "翻译文件必须是everest-i18n/babel 生成的lcales 文件"
    );
  }
  if (data[0][0] !== "key" && data[0][1] !== "zh_CN") {
    vscode.window.showInformationMessage(
      "翻译文件必须是everest-i18n/babel 生成的lcales 文件"
    );
  }
  return Promise.all(
    data.map(async (item) => {
      if (item[2] === null) {
        if (translateIndex === 0) {
          if (item[1] === null) {
            item[1] = item[0];
          }
          item[2] = await trans({ q: item[0] });
        } else {
          item[2] = await trans({
            q: item[translateIndex] as string,
          });
        }
      }
      return item;
    })
  );
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.everest.fanyi",
    async () => {
      let editor = vscode.window.activeTextEditor;
      if (!editor) {
        return; // No open text editor
      }
      let document = editor.document;
      let selection = editor.selection;
      let text = editor.document.getText(selection);
      const { translateZhCN } = getProxyConfig();

      //有选中翻译选中的词
      if (text.length) {
        const newWords = await trans({ q: text });
        editor!.edit((builder) => {
          builder.replace(selection, newWords!);
        });
        //vscode.window.showInformationMessage("translate result: " + newWords);
      } else {
        let documentText = document.getText();

        //没有选中翻译json文件
        const code = await fanyiFile(documentText, translateZhCN);
        const newfile = stringifyPretty(code);
        const lastLine = document.lineAt(document.lineCount - 1);
        const range = new vscode.Range(
          new vscode.Position(0, 0),
          lastLine.range.end
        );
        editor!.edit((editBuilder) => {
          editBuilder.replace(range, newfile);
        });
      }
    }
  );

  vscode.languages.registerHoverProvider("*", {
    async provideHover(document, position, token) {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return; // No open text editor
      }

      const selection = editor.selection;
      const text = document.getText(selection);
      if (!text) {
        return;
      }

      const res = await trans({ q: text });

      const markdownString = new vscode.MarkdownString();

      markdownString.appendMarkdown(`#### 翻译 \n\n ${res} \n\n`);

      return new vscode.Hover(markdownString);
    },
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
