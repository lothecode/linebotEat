const express = require('express')
const app = express()
const linebot = require('linebot')
const mongoose = require('mongoose')
const Diner = require('./models/diner')

// 判別開發環境, 如果不是 production 模式, 使用 dotenv 讀取 .env 檔案
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/eat01',
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
const db = mongoose.connection

db.on('error', () => { console.log('mongodb error!') })
db.once('open', () => { console.log('mongodb connected!') })


const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})
const linebotParser = bot.parser()

bot.on('message', function (event) { // event.message.text是使用者傳給bot的訊息
  // write code here
  Diner.find()
    .lean()
    .exec((err, diners) => {
      if (err) return console.error(err)
      const index = randomPick(diners.length)
      let name = diners[index].name
      event.reply(name)
    })
})

app.post('/', linebotParser)

app.get('/', (req, res) => {
  Diner.find()
    .lean()
    .exec((err, diners) => {
      if (err) return console.error(err)
      let index = randomPick(diners.length)
      let name = diners[index].name
      res.send(`<H1>${name}</h1>`)
    }
    )
})

function randomPick(length) {
  let sample = Math.floor(Math.random() * length)
  return sample
}

// 用自己的server就這麼寫, 否則用bot.listen
app.listen(process.env.PORT || 3000, () => {
  console.log('Express server for LineBOT start')
})
