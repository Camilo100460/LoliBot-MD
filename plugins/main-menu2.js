import moment from 'moment-timezone'

const cooldowns = new Map()
const COOLDOWN_DURATION = 180000

const defaultMenu = {
  before: `
╭───┄ °❀° ┄───╮

📜 *MENÚ DE COMANDOS*

*<[ 🪄 RANDOM ]>*

👧 .waifu  
🐱 .neko  
🐈 .gatito  
🐾 .nyan  
👧 .shinobu  
👧 .megumin  
👧 .meg  
👊 .bully  
🤗 .cuddle  
😭 .cry  
🔨 .bonk  
😉 .wink  
🤝 .handhold  
🍴 .nom  
🤗 .glomp  
😃 .happy  
👉 .poke  
💃 .dance  
😂 .meme  
😂 .memes  
😂 .meme2  
👧 .loli  
😍 .kawaii  
🎄 .navidad  
⚽ .messi  
⚽ .ronaldo  

*<[ 🛠 RPG ]>*

💰 .balance  
🏦 .dep  
🏦 .depositar  
🏦 .retirar  
📉 .toremove  
🎁 .cofre  
🎁 .coffer  
🎁 .abrircofre  
💣 .crime  
📆 .daily  
🎁 .claim  
🏆 .top  
📈 .nivel  
⬆️ .levelup  
⛏️ .minar  
💔 .divorce <@tag>  
💍 .marry @tag  
🦹 .rob  
🦹 .robar  
🛒 .buy [cantidad]  
🛒 .buyall  
🛒 .buy all  
🏅 .topstreak [página]  
💸 .transfer [tipo] [cantidad] [@tag]  
💼 .work  
💼 .trabajar  
⚡ .w  

*<[ 🔍 BUSCADORES ]>*

🔎 .google <texto> (💎)  
🔎 .googlef <texto> (💎)  
🎶 .lirik <canción>  
🎶 .letra <canción>  
📌 .pinterest <keyword> (💎)  
🤖 .chagpt  
🤖 .ia  
🤖 .openai  
🤖 .gemini  
🤖 .copilot  
🤖 .blackbox  
🤖 .deepseek  
🎨 .dalle (💎)  

*<[ 👾 JUEGOS ]>*

❓ .acertijo  
🎬 .pelicula  
🧠 .trivia  
❤️ .love  
🌈 .gay2  
🌈 .lesbiana  
🙈 .pajero  
🙈 .pajera  
🤡 .puto  
🤡 .puta  
🎮 .manco  
🎮 .manca  
🐀 .rata  
💋 .prostituta  
💋 .prostituto  
👤 .amigorandom  
🤝 .amistad  
🎁 .regalar  
💞 .formarpareja  
🌈 .gay  
🔮 .personalidad  
❓ .pregunta  
💘 .ship  
🏳️‍🌈 .topgays  
🏆 .top  
🤡 .topputos  
😍 .toplindos  
🔥 .toppajer@s  
🤣 .topshipost  
🧉 .toppanafresco  
🍔 .topgrasa  
👥 .topintegrantes  
⭐ .topfamos@s  
🥩 .topsostero  
💑 .top5parejas  
🕵️ .Doxxeo  
🕵️ .doxxeo  
🔞 .follar  
💌 .piropo  
😂 .chiste  
🎯 .reto  
✔️ .verdad  
📖 .frases  
🎲 .cf <cantidad>  
🧮 .math [dificultad]  
✂️ .ppt piedra|papel|tijera  
✂️ .ppt @usuario  
🎨 .rt <color> <cantidad>  
🎰 .slot <xp|money|limite> <cantidad>  
⭕ .ttt  
⭕ .ttt nombre  
❌ .delttt  
📃 .tttlist  
📜 .txt (💎)  
😈 .brat (💎)  
🎲 .dados  

╰───┄ °❀° ┄───╯
`.trimStart(),
  after: ''
}

const handler = async (m, { conn }) => {
  const chatId = m.key?.remoteJid;
  const now = Date.now();
  const chatData = cooldowns.get(chatId) || { lastUsed: 0, menuMessage: null };
  const timeLeft = COOLDOWN_DURATION - (now - chatData.lastUsed);

  if (timeLeft > 0) {
    try {
      const senderTag = m.sender ? `@${m.sender.split('@')[0]}` : '@usuario';
      await conn.reply(chatId, `⚠️ Hey ${senderTag}, ahí está el menú 🙄\n> Solo se enviará cada 3 minutos para evitar spam. 👆`, chatData.menuMessage || m);
    } catch (err) {
      return;
    }
    return;
  }

  const fecha = moment.tz('America/Argentina/Buenos_Aires').format('DD/MM/YYYY');
  const hora = moment.tz('America/Argentina/Buenos_Aires').format('HH:mm:ss');
  const _uptime = process.uptime() * 1000;
  const muptime = clockString(_uptime);

  const nombreBot = conn.user?.name || 'Bot'
  const tipo = conn === global.conn ? 'Bot Oficial' : 'Sub Bot';
  let botOfc = `*• Bot:* ${nombreBot} (${tipo})`

  let text = defaultMenu.before + defaultMenu.after;

  const replace = {
    '%': '%',
    fecha, hora, muptime,
    wm: 'MAY-BOT',
    botOfc
  };

  text = String(text).replace(new RegExp(`%(${Object.keys(replace).join('|')})`, 'g'), (_, key) => replace[key] ?? '');

  try {
    const menuMessage = await conn.sendMessage(chatId, { text, mentions: await conn.parseMention(text) }, { quoted: m });
    cooldowns.set(chatId, { lastUsed: now, menuMessage: menuMessage })
    m.react('🙌');
  } catch (err) {
    m.react('❌')
    console.error(err);
  }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = /^(menu|help|allmenu|menú)$/i
export default handler

const clockString = ms => {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
