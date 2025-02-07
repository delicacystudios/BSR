const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Points = require('../DB/points');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Посмотреть список людей с количеством голосов'),
        
    async execute(interaction) {
        try {
            const topUsers = await Points.find().sort({ Point: -1 }).limit(10);
            if (topUsers.length === 0) {
                return interaction.reply('Пока нет данных о поинтах.');
            }

            const leaderboard = topUsers.map((user, index) => `**${index + 1}.** <@${user.UserID}> - **${user.Point}** поинтов`).join('\n');

            const embed = new EmbedBuilder()
                .setTitle('🏆 Топ 10 пользователей по поинтам')
                .setColor(interaction.client.config.message.colors.main)
                .setDescription(`Вы можете проголосовать за человека, нажав на кнопку ниже\n\n` + leaderboard)
                .setFooter({ text: `${interaction.client.config.message.footer}` })
                .setTimestamp();

            const row = new ActionRowBuilder();

            // Создаём кнопки для голосования
            topUsers.forEach((user, index) => {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`vote_${user.UserID}`)
                        .setLabel(`${index + 1}`)
                        .setStyle(ButtonStyle.Primary)
                );
            });

            const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

            // Создаём коллектор для кнопок
            const filter = i => i.customId.startsWith('vote_') && !i.user.bot;
            const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (interaction) => {
                const voterId = interaction.user.id;
                const targetId = interaction.customId.split('_')[1];

                if (voterId === targetId) {
                    return interaction.reply({ content: 'Вы не можете голосовать за себя!', ephemeral: true });
                }

                const userVote = await Points.findOne({ UserID: targetId });

                if (!userVote) {
                    return interaction.reply({ content: 'Ошибка: данный пользователь не найден в базе данных.', ephemeral: true });
                }

                const lastVotedTimestamp = userVote.lastVoted || 0;
                const now = Date.now();
                const twelveHours = 12 * 60 * 60 * 1000; // 12 часов в миллисекундах

                if (now - lastVotedTimestamp < twelveHours) {
                    const timeLeft = twelveHours - (now - lastVotedTimestamp);
                    const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
                    const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));

                    return interaction.reply({
                        content: `Вы уже голосовали! Следующее голосование будет доступно через **${hoursLeft} ч. ${minutesLeft} мин.**`,
                        ephemeral: true
                    });
                }

                userVote.Point += 1;
                userVote.lastVoted = now;
                await userVote.save();

                await interaction.reply({ content: `Вы проголосовали за <@${targetId}>! Теперь у него **${userVote.Point}** голосов.`, ephemeral: true });
            });

        } catch (err) {
            console.error(err);
            interaction.reply('Произошла ошибка при получении списка голосов.');
        }
    }
};
