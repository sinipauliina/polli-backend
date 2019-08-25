import mongoose from 'mongoose'

let UserSchema = mongoose.Schema({
  username: {type: String, unique: true, required: true},
  password: {type: String, required: true},
})

//Export model
export default mongoose.model('User', UserSchema)
