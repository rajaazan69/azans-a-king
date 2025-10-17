const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');
const robloxTrades = require('../../roblox/trades');

module.exports = {
    // When "Create Trade" button is clicked
    handleButton: async (interaction) => {
        if (interaction.customId !== 'create_trade') return;

        // Open the trade modal
        const modal = new ModalBuilder()
            .setCustomId('trade_modal')
            .setTitle('Create Trade');

        const otherDiscordId = new TextInputBuilder()
            .setCustomId('otherDiscordId')
            .setLabel('Other user’s Discord ID')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const yourRoblox = new TextInputBuilder()
            .setCustomId('yourRoblox')
            .setLabel('Your Roblox username')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const otherRoblox = new TextInputBuilder()
            .setCustomId('otherRoblox')
            .setLabel('Other user’s Roblox username')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const yourItems = new TextInputBuilder()
            .setCustomId('yourItems')
            .setLabel('Your items (comma separated)')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const otherItems = new TextInputBuilder()
            .setCustomId('otherItems')
            .setLabel('Other user’s items (comma separated)')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(otherDiscordId),
            new ActionRowBuilder().addComponents(yourRoblox),
            new ActionRowBuilder().addComponents(otherRoblox),
            new ActionRowBuilder().addComponents(yourItems),
            new ActionRowBuilder().addComponents(otherItems)
        );

        await interaction.showModal(modal);
    },

    // When modal is submitted
    handleModal: async (interaction) => {
        if (interaction.customId !== 'trade_modal') return;

        // Extract data from modal
        const otherDiscordId = interaction.fields.getTextInputValue('otherDiscordId');
        const yourRoblox = interaction.fields.getTextInputValue('yourRoblox');
        const otherRoblox = interaction.fields.getTextInputValue('otherRoblox');
        const yourItems = interaction.fields.getTextInputValue('yourItems');
        const otherItems = interaction.fields.getTextInputValue('otherItems');

        // Send confirmation embed
        const confirmEmbed = new EmbedBuilder()
            .setTitle('Confirm Roblox Usernames')
            .setDescription(
                `**Your Roblox:** ${yourRoblox}\n**Other Roblox:** ${otherRoblox}\n\n` +
                `If this info is correct, click **Confirm** below.`
            )
            .setColor('Yellow');

        const confirmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('confirm_usernames')
                .setLabel('✅ Confirm')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('cancel_trade')
                .setLabel('❌ Cancel')
                .setStyle(ButtonStyle.Danger)
        );

        await interaction.reply({ embeds: [confirmEmbed], components: [confirmRow] });

        // Temporarily store info for next step
        interaction.client.tempTrade = {
            creatorId: interaction.user.id,
            otherDiscordId,
            yourRoblox,
            otherRoblox,
            yourItems,
            otherItems
        };
    },

    // When confirming usernames
    handleConfirm: async (interaction) => {
        if (interaction.customId === 'confirm_usernames') {
            const trade = interaction.client.tempTrade;
            if (!trade) return interaction.reply({ content: 'No active trade found.', ephemeral: true });

            const depositEmbed = new EmbedBuilder()
                .setTitle('Deposit Instructions')
                .setDescription(
                    `✅ Roblox usernames confirmed!\n\nNow please deposit your items into the bot account.\n\n` +
                    `**Your Roblox:** ${trade.yourRoblox}\n` +
                    `**Items to send:** ${trade.yourItems}\n\nOnce the bot receives your items, the trade will proceed automatically.`
                )
                .setColor('Green');

            await interaction.update({ embeds: [depositEmbed], components: [] });

            // Start monitoring (from roblox/trades.js)
            robloxTrades.monitorTrade(trade, interaction.client);
        }

        if (interaction.customId === 'cancel_trade') {
            await interaction.update({ content: '❌ Trade cancelled.', embeds: [], components: [] });
            interaction.client.tempTrade = null;
        }
    }
};