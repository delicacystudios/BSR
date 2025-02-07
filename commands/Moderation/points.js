const Points = require('../../DB/points'); // Импортируем модель
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'points',
  aliases: [],
  description: 'Управление очками пользователя',
  category: 'Points',
  usage: ['[add/remove] [@user] [количество]'],

  run: async (client, message, args) => {
    const requiredRoles = [`${client.config.roles.Leader}`, `${client.config.roles.Caller}`];
    
    if (!message.member.roles.cache.has(requiredRoles[0]) && !message.member.roles.cache.has(requiredRoles[1])) {
      return message.reply('У вас нет прав на использование этой команды.');
    }
    
    const action = args[0];
    const member = message.mentions.members.first();
    const amount = parseInt(args[2], 10);

    if (!['add', 'remove'].includes(action) || !member || isNaN(amount) || amount <= 0) {
      return message.reply('Использование: `!points [add/remove] [@user] [количество]`');
    }
    
    try {
      let userData = await Points.findOne({ UserID: member.id });

      if (!userData) {
        userData = new Points({ UserID: member.id, Point: 0 });
      }

      if (action === 'add') {
        userData.Point += amount;
      } else if (action === 'remove') {
        userData.Point = Math.max(0, userData.Point - amount);
      }
      
      await userData.save();

      const embed = new EmbedBuilder()
        .setColor(action === 'add' ? 'Green' : 'Red')
        .setTitle('Изменение очков')
        .setDescription(`${action === 'add' ? 'Добавлено' : 'Удалено'} **${amount}** очков ${member}.`)
        .addFields({ name: 'Текущий баланс', value: `${userData.Point} очков` });
      
      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply('Произошла ошибка при изменении очков.');
    }
  }
};