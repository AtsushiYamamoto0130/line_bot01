"use strict";

const express = require("express");
const line = require("@line/bot-sdk");
const axios = require("axios");
const PORT = process.env.PORT || 3000;

const config = {
  channelSecret: "9e6d799de83a0322a45b24901203469f",
  channelAccessToken:
    "4Aspi3R2kLQht5Sktj8zj/hDpjfzQKgisNbcaCwsH6ZC7NZKFLK69Mi85oomjAUbkUSAPOHve68zIjU5bXyB7X5KhBoaGMdGkiE+dwLJPOa9/4F5WlFDiu1t2QeGKbino7e8jBaVFkkGKkFhZa5b+AdB04t89/1O/w1cDnyilFU="
};

const app = express();

app.post("/webhook", line.middleware(config), (req, res) => {
  console.log(req.body.events);
  Promise.all(req.body.events.map(handleEvent)).then(result =>
    res.json(result)
  );
});

const client = new line.Client(config);

function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  let mes = "";
  if (event.message.text === "Node.jsの最新バージョン教えて！") {
    mes = "ちょっとまってね"; //待ってねってメッセージだけ先に処理
    getNodeVer(event.source.userId); //スクレイピング処理が終わったらプッシュメッセージ
  } else {
    mes = event.message.text + "ですね";
  }

  return client.replyMessage(event.replyToken, {
    type: "text",
    text: mes
  });
}

const getNodeVer = async userId => {
  const res = await axios.get("https://nodejs.org/ja/");
  const item = res.data;
  const version = item.match(/最新版"  data-version="(.*?)">/)[1]; //正規表現で(無理やり)取得
  console.log(version);

  await client.pushMessage(userId, {
    type: "text",
    text: `今の最新は${version}だよ！`
  });
};

app.listen(PORT);
console.log(`Server running at ${PORT}`);
