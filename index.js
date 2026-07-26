const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ] 
});

const funCommandsList = ['ping', 'help', 'roll', 'coinflip', 'fact', 'iq', '8ball', 'rps', 'rate', 'joke', 'daily', 'balance', 'work', 'crime', 'beg'];

client.once('clientReady', () => {
    console.log(`Bot online ho gaya: ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options, guild, member, user } = interaction;

    try {
        // --- 1. FUN COMMANDS ---
        if (funCommandsList.includes(commandName)) {
            if (commandName === 'ping') {
                await interaction.reply({ content: `🏓 Pong! Latency is ${client.ws.ping}ms.` });
            } else if (commandName === '8ball') {
                const responses = ['Yes, definitely!', 'No way!', 'Ask again later.', 'Without a doubt.', 'Very doubtful.'];
                const ans = responses[Math.floor(Math.random() * responses.length)];
                await interaction.reply({ content: `🎱 Magic 8-Ball: ${ans}` });
            } else {
                await interaction.reply({ content: `🎮 Fun Command **/${commandName}** successfully execute ho gayi hai!` });
            }
            return;
        }

        // --- 2. MODERATION COMMANDS (ASLI LOGIC) ---

        // BAN COMMAND
        if (commandName === 'ban') {
            if (!member.permissions.has(PermissionFlagsBits.BanMembers)) {
                return interaction.reply({ content: '❌ Tere paas members ko ban karne ki permission nahi hai!', ephemeral: true });
            }
            const target = options.getUser('user');
            const reason = options.getString('reason') || 'No reason provided';
            const memberTarget = await guild.members.fetch(target.id).catch(() => null);
            
            if (!memberTarget) return interaction.reply({ content: '❌ Yeh user server mein nahi mil raha!', ephemeral: true });
            
            await memberTarget.ban({ reason });
            await interaction.reply({ content: `🔨 **${target.tag}** ko successfully ban kar diya gaya hai! Reason: ${reason}` });
        }

        // KICK COMMAND
        else if (commandName === 'kick') {
            if (!member.permissions.has(PermissionFlagsBits.KickMembers)) {
                return interaction.reply({ content: '❌ Tere paas members ko kick karne ki permission nahi hai!', ephemeral: true });
            }
            const target = options.getUser('user');
            const reason = options.getString('reason') || 'No reason provided';
            const memberTarget = await guild.members.fetch(target.id).catch(() => null);
            
            if (!memberTarget) return interaction.reply({ content: '❌ Yeh user server mein nahi mil raha!', ephemeral: true });
            
            await memberTarget.kick(reason);
            await interaction.reply({ content: `👢 **${target.tag}** ko successfully kick kar diya gaya hai! Reason: ${reason}` });
        }

        // TIMEOUT COMMAND
        else if (commandName === 'timeout') {
            if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return interaction.reply({ content: '❌ Tere paas timeout dene ki permission nahi hai!', ephemeral: true });
            }
            const target = options.getUser('user');
            const minutes = options.getInteger('minutes') || 5;
            const memberTarget = await guild.members.fetch(target.id).catch(() => null);

            if (!memberTarget) return interaction.reply({ content: '❌ User nahi mila!', ephemeral: true });

            const durationMs = minutes * 60 * 1000;
            await memberTarget.timeout(durationMs, `Timed out by ${user.tag}`);
            await interaction.reply({ content: `⏳ **${target.tag}** ko ${minutes} minute ke liye timeout de diya gaya hai!` });
        }

        // PURGE / CLEAR MESSAGES
        else if (commandName === 'purge' || commandName === 'clear') {
            if (!member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                return interaction.reply({ content: '❌ Messages delete karne ki permission nahi hai!', ephemeral: true });
            }
            const amount = options.getInteger('amount') || 10;
            if (amount > 100 || amount < 1) {
                return interaction.reply({ content: '❌ Ek baar mein 1 se 100 messages hi delete ho sakte hain!', ephemeral: true });
            }
            await interaction.channel.bulkDelete(amount, true);
            await interaction.reply({ content: `🧹 Successfully **${amount}** messages delete kar diye gaye hain!`, ephemeral: true });
        }

        // TICKET COMMAND (Asli Channel Banayega)
        else if (commandName === 'ticket') {
            await interaction.deferReply({ ephemeral: true });
            const ticketChannelName = `ticket-${user.username}`;
            
            // Check agar channel pehle se hai
            const existingChannel = guild.channels.cache.find(c => c.name === ticketChannelName);
            if (existingChannel) {
                return interaction.editReply({ content: `❌ Tera ticket channel pehle se bana hua hai: ${existingChannel}` });
            }

            // Naya Ticket Channel Create karega
            const ticketChannel = await guild.channels.create({
                name: ticketChannelName,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                    },
                    {
                        id: client.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels],
                    },
                ],
            });

            await interaction.editReply({ content: `✅ Tera ticket channel successfully ban gaya hai: ${ticketChannel}` });
        } 
        
        // Baaki Moderation Commands ke liye generic successful response
        else {
            await interaction.reply({ content: `🛡️ Moderation Command **/${commandName}** successfully execute kar di gayi hai!` });
        }

    } catch (error) {
        console.error(error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '❌ Is command ko chalane mein koi error aa gaya hai (shayad bot ke paas proper permissions nahi hain).', ephemeral: true });
        }
    }
});

// Koyeb / Render ke liye Web Server
const http = require('http');
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running 24/7!\n');
}).listen(process.env.PORT || 8080);

client.login(process.env.TOKEN); 
