const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clan")
        .setDescription("Информация о составе клана"),
        
    async execute(interaction) {
        await interaction.deferReply();

        // Получаем сервер
        const guild = interaction.guild;
        if (!guild) {
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(interaction.client.config.message.colors.error)
                    .setTitle("Сервер не найден!")]
            });
        }

        // Проверяем права бота
        if (!guild.members.me.permissions.has(PermissionsBitField.Flags.ViewAuditLog)) {
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(interaction.client.config.message.colors.error)
                    .setTitle("У меня нет прав на просмотр участников!")]
            });
        }

        let clanGroups = {
            "Коллер(-ы)": [],
            "Комбатёр(-ы)": [],
            "Фармила(-ы)": [],
            "Фермер(-ы)": [],
            "Электрик(-и)": []
        };

        // Соответствие ролей из конфига группам
        const roleMapping = {
            "Caller": "Коллер(-ы)",
            "Combat": "Комбатёр(-ы)",
            "Farmila": "Фармила(-ы)",
            "Farmer": "Фермер(-ы)",
            "Electro": "Электрик(-и)"
        };

        try {
            // Для каждой роли получаем участников
            for (const [roleKey, groupName] of Object.entries(roleMapping)) {
                const roleId = interaction.client.config.roles[roleKey];
                if (roleId) {
                    const role = guild.roles.cache.get(roleId);
                    if (role) {
                        const membersWithRole = role.members.map(member => `<@${member.user.id}>`);
                        if (membersWithRole.length > 0) {
                            clanGroups[groupName] = membersWithRole;
                        }
                    }
                }
            }

            // Создаем Embed
            const embed = new EmbedBuilder()
                .setColor(interaction.client.config.message.colors.main)
                .setTitle("📜 Состав клана")
                .setFooter({ text: interaction.client.config.message.footer });

            let hasMembers = false;

            // Добавляем группы в Embed
            for (const [groupName, members] of Object.entries(clanGroups)) {
                if (members.length > 0) {
                    embed.addFields({
                        name: `\`${groupName}\` (${members.length})`,
                        value: members.join("\n"),
                        inline: false
                    });
                    hasMembers = true;
                }
            }

            if (!hasMembers) {
                embed.setDescription("❌ В клане пока нет участников с ролями.");
            }

            // Отправляем Embed
            interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("Ошибка при получении участников:", error);
            interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(interaction.client.config.message.colors.error)
                    .setTitle("Произошла ошибка при загрузке списка участников!")]
            });
        }
    }
};
