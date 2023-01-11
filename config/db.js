const mongoose = require('mongoose')
// dotenv for .env variables
require('dotenv').config();
// either set the strictQuery option to true to supress mongoosee warning or false to override
// the current strictQuery behaviour and prepare for new release:
// mongoose.set('strictQuery', true);
mongoose.set('strictQuery', false);
// connect to mongodb using env variables then console log if connected or throw error
const connectDB = async () => {
    try {
      const conn = mongoose.connect(process.env.MONGO_URI)
      console.log(`MongoDB Connected`);
    } catch (error) {
      console.log(`Error: ${error.message}`);
      process.exit();
    }
  };
  
  module.exports = connectDB;