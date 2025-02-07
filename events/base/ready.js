let db = require(`../../DB/mongoose.js`)

module.exports = async (client) => {

    try {
        console.log(`[DB]: File was found...`)
        db(client);
      } catch (err) {
        console.log(`[DB ERR]: Cannot load the database, because the file wasn't found!`)
      }

    console.log(`Вошёл в: ${client.user.tag}`);
}