const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const Points = require('../DB/points');
const Warns = require('../DB/warns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Выслать предупреждение человеку')
    .addUserOption(option =>
      option.setName('пользователь')
        .setDescription('Укажите пользователя для предупреждения')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('причина')
        .setDescription('Укажите причину предупреждения')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    const { client } = interaction;
    const target = interaction.options.getUser('пользователь');
    const reason = interaction.options.getString('причина');

    // Проверка на наличие прав у пользователя
    if (!interaction.member.permissions.has('MUTE_MEMBERS')) {
      return interaction.reply('У вас нет прав для использования этой команды.');
    }

    // Получаем данные о поинтах пользователя
    const userPoints = await Points.findOne({ UserID: target.id });

    // Если пользователя нет в базе данных поинтов
    if (!userPoints) {
      return interaction.reply('Пользователь не найден в базе данных поинтов.');
    }

    // Вычисляем 30% от поинтов
    const pointsToDeduct = Math.floor(userPoints.Point * 0.3);

    // Уменьшаем поинты
    userPoints.Point -= pointsToDeduct;
    await userPoints.save();

    // Сохраняем предупреждение в базу данных
    const warnData = new Warns({
      UserID: target.id,
      WarnedBy: interaction.user.id,
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
            value: `<@${interaction.user.id}>` 
        }
      )
      .setTimestamp()
      .setFooter({ text: `${client.config.message.footer}` });

    // Отправляем embed-сообщение в канал
    await interaction.reply({ embeds: [embed] });
  }
};
