const tradeCommand = require('../commands/trade');

module.exports = async (client, interaction) => {
    try {
        // Handle modal submissions (user submits trade info)
        if (interaction.isModalSubmit()) {
            await tradeCommand.handleModal(interaction);
            return;
        }

        // Handle button interactions (create trade, confirm, cancel, etc.)
        if (interaction.isButton()) {
            // We check all three possible actions cleanly
            await tradeCommand.handleButton(interaction);
            await tradeCommand.handleConfirm(interaction);
            return;
        }

        // Handle select menus (if you add them later)
        if (interaction.isStringSelectMenu()) {
            // Add menu logic here if needed
            return;
        }

    } catch (err) {
        console.error('⚠️ Interaction handler error:', err);
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: '⚠️ Something went wrong.', ephemeral: true });
            } else {
                await interaction.reply({ content: '⚠️ Something went wrong.', ephemeral: true });
            }
        } catch (e) {
            console.error('Failed to send error reply:', e);
        }
    }
};