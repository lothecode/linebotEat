const mongoose = require('mongoose')
const Schema = mongoose.Schema

const todoSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String
  },
  image: {
    type: String
  },
  phone: {
    type: String,
  },
  description: {
    type: String
  },
  // 加入 userId，建立跟 User 的關聯
  // userId: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'User',
  //   index: true,
  //   required: true
  // }
})

module.exports = mongoose.model('Diner', todoSchema)