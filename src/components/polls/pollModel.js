import mongoose from 'mongoose'

let PollSchema = mongoose.Schema({
  title: {type: String, required: true},
  options: [{title: String, votes: Number}],
})

// Virtual for poll's URL
PollSchema.virtual('url').get(() => {
  return '/polls/' + this._id
})

//Export model
export default mongoose.model('Poll', PollSchema)
