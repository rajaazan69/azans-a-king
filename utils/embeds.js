const { EmbedBuilder } = require('discord.js');
const { EMBED_COLOR, SUCCESS_COLOR, ERROR_COLOR, PENDING_COLOR } = require('../config');

module.exports = {
    tradeCreated: (trade) => new EmbedBuilder()
        .setColor(PENDING_COLOR)
        .setTitle('< New Trade Created >')
        .setDescription(`**Trade Between:** <@${trade.trader1.discordId}> & <@${trade.trader2.discordId}>`)
        .addFields(
            { name: 'Step 1', value: 'Both traders submit their items via modal', inline: false },
            { name: 'Step 2', value: 'Bot collects the items in the private Roblox server', inline: false },
            { name: 'Step 3', value: 'Confirmation buttons appear for release', inline: false },
            { name: 'Step 4', value: 'Bot sends items to both traders', inline: false }
        )
        .setFooter({ text: `Trade ID: ${trade.id}` })
        .setTimestamp(),

    tradeSuccess: (trade) => new EmbedBuilder()
        .setColor(SUCCESS_COLOR)
        .setTitle('< Trade Completed >')
        .setDescription('Both traders have successfully received their items.')
        .setFooter({ text: `Trade ID: ${trade.id}` })
        .setTimestamp(),

    tradeError: (msg) => new EmbedBuilder()
        .setColor(ERROR_COLOR)
        .setTitle('< Trade Error >')
        .setDescription(`**${msg}**`)
        .setTimestamp()
};