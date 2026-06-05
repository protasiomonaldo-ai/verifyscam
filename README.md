# Discord Verification Bot

Bot Discord con sistema di verifica ticket personalizzabile.

## Funzionalità

- Comando `/conf` per creare pannelli di verifica personalizzati
- Bottone verde "Verifica" che apre un ticket privato
- Ticket non chiudibile dall'utente (solo admin)
- Assegnazione automatica del ruolo quando il bot rileva il messaggio di verifica
- Il canale diventa privato dopo la verifica completata

## Setup

### 1. Crea il bot su Discord

1. Vai su https://discord.com/developers/applications
2. Clicca **New Application**, dagli un nome
3. Vai su **Bot** → clicca **Add Bot**
4. Copia il **Token** (ti servirà dopo)
5. In **Privileged Gateway Intents**, abilita:
   - `SERVER MEMBERS INTENT`
   - `MESSAGE CONTENT INTENT`
6. Vai su **OAuth2 → URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Administrator`
7. Copia l'URL generato e invita il bot nel tuo server

### 2. Variabili d'ambiente

Copia `.env.example` in `.env` e compila:

```
DISCORD_TOKEN=il_tuo_token
CLIENT_ID=il_tuo_client_id   # trovato in OAuth2 → General
```

### 3. Registra i comandi slash

```bash
npm install
node src/deploy-commands.js
```

### 4. Avvia il bot

```bash
node src/index.js
```

---

## Deploy su Railway

1. Importa questo progetto su [railway.app](https://railway.app)
2. Aggiungi le variabili d'ambiente:
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
3. Railway avvierà automaticamente il bot con `node src/index.js`
4. **Prima del deploy**, esegui `node src/deploy-commands.js` una volta localmente per registrare i comandi slash

---

## Utilizzo

### Comando `/conf`

| Parametro | Descrizione |
|-----------|-------------|
| `message1` | Messaggio mostrato nel pannello di verifica |
| `role` | Ruolo da assegnare dopo la verifica |
| `message2` | Parola/frase che l'utente deve inviare nel ticket |

**Esempio:**
```
/conf message1:Leggi le regole e verifica la tua identità. role:@Verificato message2:ho letto le regole
```

### Flusso di verifica

1. Admin usa `/conf` → il bot crea il pannello con il bottone verde
2. Utente clicca "✅ Verifica" → si apre un canale `verify-nomeutente`
3. Il canale è visibile solo all'utente e agli admin
4. L'utente **non può chiudere** il canale (nessun permesso di gestione)
5. L'utente scrive `message2` nel ticket
6. Il bot rileva il messaggio → assegna il ruolo → rende il canale privato per l'utente
7. Un admin può poi eliminare il canale manualmente

---

## Permessi necessari del bot

Il bot deve avere il permesso **Administrator** oppure almeno:
- `Manage Channels`
- `Manage Roles`
- `Send Messages`
- `View Channels`
- `Read Message History`
