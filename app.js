const express = require('express')
const app = express()
const linebot = require('linebot')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const Diner = require('./models/diner')
app.engine('handlebars', exphbs({ defaultlayout: 'main' }))
app.set('view engine', 'handlebars')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(methodOverride('_method'))

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
      let userSay = event.message.text
      console.log(event.message.text)
      let reply = '什麼?! 你梭什麼我聽不懂啦~'
      if (userSay == undefined) {
        reply = '不要再說了，我肚子好餓！'
      } else if (userSay.includes('吃')) {
        const index = randomPick(diners.length)
        reply = `名字: ${diners[index].name}, 類別: ${diners[index].category}, 電話: ${diners[index].phone}, Rating: ${diners[index].rating}, 描述: ${diners[index].description}`
      }

      event.reply(reply).then(function (data) {
        // success
      }).catch(function (error) {
        // error
      });
    })

})

app.post('/', linebotParser)


// new get 
app.get('/diners/line', (req, res) => {
  Diner.find()
    .lean()
    .exec((err, diners) => {
      if (err) return console.error(err)
      const index = randomPick(diners.length)
      let reply = diners[index]
      return res.render('line', { diner: reply })
    })

})

app.get('/', (req, res) => {
  Diner.find()
    .lean()
    .exec((err, diners) => {
      if (err) return console.error(err)
      return res.render('index', { diners })
    })
})

// new get 
app.get('/diners/new', (req, res) => {
  res.render('new')
})

// new action
app.post('/diners', (req, res) => {
  const diner = new Diner({
    name: req.body.name,
    category: req.body.category,
    phone: req.body.phone,
    rating: req.body.rating,
    description: req.body.description
  })
  diner.save(err => {
    if (err) return console.error(err)
    return res.redirect('/')
  })
})

// edit get 
app.get('/diners/:id/edit', (req, res) => {
  Diner.findOne({ _id: req.params.id })
    .lean()
    .exec((err, diner) => {
      if (err) return console.error(err)
      return res.render('edit', { diner })
    })
})

// edit action
app.put('/diners/:id', (req, res) => {
  Diner.findOne({ _id: req.params.id }, (err, diner) => {
    if (err) return console.error(err)
    diner.name = req.body.name,
      diner.category = req.body.category,
      diner.phone = req.body.phone,
      diner.rating = req.body.rating,
      diner.description = req.body.description,
      diner.save((err => {
        if (err) return console.error(err)
        return res.redirect('/')
      }))
  })
})

// delete
app.delete('/diners/:id/delete', (req, res) => {
  Diner.findOne({ _id: req.params.id }, (err, diner) => {
    if (err) return console.error(err)
    diner.remove(err => {
      if (err) return console.error(err)
      return res.redirect('/')
    })
  })
})

function randomPick(length) {
  let sample = Math.floor(Math.random() * length)
  return sample
}

// 用自己的server就這麼寫, 否則用bot.listen
app.listen(process.env.PORT || 3000, () => {
  console.log('Express server for LineBOT start')
})
