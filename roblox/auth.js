const noblox = require('noblox.js');
const { ROBLOSECURITY } = require('../config');

let botUserId;

function showInfo(label, s) {
    if (typeof s !== 'string') s = String(s || '');
    console.log(`\n--- ${label} ---`);
    console.log('raw (escaped):', JSON.stringify(s));
    console.log('length:', s.length);
    console.log('first 10 chars:', s.slice(0, 10));
    console.log('last 10 chars:', s.slice(-10));
    console.log('contains newline:', /\r|\n/.test(s));
    console.log('contains fancy quotes (“ ”):', /[“”]/.test(s));
}

function sanitizeCookie(s) {
    if (!s) return s;
    let out = s.trim();
    out = out.replace(/^['"]|['"]$/g, ''); // remove wrapping quotes
    try { out = decodeURIComponent(out); } catch {} // decode if env encoded
    return out;
}

module.exports = {
    login: async () => {
        try {
            console.log('================ ROBLOX LOGIN DEBUG ================');
            showInfo('ENV ROBLOSECURITY (raw)', ROBLOSECURITY);

            const cookie = sanitizeCookie(ROBLOSECURITY);
            showInfo('After sanitization', cookie);

            console.log('\nAttempting noblox.setCookie()...');
            const currentUser = await noblox.setCookie(cookie);

            botUserId = currentUser.UserID;
            console.log(`✅ Logged into Roblox as ${currentUser.UserName} (ID: ${botUserId})`);
            console.log('====================================================\n');
            return currentUser;
        } catch (err) {
            console.error('\n❌ Roblox login failed.');
            console.error('Full error stack:\n', err.stack || err);
            console.error('====================================================\n');
            throw err;
        }
    },
    botUserId: () => botUserId
};