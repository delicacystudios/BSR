const { Client, Collection, Partials } = require("discord.js");
const { REST, Routes } = require('discord.js');

const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: 38401,
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
        Partials.Reaction
    ],
    presence: {
        activities: [{
            name: "префикс: b/",
            type: 3
        }],
        status: 'idle'
    }
});

client.config = require("./config.js");
client.commands = new Collection();
client.aliases = new Collection();
client.slashCommands = new Collection();

fs.readdirSync('./events/').forEach(dirs => {
    const events = fs.readdirSync(`./events/${dirs}`).filter(files => files.endsWith('.js'))
    for (const file of events) {
        const event = require(`./events/${dirs}/${file}`)
        client.on(file.split(".")[0], event.bind(null, client))
    }
});

fs.readdirSync(`./commands/`).forEach(dir => {
    const commands = fs.readdirSync(`./commands/${dir}/`).filter(file => file.endsWith(".js"));
    for (let file of commands) {
        let pull = require(`./commands/${dir}/${file}`);
        if (pull.name) {
            client.commands.set(pull.name, pull);
        } else {
            console.log(`❌: ${file}`)
            continue;
        }
        if (pull.aliases && Array.isArray(pull.aliases)) 
            pull.aliases.forEach(alias => client.aliases.set(alias, pull.name))
    }
});

const loadSlashCommands = async () => {
    const slashCommands = [];
    const slashCommandsPath = path.join(__dirname, 'slashCommands');
    
    if (!fs.existsSync(slashCommandsPath)) {
        console.log("❌ Папка slashCommands не найдена!");
        return;
    }

    const commandFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`${slashCommandsPath}/${file}`);
        if (!command.data || !command.execute) {
            console.log(`❌ Ошибка в файле ${file}: отсутствует data или execute`);
            continue;
        }

        client.slashCommands.set(command.data.name, command);
        slashCommands.push(command.data.toJSON());
    }

    const rest = new REST({ version: '10' }).setToken(client.config.bot.token);

    try {
        console.log("🔄 Обновление слеш-команд...");
        await rest.put(
            Routes.applicationCommands(client.config.bot.clientID), 
            { body: slashCommands }
        );
        console.log("✅ Слеш-команды успешно загружены!");
    } catch (error) {
        console.error("❌ Ошибка загрузки слеш-команд:", error);
    }
};

loadSlashCommands();

client.login(client.config.bot.token);