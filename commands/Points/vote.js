const { EmbedBuilder } = require('discord.js');
const Points = require('../../DB/points'); // Импортируем модель

module.exports = {
  name: 'vote',
  aliases: ['проголосовать', 'голос'],
  description: 'Повысить голос',
  category: `Points`,
  usage: [],

  run: async (client, message, args) => {
    const target = message.mentions.users.first();
    const userId = message.author.id;

    if (!target) {
      return message.reply('Пожалуйста, укажите игрока, за которого вы хотите проголосовать.');
    }

    // Ищем данные голосования для пользователя
    const userVote = await Points.findOne({ UserID: target.id });

    // Если пользователя нет в базе данных, создаем новую запись
    if (!userVote) {
      const newUserVote = new Points({
        UserID: target.id,
        Point: 10,  // Начальный голос
        lastVoted: Date.now(),
      });

      await newUserVote.save();
      return message.reply(`Вы проголосовали за ${target.username}. Это первый голос за него!`);
    }

    const lastVotedTimestamp = userVote.lastVoted;
    const now = Date.now();
    const twelveHours = 12 * 60 * 60 * 1000; // 12 часов в миллисекундах

    if (lastVotedTimestamp && now - lastVotedTimestamp < twelveHours) {
      const timeLeft = twelveHours - (now - lastVotedTimestamp);
      const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
      const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));

      return message.reply(`Вы уже голосовали за этого игрока. Следующее голосование будет доступно через **${hoursLeft} ч. ${minutesLeft} мин.**`);
    }

    // Разрешаем голосовать
    userVote.Point += 1;
    userVote.lastVoted = now;
    await userVote.save();

    return message.reply(`Вы проголосовали за ${target.username}. У него теперь ${userVote.Point} голосов.`);
  },
};
