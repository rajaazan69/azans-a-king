const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    execute: async (client, message) => {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('create_trade')
                    .setLabel('Create Trade')
                    .setStyle(ButtonStyle.Primary)
            );

        await message.channel.send({
            content: '**< MM2 Escrow Panel >**\nClick the button below to create a new trade.',
            components: [row]
        });
    }
};
