const Points = require('../../DB/points');
const activeUsers = new Map(); // Хранит { userId: timestamp входа }

module.exports = async (oldState, newState) => {
    const userId = newState.id;
    const member = newState.guild.members.cache.get(userId); // Получаем информацию о пользователе

    // Если пользователь зашёл в голосовой канал
    if (!oldState.channelId && newState.channelId) {
        activeUsers.set(userId, Date.now());
        // Начинаем отслеживание поинтов для пользователя
        trackPoints(userId, member);
    }

    // Если пользователь вышел из голосового канала
    if (oldState.channelId && !newState.channelId) {
        activeUsers.delete(userId);
    }
};

// Функция отслеживания поинтов
async function trackPoints(userId, member) {
    let lastChecked = Date.now();

    // Запускаем интервал для начисления поинтов каждые 10 секунд
    const interval = setInterval(async () => {
        const joinTimestamp = activeUsers.get(userId);
        if (!joinTimestamp) {
            clearInterval(interval); // Если пользователь больше не в голосе, останавливаем интервал
            return;
        }

        const timeSpent = Date.now() - joinTimestamp; // Время в голосе в миллисекундах
        const secondsSpent = Math.floor(timeSpent / 1000); // Количество полных секунд

        if (secondsSpent >= 10) {
            // Начисляем 1 поинт за каждые 10 секунд
            const userData = await Points.findOne({ UserID: userId }) || new Points({ UserID: userId, Point: 0 });
            userData.Point += 1; // Начисляем поинт
            await userData.save();

            // Отправляем сообщение в личку о начисленных поинтах
            if (member) {
                try {
                    await member.send(`Вы получили 1 поинт за каждую минуту в голосовом канале!`);
                } catch (error) {
                    console.error(`Не удалось отправить сообщение пользователю ${userId}: ${error}`);
                }
            }

            lastChecked = Date.now(); // Обновляем время последней проверки
        }
    }, 10 * 1000); // Проверяем каждые 10 секунд
}
