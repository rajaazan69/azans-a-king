const noblox = require('noblox.js');
const { ROBLOSECURITY } = require('../config');

let botUserId;

module.exports = {
    login: async () => {
        try {
            const currentUser = await noblox.setCookie(ROBLOSECURITY);
            botUserId = currentUser.UserID;
            console.log(`< Logged into Roblox as ${currentUser.UserName} >`);
            return currentUser;
        } catch (err) {
            console.error('< Roblox login failed >', err);
            throw err;
        }
    },
    botUserId: () => botUserId
};
