const noblox = require('noblox.js');
const embeds = require('../utils/embeds');

module.exports = {
    startMonitoring: () => {
        setInterval(async () => {
            // You can add global inbound monitoring here
        }, 10000);
    },

    monitorTrade: async (tradeData, tradeStore, client) => {
        const checkInterval = setInterval(async () => {
            // Fetch inbound trades for bot account
            const trades = await noblox.getTrades('Inbound');
            for (const t of trades) {
                // Verify items match for trader1 or trader2
                // Accept if correct, decline and send error embed if wrong
                // Update tradeData.itemsReceived accordingly

                // Once both sides received, send confirmation embed
            }
        }, 10000);
    }
};
