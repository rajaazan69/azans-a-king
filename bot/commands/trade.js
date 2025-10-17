const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');
const robloxTrades = require('../../roblox/trades'); // for item collection

module.exports = {
    // When "Create Trade" button clicked
    handleButton: async (interaction) => {
        if (interaction.customId !== 'create_trade') return;

        // Build modal
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
            .setLabel('Your Roblox Username')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const otherRoblox = new TextInputBuilder()
            .setCustomId('otherRoblox')
            .setLabel('Other user’s Roblox Username')
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

        // Extract modal data
        const otherDiscordId = interaction.fields.getTextInputValue('otherDiscordId');
        const yourRoblox = interaction.fields.getTextInputValue('yourRoblox');
        const otherRoblox = interaction.fields.getTextInputValue('otherRoblox');
        const yourItems = interaction.fields.getTextInputValue('yourItems');
        const otherItems = interaction.fields.getTextInputValue('otherItems');

        // Show confirmation embed
        const confirmEmbed = new EmbedBuilder()
            .setTitle('Confirm Roblox Usernames')
            .setColor('Yellow')
            .setDescription(
                `**Your Roblox:** ${yourRoblox}\n` +
                `**Other Roblox:** ${otherRoblox}\n\n` +
                `If everything is correct, click **Confirm** below.`
            );

        const confirmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`confirm_usernames_${interaction.user.id}`)
                .setLabel('✅ Confirm')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`cancel_trade_${interaction.user.id}`)
                .setLabel('❌ Cancel')
                .setStyle(ButtonStyle.Danger)
        );

        // Store info in this message’s metadata (not global)
        await interaction.reply({
            embeds: [confirmEmbed],
            components: [confirmRow],
            ephemeral: true
        });

        // Attach info temporarily to client for this user only
        interaction.client[`trade_${interaction.user.id}`] = {
            yourRoblox,
            otherRoblox,
            yourItems,
            otherItems,
            otherDiscordId
        };
    },

    // When confirming usernames or cancelling
    handleConfirm: async (interaction) => {
        const uid = interaction.user.id;
        const tradeData = interaction.client[`trade_${uid}`];

        if (interaction.customId === `confirm_usernames_${uid}`) {
            if (!tradeData) return interaction.reply({ content: 'No trade data found.', ephemeral: true });

            const depositEmbed = new EmbedBuilder()
                .setTitle('Deposit Instructions')
                .setColor('Green')
                .setDescription(
                    `✅ Roblox usernames confirmed!\n\n` +
                    `Now please deposit your items to the bot account.\n\n` +
                    `**Your Roblox:** ${tradeData.yourRoblox}\n` +
                    `**Items to deposit:** ${tradeData.yourItems}\n\n` +
                    `Once received, the bot will proceed automatically.`
                );

            await interaction.update({ embeds: [depositEmbed], components: [] });

            // Start monitoring for item receipt
            robloxTrades.monitorTrade(tradeData, interaction.client);
        }

        if (interaction.customId === `cancel_trade_${uid}`) {
            await interaction.update({
                content: '❌ Trade cancelled.',
                embeds: [],
                components: []
            });
            delete interaction.client[`trade_${uid}`];
        }
    }
};