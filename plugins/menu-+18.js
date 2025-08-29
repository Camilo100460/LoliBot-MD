import moment from 'moment-timezone'

const cooldowns = new Map()
const COOLDOWN_DURATION = 180000

const defaultMenu = {
  before: `
╭══ • ❀ • ══╮

📜 *MENÚ DE COMANDOS*

*<[ 🔞 +18 ]>*

📦 .pack (💎)  
📦 .pack2 (💎)  
📦 .pack3 (💎)  
🍒 .tetas (💎)  
🍒 .pechos (💎)  
🎥 .videoxxx (💎)  
🎥 .vídeoxxx (💎)  
🎥 .videoxxxlesbi (💎)  
🎥 .videolesbixxx (💎)  
👩‍❤️‍👩 .pornolesbivid (💎)  
👧 .pornololi (💎)  
💜 .yuri (💎)  
💙 .yaoi (💎)  
🇰🇷 .corean (💎)  
🇨🇳 .china (💎)  
🍈 .boobs (💎)  
👩 .girls (💎)  
🔥 .porno (💎)  
👗 .trapito (💎)  
👗 .trap (💎)   

╰══ • ❀ • ══╯

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
handler.command = /^(menu18|help18|allmenu18|menú18)$/i
export default handler

const clockString = ms => {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
