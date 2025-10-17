const noblox = require('noblox.js');
const embeds = require('../utils/embeds');
const inventoryUtils = require('./inventory');

module.exports = {
    startMonitoring: () => {
        // Global monitoring placeholder if needed
        console.log('< Roblox trade monitoring started >');
    },

    monitorTrade: async (tradeData, tradeStore, client) => {
        const tradeId = tradeData.id;
        const checkInterval = setInterval(async () => {
            try {
                // Fetch all inbound trades
                const trades = await noblox.getTrades('Inbound');

                for (const t of trades) {
                    // Check if trade is from trader1 or trader2
                    let traderSide = null;
                    if (t.user.id == tradeData.trader1.roblox) traderSide = 'trader1';
                    if (t.user.id == tradeData.trader2.roblox) traderSide = 'trader2';
                    if (!traderSide) continue;

                    // Extract received items names
                    const receivedItems = t.offers.map(o => o.name);

                    // Expected items
                    const expectedItems = tradeData[traderSide].items;

                    // Compare items
                    const itemsMatch = expectedItems.every(item => receivedItems.includes(item)) 
                        && receivedItems.length === expectedItems.length;

                    if (itemsMatch && !tradeData[traderSide].itemsReceived) {
                        // Accept trade
                        await noblox.acceptTrade(t.id);
                        tradeData[traderSide].itemsReceived = true;
                        tradeStore.set(tradeId, tradeData);
                        console.log(`< Trade ${tradeId}: Received correct items from ${traderSide} >`);
                    } else if (!itemsMatch) {
                        // Decline trade and send error embed
                        await noblox.declineTrade(t.id);

                        const channel = await client.channels.fetch(tradeData.channelId);
                        await channel.send({
                            embeds: [embeds.tradeError(`The items sent by <@${tradeData[traderSide].discordId}> do not match their submitted items.`)]
                        });
                        console.log(`< Trade ${tradeId}: Incorrect items from ${traderSide}, trade declined >`);
                    }
                }

                // Once both sides sent items, send confirmation embed
                if (tradeData.trader1.itemsReceived && tradeData.trader2.itemsReceived && tradeData.status !== 'ready_to_confirm') {
                    tradeData.status = 'ready_to_confirm';
                    tradeStore.set(tradeId, tradeData);

                    const channel = await client.channels.fetch(tradeData.channelId);
                    const row = new (require('discord.js').ActionRowBuilder)()
                        .addComponents(
                            new (require('discord.js').ButtonBuilder)()
                                .setCustomId(`confirm_${tradeId}`)
                                .setLabel('Confirm Release')
                                .setStyle(require('discord.js').ButtonStyle.Success),
                            new (require('discord.js').ButtonBuilder)()
                                .setCustomId(`cancel_${tradeId}`)
                                .setLabel('Cancel Trade')
                                .setStyle(require('discord.js').ButtonStyle.Danger)
                        );

                    const embed = new embeds.tradeCreated(tradeData);
                    embed.setTitle('< Trade Items Collected - Awaiting Confirmation >');

                    await channel.send({
                        content: `<@${tradeData.trader1.discordId}> <@${tradeData.trader2.discordId}>`,
                        embeds: [embed],
                        components: [row]
                    });

                    console.log(`< Trade ${tradeId}: Both sides collected, awaiting confirmation >`);
                }

                // Stop checking if trade is completed or cancelled
                if (tradeData.status === 'completed' || tradeData.status === 'cancelled') {
                    clearInterval(checkInterval);
                }

            } catch (err) {
                console.error('< Error monitoring trade >', err);
            }
        }, 10000); // Check every 10 seconds
    }
};
