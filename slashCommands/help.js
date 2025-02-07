const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, time } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Помощь по командам / Список команд")
    .addStringOption(option =>
      option.setName("command")
        .setDescription("Укажите команду для получения дополнительной информации")
        .setRequired(false)
    ),

  async execute(interaction) {
    const { client } = interaction;
    const prefix = client.config.bot.prefix;
    const args = interaction.options.getString("command");

    // If no command is passed, show the general help
    if (!args) {
      const Info = client.commands.filter(x => x.category == 'General')
        .map((x) => `\`${prefix}${x.name} ${x.usage ? " " + x.usage : ""}\` — ${x.description}`).join('\n');

      const Points = client.commands.filter(x => x.category == 'Points')
        .map((x) => `\`${prefix}${x.name} ${x.usage ? " " + x.usage : ""}\` — ${x.description}`).join('\n');

      const general = new EmbedBuilder()
        .setAuthor({ name: `Категория: General` })
        .setColor(client.config.message.colors.main)
        .setDescription(Info)
        .setImage(`https://media.discordapp.net/attachments/1335354028665606275/1336257982249304137/IMG_0652.JPEG`)
        .setTimestamp();

      const points = new EmbedBuilder()
        .setAuthor({ name: `Категория: Points` })
        .setColor(client.config.message.colors.main)
        .setDescription(Points)
        .setImage(`https://media.discordapp.net/attachments/1335354028665606275/1336257982249304137/IMG_0652.JPEG`)
        .setTimestamp();

      const intro = new EmbedBuilder()
        .setAuthor({ name: `♡ Меню помощи по командам BSR Bot ♡` })
        .setColor(client.config.message.colors.main)
        .setDescription(`Чтобы посмотреть категории команд, используйте меню ниже\n\n\`< >\` — Необязательные аргументы\n\`[ ]\` — Обязательные аргументы`)
        .setImage(`https://media.discordapp.net/attachments/1335354028665606275/1336257982249304137/IMG_0652.JPEG`)
        .setFooter({ text: `Получите информацию о команде: ${prefix}help <команда>` });

      let helpMenu = new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('help-menu')
            .setPlaceholder(`Выберите категорию...`)
            .addOptions([
              {
                label: `General`,
                description: `Основные команды MetaBot`,
                value: `1`,
                emoji: `<:world:1193133225938272266>`
              },
              {
                label: `Points`,
                description: `Категория поинтов`,
                value: `2`,
                emoji: `<:world:1193133225938272266>`
              }
            ])
        );

      const button = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel(`Telegram`)
            .setURL(`https://test.com`)
            .setStyle('Link'),
          new ButtonBuilder()
            .setLabel("ВК")
            .setStyle("Link")
            .setURL(`https://test.com`),
          new ButtonBuilder()
            .setLabel("TikTok")
            .setStyle("Link")
            .setURL(`https://test.com`),
        );

      const filter = (interaction) =>
        interaction.isSelectMenu() &&
        interaction.user.id === interaction.user.id;

      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        idle: 60 * 1000
      });

      collector.on('collect', async (collected) => {
        if (collected.values[0] === '1') {
          collected.reply({ embeds: [general], ephemeral: true }).catch(() => collected.editReply({ embeds: [general], ephemeral: true }));
        } else if (collected.values[0] === '2') {
          collected.reply({ embeds: [points], ephemeral: true }).catch(() => collected.editReply({ embeds: [points], ephemeral: true }));
        }
      });

      const content = {
        embed: intro,
        component: helpMenu,
        button: button
      };

      await interaction.reply({ embeds: [content.embed], components: [content.component, content.button] });

      collector.on('end', async () => {
        const helpMenu2 = new ActionRowBuilder()
          .addComponents(
            new StringSelectMenuBuilder()
              .setCustomId('help-menu')
              .setPlaceholder(`Время вышло...`)
              .setDisabled(true)
              .addOptions([
                {
                  label: `Информация`,
                  description: 'Главная категория бота',
                  value: `1`
                }
              ])
          );

        await interaction.editReply({ components: [helpMenu2, content.button] }).catch((e) => console.log('Сообщение не найдено!'));
      });

    } else {
      // If command is provided, show information about that command
      const command = client.commands.get(args.toLowerCase()) ||
        client.commands.find((c) => c.aliases && c.aliases.includes(args.toLowerCase()));

      if (command) {
        let mes = new EmbedBuilder()
          .setColor(client.config.message.colors.main)
          .setThumbnail(client.user.avatarURL({ dynamic: true }))
          .setAuthor({ name: `${prefix}${command.name} ・ Описание`, iconURL: `https://cdn.discordapp.com/emojis/880113401207095346.webp` })
          .setDescription(`\`${command.description ? command.description : `Без описания.`}\` \n\n_ _`)
          .addFields(
            {
              name: `  X ・ Вторичное название:  `,
              value: `╰ \` [ ${command.aliases ? command.aliases : `Без вторичных названий.`} ] \``,
            },
            {
              name: `  X ・ Пример:  `,
              value: `╰ \` ${prefix}${command.name} ${command.usage ? command.usage : `Нет примеров использования!`} \``,
            },
            {
              name: `  X ・ Категория:  `,
              value: `╰ \` ${command.category ? command.category : 'Без категории'} \``,
              inline: true
            }
          );

        await interaction.reply({ embeds: [mes] });
      } else {
        const lala = new EmbedBuilder()
          .setColor(client.config.message.colors.error)
          .setDescription(`Неверная команда!`);

        await interaction.reply({ embeds: [lala] });
      }
    }
  }
};
