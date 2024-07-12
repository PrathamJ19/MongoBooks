let mongoose = require("mongoose");

let bookSchema = mongoose.Schema({
title: {
type: String,
required: true,
},
author: {
type: String,
required: true,
},
pages: {
type: Number,
required: true,
},
genres: {
type: [String],
required: true,
},
ratings: {
type: Number,
required: true,
},
},
{ collection: 'Books'}
);

let Book = (module.exports = mongoose.model("Book", bookSchema));

