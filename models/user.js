const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')
const Schema = mongoose.Schema

const userSchema = new Schema({
  account: { type: String, required: true, unique: true},
  password: { type: String },
  email: { type: String },
  full_name: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Driver', 'User'], default: 'User'},
  coords: { type: [Number], index: "2dsphere" },
  facebook_id: { type: String },
  image: { type: String },
  rating: { type: Number, max: 5, default: 3},
  unit_number: { type: Number, unique: true },
  inService: { type: Boolean, default: false }
}, {
  versionKey: false
})

userSchema.pre('save', function (next) {
  const nurse = this
  const SALT_FACTOR = 5

  if (!nurse.isModified('password')) return next()

  bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
    if (err) return next(err)

    bcrypt.hash(nurse.password, salt, null, function (err, hash) {
      if (err) return next(err)
      nurse.password = hash
      next()
    })
  })
})

//  Method to compare password for login
userSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) {
      return cb(err)
    }
    cb(null, isMatch)
  })
}

module.exports = mongoose.model('User', userSchema)
