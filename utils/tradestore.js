const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../data/trades.json');

function load() {
    if (!fs.existsSync(file)) return new Map();
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    return new Map(Object.entries(data));
}

function save(map) {
    const obj = Object.fromEntries(map);
    fs.writeFileSync(file, JSON.stringify(obj, null, 2));
}

const tradeStore = load();

module.exports = {
    get: (id) => tradeStore.get(id),
    set: (id, value) => { tradeStore.set(id, value); save(tradeStore); },
    delete: (id) => { tradeStore.delete(id); save(tradeStore); },
    all: () => Array.from(tradeStore.values())
};