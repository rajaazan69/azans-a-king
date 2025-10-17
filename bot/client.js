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
const eventFiles = ['ready', 'interactionCreate', 'messageCreate'];

eventFiles.forEach(file => {
    if (file === 'ready') {
        // ready event only needs client
        require(`./events/${file}`)(client);
    } else if (file === 'interactionCreate') {
        const event = require(`./events/${file}`);
        // pass client + interaction to your handler
        client.on('interactionCreate', interaction => event(client, interaction));
    } else if (file === 'messageCreate') {
        const event = require(`./events/${file}`);
        // pass client + message to your handler
        client.on('messageCreate', message => event(client, message));
    }
});

// Login to Discord
client.login(DISCORD_TOKEN);

module.exports = client;