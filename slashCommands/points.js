const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Points = require('../DB/points');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('points')
    .setDescription('Управление очками пользователя')
    .addSubcommand(subcommand =>
      subcommand.setName('add')
        .setDescription('Добавить очки пользователю')
        .addUserOption(option => 
          option.setName('пользователь')
            .setDescription('Выберите пользователя')
            .setRequired(true))
        .addIntegerOption(option => 
          option.setName('количество')
            .setDescription('Количество очков')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand.setName('remove')
        .setDescription('Удалить очки у пользователя')
        .addUserOption(option => 
          option.setName('пользователь')
            .setDescription('Выберите пользователя')
            .setRequired(true))
        .addIntegerOption(option => 
          option.setName('количество')
            .setDescription('Количество очков')
            .setRequired(true))),
  
  async execute(interaction) {
    const requiredRoles = [interaction.client.config.roles.Leader, interaction.client.config.roles.Caller];

    if (!interaction.member.roles.cache.has(requiredRoles[0]) && !interaction.member.roles.cache.has(requiredRoles[1])) {
      return interaction.reply({ content: 'У вас нет прав на использование этой команды.', ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();
    const member = interaction.options.getUser('пользователь');
    const amount = interaction.options.getInteger('количество');

    try {
      let userData = await Points.findOne({ UserID: member.id });

      if (!userData) {
        userData = new Points({ UserID: member.id, Point: 0 });
      }

      if (subcommand === 'add') {
        userData.Point += amount;
      } else if (subcommand === 'remove') {
        userData.Point = Math.max(0, userData.Point - amount);
      }

      await userData.save();

      const embed = new EmbedBuilder()
        .setColor(subcommand === 'add' ? 'Green' : 'Red')
        .setTitle('Изменение очков')
        .setDescription(`${subcommand === 'add' ? 'Добавлено' : 'Удалено'} **${amount}** очков у ${member}.`)
        .addFields({ name: 'Текущий баланс', value: `${userData.Point} очков` });

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'Произошла ошибка при изменении очков.', ephemeral: true });
    }
  }
};
