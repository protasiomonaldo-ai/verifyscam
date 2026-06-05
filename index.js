require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');

const ready = require('./ready');
const interactionCreate = require('./interactionCreate');
const messageCreate = require('./messageCreate');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

client.once(ready.name, (...args) => ready.execute(...args, client));
client.on(interactionCreate.name, (...args) => interactionCreate.execute(...args, client));
client.on(messageCreate.name, (...args) => messageCreate.execute(...args, client));

client.login(process.env.DISCORD_TOKEN);
