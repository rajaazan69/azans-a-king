const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const { DISCORD_TOKEN } = require('../config');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

client.commands = new Collection();

// Load events
['ready', 'interactionCreate', 'messageCreate'].forEach(file => {
    require(`./events/${file}`)(client);
});

client.login(DISCORD_TOKEN);

module.exports = client;
