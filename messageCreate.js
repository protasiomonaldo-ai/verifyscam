const { Events, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const store = require('../store');

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const ticket = store.getTicket(message.channel.id);
    if (!ticket) return;

    if (message.author.id !== ticket.userId) return;

    const config = store.getConfig(message.guild.id);
    if (!config) return;

    if (!message.content.toLowerCase().includes(config.message2)) return;

    try {
      const guild = message.guild;
      const member = await guild.members.fetch(ticket.userId);
      const role = guild.roles.cache.get(config.roleId);

      if (role) {
        await member.roles.add(role);
      }

      await message.channel.permissionOverwrites.edit(member.id, {
        ViewChannel: false,
        SendMessages: false,
        ReadMessageHistory: false,
      });

      store.deleteTicket(message.channel.id);

      const successEmbed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle('✅ Verifica Completata!')
        .setDescription(
          `${member} ha completato la verifica con successo!\n\n` +
          `${role ? `🎭 Ruolo assegnato: **${role.name}**` : '⚠️ Ruolo non trovato.'}\n\n` +
          `Il canale è ora privato. Un amministratore può chiuderlo.`
        )
        .setTimestamp()
        .setFooter({ text: 'Sistema di Verifica' });

      await message.channel.send({ embeds: [successEmbed] });

    } catch (err) {
      console.error('Errore durante la verifica:', err);

      const errorEmbed = new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle('❌ Errore')
        .setDescription('Si è verificato un errore durante la verifica. Contatta un amministratore.')
        .setTimestamp();

      await message.channel.send({ embeds: [errorEmbed] });
    }
  },
};
