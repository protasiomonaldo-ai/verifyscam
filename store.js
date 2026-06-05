const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'store.json');

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (_) {}
  return { configs: {}, tickets: {} };
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Errore salvataggio dati:', err);
  }
}

const store = loadData();

module.exports = {
  setConfig(guildId, config) {
    store.configs[guildId] = config;
    saveData(store);
  },
  getConfig(guildId) {
    return store.configs[guildId] || null;
  },
  setTicket(channelId, ticketData) {
    store.tickets[channelId] = ticketData;
    saveData(store);
  },
  getTicket(channelId) {
    return store.tickets[channelId] || null;
  },
  deleteTicket(channelId) {
    delete store.tickets[channelId];
    saveData(store);
  },
};
