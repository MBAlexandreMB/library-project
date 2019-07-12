const mongoose = require("mongoose");
const Schema   = mongoose.Schema;

const bookSchema = new Schema({
  title: String,
  description: String,
  author: [ {type: Schema.Types.ObjectId, ref: 'Author'} ],
  rating: Number,
  reviews: [{
    user: String,
    comments: String,
  }],
  owner: Schema.Types.ObjectId,
}, {
  timestamps: true,
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;