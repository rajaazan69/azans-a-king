const noblox = require('noblox.js');
const { ROBLOSECURITY } = require('../config');

let botUserId = null;
let botUserName = null;

function sanitizeCookie(s) {
    if (!s) return '';
    let out = s.trim();
    out = out.replace(/^['"]|['"]$/g, ''); // remove wrapping quotes if any
    out = out.replace(/\r|\n/g, ''); // remove newlines
    return out;
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
            const user = await noblox.setCookie(cookie);

            // noblox 6.x returns { userId, name }
            botUserId = user?.userId || user?.UserID || null;
            botUserName = user?.name || user?.UserName || 'Unknown';

            if (!botUserId) {
                throw new Error('Login succeeded but userId not found.');
            }

            console.log(`✅ Logged into Roblox as ${botUserName} (ID: ${botUserId})`);
            console.log('==============================================\n');

            return user;
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