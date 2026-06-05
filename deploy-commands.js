require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('conf')
    .setDescription('Crea un pannello di verifica personalizzato')
    .addStringOption(opt =>
      opt.setName('message1')
        .setDescription('Messaggio principale del pannello di verifica')
        .setRequired(true)
    )
    .addRoleOption(opt =>
      opt.setName('role')
        .setDescription('Ruolo da assegnare dopo la verifica')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('message2')
        .setDescription('Frase che il bot deve rilevare nel ticket per completare la verifica')
        .setRequired(true)
    )
    .toJSON(),
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Registrazione dei comandi slash...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('Comandi registrati con successo!');
  } catch (err) {
    console.error('Errore nella registrazione dei comandi:', err);
  }
})();
