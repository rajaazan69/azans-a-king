const client = require('./bot/client');
const robloxAuth = require('./roblox/auth');
const tradeMonitor = require('./roblox/trades');

(async () => {
    try {
        console.log('< Starting MM2 Escrow Bot >');

        // Login to Roblox
        await robloxAuth.login();

        // Start monitoring trades
        tradeMonitor.startMonitoring();

        // Login to Discord
        client.login();
    } catch (err) {
        console.error('< Failed to start bot >', err);
    }
})();
