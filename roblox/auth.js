const noblox = require('noblox.js');
const { ROBLOSECURITY, PRIVATE_SERVER_CODE } = require('../config');

let botUserId = null;
let botUserName = null;

// Replace with your MM2 or game universe ID
const UNIVERSE_ID = 66654135;

function sanitizeCookie(s) {
    if (!s) return '';
    let out = s.trim();
    out = out.replace(/^['"]|['"]$/g, ''); // remove wrapping quotes if any
    out = out.replace(/\r|\n/g, ''); // remove newlines
    return out;
}

async function joinPrivateServer() {
    try {
        console.log('\n🟦 Attempting to join private server after login...');
        if (!PRIVATE_SERVER_CODE) {
            console.warn('⚠️ PRIVATE_SERVER_CODE not found in config/env.');
            return false;
        }

        const response = await noblox.joinPrivateServer(UNIVERSE_ID, PRIVATE_SERVER_CODE);
        console.log('✅ Successfully joined private server!');
        console.log('Response:', JSON.stringify(response, null, 2));
        return true;
    } catch (err) {
        console.error('\n⚠️ Failed to join private server');
        console.error('Message:', err.message);
        console.error('Code:', err.statusCode || err.code || 'N/A');
        console.error('Stack:', err.stack || 'No stack trace');
        console.error('Full error object:', JSON.stringify(err, null, 2));
        return false;
    }
}

module.exports = {
    login: async () => {
        console.log('================ ROBLOX LOGIN ================');

        const cookie = sanitizeCookie(ROBLOSECURITY);

        if (!cookie || !cookie.startsWith('_|WARNING:')) {
            console.error('❌ Invalid ROBLOSECURITY cookie format.');
            console.error('Make sure it starts with "_|WARNING:-DO-NOT-SHARE..."');
            throw new Error('Invalid ROBLOSECURITY format');
        }

        try {
            console.log('🔑 Attempting Roblox login...');
            const result = await noblox.setCookie(cookie);

            // Handle different return formats across versions
            botUserId =
                result?.UserID ||
                result?.userId ||
                result?.user?.id ||
                result?.user?.UserID ||
                null;

            botUserName =
                result?.UserName ||
                result?.name ||
                result?.user?.name ||
                result?.user?.UserName ||
                'Unknown';

            // Try to fetch user info directly if missing
            if (!botUserId) {
                console.log('ℹ️ Fetching current user ID from noblox...');
                const currentUser = await noblox.getCurrentUser();
                if (currentUser && currentUser.UserID) {
                    botUserId = currentUser.UserID;
                    botUserName = currentUser.UserName;
                }
            }

            if (!botUserId) {
                throw new Error('Login succeeded but userId not found.');
            }

            console.log(`✅ Logged into Roblox as ${botUserName} (ID: ${botUserId})`);
            console.log('==============================================');

            // ✅ Try joining private server immediately
            await joinPrivateServer();

            console.log('==============================================\n');
            return { botUserId, botUserName };
        } catch (err) {
            console.error('❌ Roblox login failed.');
            console.error('Reason:', err.message || err);
            console.error('Full stack:\n', err.stack || err);
            console.error('==============================================\n');
            throw err;
        }
    },

    botUserId: () => botUserId,
    botUserName: () => botUserName
};