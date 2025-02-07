const { EmbedBuilder, time, SlashCommandBuilder } = require('discord.js');
const Warns = require('../DB/warns'); // Модель для варнов
const Points = require('../DB/points'); // Модель для поинтов

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Информация о пользователе')
        .addUserOption(option =>
            option.setName('пользователь')
                .setDescription('Укажите пользователя')
                .setRequired(false)
        ),
    
    async execute(interaction) {
        const { guild, client } = interaction;
        const member = interaction.options.getMember('пользователь') || interaction.member;
        const ava = member.user.avatarURL({ dynamic: true, size: 1024 });

        // Получаем баланс поинтов пользователя
        const userPoints = await Points.findOne({ UserID: member.user.id });
        const points = userPoints ? userPoints.Point : 0;

        let clanRoles = [];
        let inClan = false;

        if (member.roles.cache.has(client.config.roles.member)) {
            inClan = true;
        }

        Object.entries(client.config.roles).forEach(([key, roleId]) => {
            if (key !== 'member' && member.roles.cache.has(roleId)) {
                clanRoles.push(`<@&${roleId}>`);
            }
        });

        // Получаем историю варнов пользователя из базы данных
        const warns = await Warns.find({ UserID: member.user.id }).sort({ Date: -1 });

        const embed = new EmbedBuilder()
            .setColor(client.config.message.colors.main)
            .setThumbnail(ava)
            .setTitle(`Информация по пользователю: ${member.user.username}`)
            .addFields(
                { 
                    name: `\n\n\`  Пользователь:  \``, 
                    value: `> <@${member.user.id}> \n> (${points} поинтов)`, 
                    inline: true 
                }
            );

        if (inClan) {
            embed.addFields({
                name: `\`  В клане?:  \``,
                value: `> ✅ \n\n`,
                inline: true
            });
        } else {
            embed.addFields({
                name: `\`  В клане?:  \``,
                value: `> ❌ \n\n`,
                inline: true
            });
        }

        if (clanRoles.length > 0) {
            embed.addFields({
                name: `\`  Роль в клане:  \``,
                value: `> ${clanRoles.join('︰')} \n\n`,
                inline: false
            });
        }

        embed.addFields(
            { 
                name: `\`  Дата вступления:  \``, 
                value: `> ${time(Math.floor(member.joinedTimestamp / 1000), 'F')} (${time(Math.floor(member.joinedTimestamp / 1000), 'R')}) \n\n`
            }
        );

        // Добавляем историю варнов в embed
        if (warns.length > 0) {
            const warnList = warns.map((warn, index) => {
                return `> **#${index + 1}** - Причина: ${warn.Reason}\n> Выдано: <@${warn.WarnedBy}>\n> Дата: ${time(Math.floor(warn.Date / 1000), 'F')}\n`;
            }).join('\n');

            embed.addFields({
                name: `\`  История варнов:  \``,
                value: warnList,
                inline: false
            });
        } else {
            embed.addFields({
                name: `\`  История варнов:  \``,
                value: '> У этого пользователя нет варнов.',
                inline: false
            });
        }

        embed.setImage(`https://media.discordapp.net/attachments/1335354028665606275/1336257982249304137/IMG_0652.JPEG`);
        embed.setFooter({ text: `${client.config.message.footer}` });
        await interaction.reply({ embeds: [embed] });
    }
};
