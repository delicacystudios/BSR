const mongoose = require('mongoose');

module.exports = async (client) => {
  let con;

  try {
    con = await mongoose.connect(client.config.bot.db, {})
  } catch (e) {
    console.log('[DB ERR]: An error was occured while connecting to DB', + e);
  }
  
  if (con.connection) {
    console.log('[DB]: Connected');
  } else {
    console.log("[DB]: No connection")
  }
};