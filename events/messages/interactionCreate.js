const { EmbedBuilder } = require('discord.js');

module.exports = async (client, interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(`❌ Ошибка при выполнении команды ${interaction.commandName}:`, error);
        await interaction.reply({ content: "Произошла ошибка при выполнении команды!", ephemeral: true });
    }
}