const tradeCommand = require('../commands/trade');

module.exports = async (client, interaction) => {
    if (interaction.isModalSubmit()) {
        await tradeCommand.handleModal(interaction);
    }

    if (interaction.isButton()) {
        await tradeCommand.handleButton(interaction);
    }

    if (interaction.isStringSelectMenu()) {
        // Add select menu handling if needed
    }
};
