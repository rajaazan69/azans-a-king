const setupPanelCommand = require('../commands/setupPanel');

module.exports = async (client, message) => {
    if (message.author.bot) return;

    if (message.content.startsWith('$setup')) {
        await setupPanelCommand.execute(client, message);
    }
};
