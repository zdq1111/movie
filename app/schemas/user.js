var mongoose = require('mongoose')
var bcrypt = require('bcrypt') //为密码存储 
var SALT_WORK_FACTOR = 10

var UserSchema = new mongoose.Schema({
  name: {
    unique: true,  //唯一
    type: String   //字符串类型
  },
  password: String,
  // 0: nomal user
  // 1: verified user
  // 2: professonal user
  // >10: admin
  // >50: super admin
  //role:String user /admin /super admin
  role: {
    type: Number,
    default: 0
  },
  meta: {
    createAt: {
      type: Date,
      default: Date.now()
    },
    updateAt: {
      type: Date,
      default: Date.now()
    }
  }
})

UserSchema.pre('save', function(next) {
  var user = this

  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else {
    this.meta.updateAt = Date.now()
  }

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {  //先生成随机的盐 然后和密码混合 参数1是计算强度
    if (err) return next(err)

    bcrypt.hash(user.password, salt, function(err, hash) {  //hash 当前用户明文密码 盐 回调方法
      if (err) return next(err)

      user.password = hash
      next()  //下一步
    })
  })
})

UserSchema.methods = {
  comparePassword: function(_password, cb) {
    bcrypt.compare(_password, this.password, function(err, isMatch) {
      if (err) return cb(err)

      cb(null, isMatch)
    })
  }
}

UserSchema.statics = {
  fetch: function(cb) {
    return this
      .find({})
      .sort('meta.updateAt')
      .exec(cb)
  },
  findById: function(id, cb) {
    return this
      .findOne({_id: id})
      .exec(cb)
  }
}

module.exports = UserSchema