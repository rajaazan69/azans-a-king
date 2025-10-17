const noblox = require('noblox.js');
const auth = require('./auth');

module.exports = {
    getInventory: async (userId) => {
        try {
            return await noblox.getInventoryById(userId, 'Asset');
        } catch (err) {
            console.error('< Error fetching inventory >', err);
            return [];
        }
    }
};
