const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const embeds = require('../../utils/embeds');
const tradeStore = require('../../utils/tradeStore');
const robloxTrades = require('../../roblox/trades');

module.exports = {
    handleModal: async (interaction) => {
        if (interaction.customId !== 'trade_modal') return;

        const otherDiscordId = interaction.fields.getTextInputValue('otherDiscordId');
        const yourRoblox = interaction.fields.getTextInputValue('yourRoblox');
        const otherRoblox = interaction.fields.getTextInputValue('otherRoblox');
        const yourItems = interaction.fields.getTextInputValue('yourItems').split(',').map(i => i.trim());
        const otherItems = interaction.fields.getTextInputValue('otherItems').split(',').map(i => i.trim());

        const tradeId = Date.now().toString();
        const tradeData = {
            id: tradeId,
            channelId: interaction.channelId,
            trader1: { discordId: interaction.user.id, roblox: yourRoblox, items: yourItems, itemsReceived: false },
            trader2: { discordId: otherDiscordId, roblox: otherRoblox, items: otherItems, itemsReceived: false },
            status: 'pending_items'
        };

        tradeStore.set(tradeId, tradeData);

        const embed = embeds.tradeCreated(tradeData);
        await interaction.reply({ embeds: [embed] });

        // Start monitoring for collection
        robloxTrades.monitorTrade(tradeData, tradeStore, interaction.client);
    },

    handleButton: async (interaction) => {
        const tradeId = interaction.customId.split('_')[1];
        const trade = tradeStore.get(tradeId);
        if (!trade) return interaction.reply({ content: 'Trade not found!', ephemeral: true });

        if (interaction.customId.startsWith('confirm')) {
            // Confirmation logic here
        } else if (interaction.customId.startsWith('cancel')) {
            // Cancellation logic here
        }
    }
};
