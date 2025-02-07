const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'clan',
    aliases: ['клан'],
    description: 'Информация о составе клана',
    category: `General`,
    usage: [],

    run: async (client, message, args) => {
        // Получаем сервер по ID из конфига
        const serverId = client.config.serverID;
        if (!serverId) {
            return message.channel.send({
                embeds: [new EmbedBuilder().setColor(client.config.message.colors.error).setTitle('Не указан ID сервера в конфиге!')]
            });
        }

        // Получаем сервер
        const guild = client.guilds.cache.get(serverId);
        if (!guild) {
            return message.channel.send({
                embeds: [new EmbedBuilder().setColor(client.config.message.colors.error).setTitle('Сервер с таким ID не найден.')]
            });
        }

        if (!guild.members.me.permissions.has(PermissionsBitField.Flags.ViewAuditLog)) {
            return message.channel.send({
                embeds: [new EmbedBuilder().setColor(client.config.message.colors.error).setTitle('У меня нет прав на просмотр участников!')]
            });
        }

        let clanGroups = {
            'Коллер(-ы)': [],
            'Комбатёр(-ы)': [],
            'Фармила(-ы)': [],
            'Фермер(-ы)': [],
            'Электрик(-и)': []
        };

        // Соответствие ролей из конфига группам
        const roleMapping = {
            'Caller': 'Коллер(-ы)',
            'Combat': 'Комбатёр(-ы)',
            'Farmila': 'Фармила(-ы)',
            'Farmer': 'Фермер(-ы)',
            'Electro': 'Электрик(-и)'
        };

        try {
            // Для каждой роли выполняем поиск участников по ID роли
            for (const [roleKey, groupName] of Object.entries(roleMapping)) {
                const roleId = client.config.roles[roleKey];
                if (roleId) {
                    const role = guild.roles.cache.get(roleId);
                    if (role) {
                        // Получаем всех участников с этой ролью
                        const membersWithRole = role.members.map(member => `<@${member.user.id}>`);
                        if (membersWithRole.length > 0) {
                            clanGroups[groupName] = membersWithRole;
                        }
                    }
                }
            }

            // Создаем Embed для вывода информации
            const embed = new EmbedBuilder()
                .setColor(client.config.message.colors.main)
                .setTitle(`📜 Состав клана`)
                .setFooter({ text: client.config.message.footer });

            let hasMembers = false;

            // Добавляем в embed участников каждой группы
            for (const [groupName, members] of Object.entries(clanGroups)) {
                if (members.length > 0) {
                    embed.addFields({
                        name: `\`${groupName}\` (${members.length})`,
                        value: members.join('\n'),
                        inline: false
                    });
                    hasMembers = true;
                }
            }

            if (!hasMembers) {
                embed.setDescription(`❌ В клане пока нет участников с ролями.`);
            }

            // Отправляем embed с информацией
            message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error(`Ошибка при получении участников:`, error);
            message.channel.send({
                embeds: [new EmbedBuilder().setColor(client.config.message.colors.error).setTitle('Произошла ошибка при загрузке списка участников!')]
            });
        }
    }
};
