const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: "help",
  description: `Помощь по командам / Список команд`,
  aliases: ['h', 'рудз', 'хелп', 'помощь', 'помоги'],
  category: `General`,
  usage: [`<команда>`],

  run: async (client, message, args) => {
    let prefix = client.config.bot.prefix;
    // // // // //
    let command;
    if (args[0]) {
      command =
        client.commands.get(args[0].toLowerCase()) ||
        client.commands.find(
          (c) =>
            c.aliases &&
            c.aliases.includes(args[0].toLowerCase())
        );
    }

    if (!args[0]) {
      const Info = message.client.commands.filter(x => x.category == 'General')
        .map((x) =>
          `\`${prefix}` + x.name + `${x.usage ? " " + x.usage : ""}\` — ` + x.description + ``).join('\n');

      const Points = message.client.commands.filter(x => x.category == 'Points')
        .map((x) =>
          `\`${prefix}` + x.name + `${x.usage ? " " + x.usage : ""}\` — ` + x.description + ``).join('\n');


      const general = new EmbedBuilder()
        .setAuthor({ name: `Категория: General` })
        .setColor(client.config.message.colors.main)
        .setDescription(Info)
        .setImage(`https://media.discordapp.net/attachments/1335354028665606275/1336257982249304137/IMG_0652.JPEG`)
        .setTimestamp()

        const points = new EmbedBuilder()
        .setAuthor({ name: `Категория: Points` })
        .setColor(client.config.message.colors.main)
        .setDescription(Points)
        .setImage(`https://media.discordapp.net/attachments/1335354028665606275/1336257982249304137/IMG_0652.JPEG`)
        .setTimestamp()

      ///// ///// ///// ///// /////


      const intro = new EmbedBuilder()
        .setAuthor({ name: `♡  Меню помощи по конмадам BSR Bot ♡` })
        .setColor(client.config.message.colors.main)
        .setDescription(`Чтобы посмотреть категории команд, используйте меню ниже

\`< >\` — Необязательные аргументы
\`[ ]\` — Обязательные аргументы`)
        .setImage(`https://media.discordapp.net/attachments/1335354028665606275/1336257982249304137/IMG_0652.JPEG`)
        .setFooter({ text: `Получите информацию о команде: ${prefix}help <команда>` })
    
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
                emoji: `${`<:world:1193133225938272266>`}`
              },
              {
                label: `Points`,
                description: `Категория поинтов`,
                value: `2`,
                emoji: `${`<:world:1193133225938272266>`}`
              }
            ])
        )

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
        )

      const filter = (interaction) =>
        interaction.isSelectMenu() &&
        interaction.user.id === message.author.id;

      const collector = message.channel.createMessageComponentCollector({
        filter,
        idle: 60 * 1000
      });

      collector.on('collect', async (collected) => {
        if (collected.values[0] === '1') {
          collected.reply({ embeds: [general], ephemeral: true }).catch(
            () => collected.editReply({ embeds: [general], ephemeral: true })
          )
        } else if (collected.values[0] === '2') {
          collected.reply({ embeds: [points], ephemeral: true }).catch(
            () => collected.editReply({ embeds: [points], ephemeral: true })
          )
        }
      })

      const content = {
        embed: intro,
        component: helpMenu,
        button: button
      }
      const onwer = await client.users.cache.get(message.author.id);

      const mss12 = await message.channel.send({ embeds: [content.embed], components: [content.component, content.button] }).catch(
        (e) => onwer.send({ content: `Sorry, an error occurred while trying to use this command. Probably ${premstatus} doesn't have enough rights to write in that channel` })
      )

      collector.on('end', async message => {
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
          )
        mss12.edit({ components: [helpMenu2, content.button] }).catch(
          (e) => console.log('Сообщение не найдено!')
        )
      })

    } else if (command) {
      let mes = new EmbedBuilder()
        .setColor(client.config.message.colors.main)
        .setThumbnail(client.user.avatarURL({ dynamic: true }))
        .setAuthor({ name: `${prefix}${command.name} ・ Описание`, iconURL: `https://cdn.discordapp.com/emojis/880113401207095346.webp` })
        .setDescription(`\` ${command.description ? command.description : `Без описания.`} \` \n\n_ _`)
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
        )
      message.channel.send({ embeds: [mes] })
    } else {
      const lala = new EmbedBuilder()
        .setColor(client.config.message.colors.error)
        .setDescription(`Неверная команда!`)
      message.channel.send({ embeds: [lala] })
    }
  }
}