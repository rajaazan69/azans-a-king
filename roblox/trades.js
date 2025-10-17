const noblox = require('noblox.js');
const embeds = require('../utils/embeds');
const inventoryUtils = require('./inventory');

async function ensureInPrivateServer() {
    try {
        const universeId = 142823291; // Example: MM2 universe ID – replace with yours
        console.log('🟦 Attempting to join private server for monitoring...');
        const join = await noblox.getGamePasses(universeId);
        console.log('✅ Successfully accessed universe data (cookie valid)');
        return true;
    } catch (err) {
        console.error('⚠️ Failed to verify access to private server / universe');
        console.error('Message:', err.message);
        console.error('Code:', err.statusCode || err.code);
        console.error('Stack:', err.stack);
        return false;
    }
}

module.exports = {
    startMonitoring: () => {
        console.log('< Roblox trade monitoring started >');
    },

    monitorTrade: async (tradeData, tradeStore, client) => {
        const tradeId = tradeData.id;

        console.log(`\n========== TRADE MONITOR STARTED [${tradeId}] ==========`);
        console.log('Trader 1 Roblox:', tradeData.trader1.roblox);
        console.log('Trader 2 Roblox:', tradeData.trader2.roblox);
        console.log('=========================================================\n');

        // Check if Roblox cookie actually works here
        console.log('🔍 Cookie length:', process.env.ROBLOSECURITY?.length);
        console.log('🔍 Cookie starts with:', process.env.ROBLOSECURITY?.slice(0, 10));
        console.log('🔍 Cookie ends with:', process.env.ROBLOSECURITY?.slice(-10));

        await ensureInPrivateServer();

        const checkInterval = setInterval(async () => {
            try {
                console.log('🕓 Checking for inbound trades...');
                const trades = await noblox.getTrades('Inbound');

                if (!Array.isArray(trades) || trades.length === 0) {
                    console.log('📭 No inbound trades found');
                    return;
                }

                for (const t of trades) {
                    console.log(`🔹 Checking trade ID ${t.id} from user ${t.user?.id}`);
                    let traderSide = null;
                    if (t.user?.id == tradeData.trader1.roblox) traderSide = 'trader1';
                    if (t.user?.id == tradeData.trader2.roblox) traderSide = 'trader2';
                    if (!traderSide) continue;

                    const receivedItems = t.offers?.map(o => o.name) || [];
                    const expectedItems = tradeData[traderSide].items;

                    const itemsMatch = expectedItems.every(item => receivedItems.includes(item))
                        && receivedItems.length === expectedItems.length;

                    if (itemsMatch && !tradeData[traderSide].itemsReceived) {
                        console.log(`✅ Trade ${tradeId}: Correct items from ${traderSide}, accepting trade...`);
                        await noblox.acceptTrade(t.id);
                        tradeData[traderSide].itemsReceived = true;
                        tradeStore.set(tradeId, tradeData);
                    } else if (!itemsMatch) {
                        console.log(`❌ Trade ${tradeId}: Incorrect items from ${traderSide}, declining trade...`);
                        await noblox.declineTrade(t.id);

                        const channel = await client.channels.fetch(tradeData.channelId);
                        await channel.send({
                            embeds: [embeds.tradeError(`The items sent by <@${tradeData[traderSide].discordId}> do not match their submitted items.`)]
                        });
                    }
                }

                if (tradeData.trader1.itemsReceived && tradeData.trader2.itemsReceived && tradeData.status !== 'ready_to_confirm') {
                    tradeData.status = 'ready_to_confirm';
                    tradeStore.set(tradeId, tradeData);

                    const channel = await client.channels.fetch(tradeData.channelId);
                    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId(`confirm_${tradeId}`).setLabel('Confirm Release').setStyle(ButtonStyle.Success),
                        new ButtonBuilder().setCustomId(`cancel_${tradeId}`).setLabel('Cancel Trade').setStyle(ButtonStyle.Danger)
                    );

                    const embed = embeds.tradeCreated(tradeData);
                    embed.setTitle('< Trade Items Collected - Awaiting Confirmation >');

                    await channel.send({
                        content: `<@${tradeData.trader1.discordId}> <@${tradeData.trader2.discordId}>`,
                        embeds: [embed],
                        components: [row]
                    });

                    console.log(`< Trade ${tradeId}: Both sides collected, awaiting confirmation >`);
                }

                if (tradeData.status === 'completed' || tradeData.status === 'cancelled') {
                    clearInterval(checkInterval);
                    console.log(`< Trade ${tradeId}: Monitoring stopped (status: ${tradeData.status}) >`);
                }

            } catch (err) {
                console.error('\n========== ROBLOX TRADE ERROR DEBUG ==========');
                console.error('❌ Error monitoring trade!');
                console.error('Message:', err.message);
                console.error('Code:', err.statusCode || err.code || 'N/A');
                console.error('Stack:', err.stack || 'No stack available');
                console.error('Full error object:', JSON.stringify(err, null, 2));
                console.error('=============================================\n');
            }
        }, 10000);
    }
};