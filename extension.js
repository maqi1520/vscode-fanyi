// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const chalk = require('chalk');
const request = require('co-request');
const { stringify } = require('query-string');
var stringifyPretty = require('json-stringify-pretty-compact');

function activate(context) {
  let disposable = vscode.commands.registerCommand('extension.everest.fanyi', function() {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
      return; // No open text editor
    }
    let document = editor.document;
    let documentText = document.getText();
    let selection = editor.selection;
    let text = editor.document.getText(selection);
    //有选中翻译选中的词
    if (text.length) {
      youdao({ q: text }).then(newWords => {
        vscode.window.showInformationMessage('translate result: ' + newWords);
      });
    } else {
      //没有选中翻译json文件
      return fanyi(documentText).then(code => {
        const newfile = stringifyPretty(code);
        const lastLine = document.lineAt(document.lineCount - 1);
        const range = new vscode.Range(new vscode.Position(0, 0), lastLine.range.end);
        vscode.window.activeTextEditor.edit(editBuilder => {
          editBuilder.replace(range, newfile);
        });
      });
    }
  });

  context.subscriptions.push(disposable);
}
async function translate(params) {
  const url = 'http://fanyi.youdao.com/openapi.do';
  try {
    //http://fanyi.youdao.com/openapi.do?keyfrom=iamatestmanx&key=2137553564&type=data&doctype=json&version=1.1&q=%E4%B8%AD%E5%9B%BD
    const { body } = await request(`${url}?${stringify(params)}`);
    return JSON.parse(body).translation[0];
  } catch (e) {
    console.log(e);
  }
  console.log(
    chalk.yellow('youdao:apikey is forbidden, apply another in http://fanyi.youdao.com/openapi?path=data-mode')
  );
  return false;
}
async function youdao(query) {
  const { apiname, apikey, q } = {
    apiname: 'iamatestmanx',
    apikey: '2137553564',
    ...query
  };
  const result = await translate({
    keyfrom: apiname,
    key: apikey,
    type: 'data',
    doctype: 'json',
    version: '1.1',
    q
  });
  console.log(chalk.yellow(`${q}:${result}`));
  return result;
}
function fanyi(fileText) {
  const indexKey = 1;

  let data = [];
  try {
    data = JSON.parse(fileText);
  } catch (err) {
    vscode.window.showInformationMessage('翻译文件必须是everest-i18n/babel 生成的lcales 文件');
  }
  if (data[0][0] !== 'key' && data[0][1] !== 'zh_CN') {
    vscode.window.showInformationMessage('翻译文件必须是everest-i18n/babel 生成的lcales 文件');
  }
  return Promise.all(
    data.map(async item => {
      if (item[2] === null) {
        if (indexKey === 0) {
          item[1] = item[0];
          item[2] = await youdao({ q: item[0] });
        } else {
          item[2] = await youdao({ q: item[indexKey] });
        }
      }
      return item;
    })
  );
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;
