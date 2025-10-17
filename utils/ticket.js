const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { TRADE_CATEGORY_ID } = require('../config');

module.exports = {
    createTradeTicket: async (client, user, ticketName) => {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const channel = await guild.channels.create({
            name: `trade-${ticketName}`,
            type: 0, // GUILD_TEXT
            parent: TRADE_CATEGORY_ID,
            permissionOverwrites: [
                { id: guild.id, deny: ['ViewChannel'] },
                { id: user.id, allow: ['ViewChannel', 'SendMessages'] }
            ]
        });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('Close Ticket')
                    .setStyle(ButtonStyle.Danger)
            );

        await channel.send({ content: `**< Trade Ticket Created >**\nUser: <@${user.id}>`, components: [row] });
        return channel;
    }
};
