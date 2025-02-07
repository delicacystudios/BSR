const { EmbedBuilder } = require('discord.js');
const Points = require('../../DB/points'); // Импортируем модель для поинтов
const Warns = require('../../DB/warns'); // Импортируем модель для предупреждений

module.exports = {
  name: 'warn',
  aliases: ['пред', 'предупреждение'],
  description: 'Выслать предупреждение человеку',
  category: 'Moderation',
  usage: ['<пользователь> <причина>'],
  
  run: async (client, message, args) => {
    // Проверка на наличие прав у пользователя
    if (!message.member.permissions.has('MUTE_MEMBERS')) {
      return message.reply('У вас нет прав для использования этой команды.');
    }

    if (args.length < 2) {
      return message.reply('Пожалуйста, укажите пользователя и причину для предупреждения.');
    }

    const target = message.mentions.users.first();
    const reason = args.slice(1).join(' ');

    // Если не указан пользователь
    if (!target) {
      return message.reply('Пожалуйста, укажите пользователя для предупреждения.');
    }

    // Получаем данные о поинтах пользователя
    const userPoints = await Points.findOne({ UserID: target.id });

    // Если пользователя нет в базе данных поинтов
    if (!userPoints) {
      return message.reply('Пользователь не найден в базе данных поинтов.');
    }

    // Вычисляем 30% от поинтов
    const pointsToDeduct = Math.floor(userPoints.Point * 0.3);

    // Уменьшаем поинты
    userPoints.Point -= pointsToDeduct;
    await userPoints.save();

    // Сохраняем предупреждение в базу данных
    const warnData = new Warns({
      UserID: target.id,
      WarnedBy: message.author.id,
      Reason: reason,
      Date: Date.now(),
    });
    await warnData.save();

    // Создаем embed для подтверждения
    const embed = new EmbedBuilder()
      .setTitle('Предупреждение')
      .setColor(client.config.message.colors.main)
      .setDescription(`Пользователю <@${target.id}> было выдано предупреждение.`)
      .addFields(
        { 
            name: 'Причина', 
            value: reason 
        },
        { 
            name: 'Снято поинтов', 
            value: `${pointsToDeduct}` 
        },
        { 
            name: 'Выдано модератором:', 
            value: `<@${message.author.id}>` 
        }
      )
      .setTimestamp()
      .setFooter({ text: `${client.config.message.footer}` });

    // Отправляем embed-сообщение в канал
    message.channel.send({ embeds: [embed] });
  }
};

