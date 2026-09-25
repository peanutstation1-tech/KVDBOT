require('dotenv').config();
const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

const PREFIX = process.env.PREFIX || '!';

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // 1. !KICK
    if (command === 'kick') {
        if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return message.reply('❌ You do not have permission to use this command.');
        }

        const target = message.mentions.members.first();
        if (!target) return message.reply('⚠️ Usage: `!kick @user [reason]`');
        if (!target.kickable) return message.reply('❌ I cannot kick this user (role too high).');

        const reason = args.slice(1).join(' ') || 'No reason provided';
        try {
            await target.kick(reason);
            message.reply(`✅ Successfully kicked **${target.user.tag}**. Reason: ${reason}`);
        } catch (error) {
            console.error(error);
            message.reply('❌ Error trying to kick that user.');
        }
    }

    // 2. !BAN
    else if (command === 'ban') {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply('❌ You do not have permission to use this command.');
        }

        const target = message.mentions.members.first();
        if (!target) return message.reply('⚠️ Usage: `!ban @user [reason]`');
        if (!target.bannable) return message.reply('❌ I cannot ban this user (role too high).');

        const reason = args.slice(1).join(' ') || 'No reason provided';
        try {
            await target.ban({ reason });
            message.reply(`✅ Successfully banned **${target.user.tag}**. Reason: ${reason}`);
        } catch (error) {
            console.error(error);
            message.reply('❌ Error trying to ban that user.');
        }
    }

    // 3. !TIMEOUT
    else if (command === 'timeout' || command === 'mute') {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('❌ You do not have permission to use this command.');
        }

        const target = message.mentions.members.first();
        const durationMinutes = parseInt(args[1]);
        const reason = args.slice(2).join(' ') || 'No reason provided';

        if (!target || isNaN(durationMinutes)) {
            return message.reply('⚠️ Usage: `!timeout @user [minutes] [reason]`');
        }
        if (!target.moderatable) return message.reply('❌ I cannot timeout this user (role too high).');

        const durationMs = durationMinutes * 60 * 1000;
        try {
            await target.timeout(durationMs, reason);
            message.reply(`✅ Successfully timed out **${target.user.tag}** for **${durationMinutes} minute(s)**.`);
        } catch (error) {
            console.error(error);
            message.reply('❌ Error trying to timeout that user.');
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
