const mongoose = require('mongoose')
const Diner = require('../diner')
const restaurant = require('../seeds/restaurant.json')

mongoose.connect('mongodb://localhost/eat01', { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection

db.on('error', () => { console.log('mongodb error!') })
db.once('open', () => {
  console.log('mongodb connected!')
  let eatlist = restaurant.results
  for (let item of eatlist) {
    Diner.create({
      // id: item.id,
      name: item.name,
      category: item.category,
      phone: item.phone,
      address: item.address,
      description: item.description
    })

  }
  console.log('done')
})
