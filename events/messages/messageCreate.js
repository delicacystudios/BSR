const { EmbedBuilder } = require('discord.js');

module.exports = async (client, message) => {
    if (message.channel.type !== 0) return;
    if (message.author.bot) return;
    
    let prefix = client.config.bot.prefix;

    if (!message.content.startsWith(prefix)) return;
    if (!message.guild) return;
    if (!message.member) message.member = await message.guild.fetchMember(message);

    if (message.content.indexOf(prefix) !== 0) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    const cmd = client.commands.get(command) ||
    client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command));

    if (cmd) {
        try {
            cmd.run(client, message, args);
        } catch (err) {
            console.log(`Произошла ошибка при выполнении команды ${cmd.name}: ${err}`);
            const embed1 = new EmbedBuilder()
                .setColor(client.config.message.colors.error)
                .setDescription(`Произошла ошибка при выполнении команды ${cmd.name}: ${err}`)
            try {
                message.reply({ embeds: [embed1] });
            } catch (err) {
                console.log(`Ошибка при отправке сообщения: ${err}`);
            }
        }
    } else {
        const embed = new EmbedBuilder()
            .setColor(client.config.message.colors.error)
            .setDescription(`Команда \`${command}\` не найдена.`)
        try {
            message.reply({ embeds: [embed] });
        } catch (err) {
            console.log(`Ошибка при отправлении команды ${command}: ${err}`);
        }
    }
}