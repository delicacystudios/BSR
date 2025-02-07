const { SlashCommandBuilder, EmbedBuilder, version } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bot")
    .setDescription("Информация по боту"),

  async execute(interaction) {
    const client = interaction.client;
    const uptime = client.uptime;

    const embed = new EmbedBuilder()
      .setColor(client.config.message.colors.main)
      .setThumbnail(client.user.avatarURL({ dynamic: true }))
      .setTitle(`Информация по боту: ${client.user.username}`)
      .setDescription(`\`\`\`                       
        ID: ${client.user.id}
        Версия: v${require("../package.json").version}
      \`\`\``)
      .addFields(
        {
          name: `Statistics:`,
          value: `
            Пользователей: \`${client.users.cache.size}\`
            Серверов: \`${client.guilds.cache.size}\`
            Каналов: \`${client.channels.cache.size}\`
            Команд: \`${client.commands.size}\`
          `,
          inline: true
        },
        {
          name: `System information:`,
          value: `
            RAM: \`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} Mb.\`
            Uptime: \`${uptime}\`
            Discord.js: \`v${version}\`
            NodeJS: \`${process.version}\`
          `,
          inline: true
        }
      );

    return interaction.reply({ embeds: [embed] });
  }
};
