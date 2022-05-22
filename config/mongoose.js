const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/safar');

const db = mongoose.connection;

db.on('error', console.error.bind(console, "Error Connectiong to MongoDB"));
db.once('open', function() {
    console.log('Connected to db');
})

module.exports = db;