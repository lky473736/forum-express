const { MongoClient } = require('mongodb');

let db;
let url = process.env.DB_URL;
let connectDB = new MongoClient(url).connect();

module.exports = connectDB;