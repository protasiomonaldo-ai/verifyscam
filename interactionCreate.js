const {
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  ChannelType,
} = require('discord.js');
const store = require('../store');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      await handleCommand(interaction);
    } else if (interaction.isButton()) {
      await handleButton(interaction, client);
    }
  },
};

async function handleCommand(interaction) {
  if (interaction.commandName !== 'conf') return;

  if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: '❌ Solo gli amministratori possono usare questo comando.',
      ephemeral: true,
    });
  }

  const message1 = interaction.options.getString('message1');
  const role = interaction.options.getRole('role');
  const message2 = interaction.options.getString('message2');

  store.setConfig(interaction.guild.id, {
    message1,
    roleId: role.id,
    message2: message2.toLowerCase(),
  });

  const embed = new EmbedBuilder()
    .setColor(0x57F287)
    .setTitle('✅ Verifica')
    .setDescription(message1)
    .setFooter({ text: 'Clicca il bottone qui sotto per iniziare la verifica' })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('verify_start')
      .setLabel('✅ Verifica')
      .setStyle(ButtonStyle.Success)
  );

  await interaction.channel.send({ embeds: [embed], components: [row] });
  await interaction.reply({ content: '✅ Pannello di verifica creato!', ephemeral: true });
}

async function handleButton(interaction, client) {
  if (interaction.customId !== 'verify_start') return;

  const config = store.getConfig(interaction.guild.id);
  if (!config) {
    return interaction.reply({
      content: '❌ Configurazione non trovata. Usa `/conf` prima.',
      ephemeral: true,
    });
  }

  const existingTicket = interaction.guild.channels.cache.find(
    ch => ch.name === `verify-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}` && ch.type === ChannelType.GuildText
  );

  if (existingTicket) {
    return interaction.reply({
      content: `❌ Hai già un ticket aperto: ${existingTicket}`,
      ephemeral: true,
    });
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const guild = interaction.guild;
    const member = interaction.member;

    const adminRoles = guild.roles.cache.filter(r =>
      r.permissions.has(PermissionFlagsBits.Administrator) ||
      r.permissions.has(PermissionFlagsBits.ManageChannels)
    );

    const permissionOverwrites = [
      {
        id: guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: member.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
        deny: [
          PermissionFlagsBits.ManageChannels,
          PermissionFlagsBits.ManageMessages,
        ],
      },
    ];

    adminRoles.forEach(role => {
      permissionOverwrites.push({
        id: role.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ManageChannels,
          PermissionFlagsBits.ManageMessages,
        ],
      });
    });

    if (client.user) {
      permissionOverwrites.push({
        id: client.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ManageChannels,
        ],
      });
    }

    const safeUsername = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '');
    const channel = await guild.channels.create({
      name: `verify-${safeUsername}`,
      type: ChannelType.GuildText,
      permissionOverwrites,
      topic: `Ticket di verifica per ${interaction.user.tag} | ID: ${interaction.user.id}`,
    });

    store.setTicket(channel.id, {
      userId: member.id,
      guildId: guild.id,
      createdAt: Date.now(),
    });

    const ticketEmbed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle('🎫 Ticket di Verifica Aperto')
      .setDescription(
        `Benvenuto ${member}, il tuo ticket di verifica è stato aperto.\n\n` +
        `Per completare la verifica, invia il messaggio richiesto in questo canale.\n\n` +
        `> **Nota:** Questo ticket non può essere chiuso da te. Solo gli amministratori possono chiuderlo.`
      )
      .addFields({
        name: '👤 Utente',
        value: `${member} (\`${interaction.user.tag}\`)`,
        inline: true,
      })
      .setTimestamp()
      .setFooter({ text: 'Sistema di Verifica' });

    await channel.send({ content: `${member}`, embeds: [ticketEmbed] });

    await interaction.editReply({
      content: `✅ Il tuo ticket è stato aperto: ${channel}`,
    });
  } catch (err) {
    console.error('Errore creazione ticket:', err);
    await interaction.editReply({
      content: '❌ Errore durante la creazione del ticket. Controlla i permessi del bot.',
    });
  }
}
