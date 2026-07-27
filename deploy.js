const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [];

// 15 Fun Commands
const funCommands = ['ping', 'help', 'roll', 'coinflip', 'fact', 'iq', '8ball', 'rps', 'rate'];
funCommands.forEach(name => {
    commands.push(new SlashCommandBuilder().setName(name).setDescription(`Fun Command: ${name}`));
});

// 25 Moderation Commands
const modCommands = [
    'timeout', 'ban', 'kick', 'purge', 'lock', 'unlock', 'slowmode', 'warn', 'nuke',
    'mute', 'unmute', 'tempmute', 'softban', 'clear', 'lockdown', 'unlockdown',
    'createrole', 'deleterole', 'setnick', 'warnlist', 'clearwarns', 'setlogs',
    'setwelcome', 'setleave', 'ticket'
];
modCommands.forEach(name => {
    commands.push(new SlashCommandBuilder().setName(name).setDescription(`Moderation Command: ${name}`));
});

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Refreshing 40 application commands...');
      
        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands.map(command => command.toJSON()) },
        );
        

        console.log(`Successfully reloaded ${data.length} application commands!`);
    } catch (error) {
        console.error(error);
    }
})();
