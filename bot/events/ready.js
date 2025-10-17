module.exports = (client) => {
    client.once('ready', () => {
        console.log(`< Discord bot logged in as ${client.user.tag} >`);
        client.user.setActivity('MM2 Trades');
    });
};
