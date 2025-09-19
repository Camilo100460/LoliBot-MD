import moment from 'moment-timezone'

const cooldowns = new Map()
const COOLDOWN_DURATION = 180000

const defaultMenu = {
  before: `
Nombre: %nombre
Edad: %edad

╰───┄ °❀° ┄───╯
`.trimStart(),
  after: ''
}

const handler = async (m, { conn }) => {
  const chatId = m.key?.remoteJid;
  const now = Date.now();
  const chatData = cooldowns.get(chatId) || { lastUsed: 0, menuMessage: null };
  const timeLeft = COOLDOWN_DURATION - (now - chatData.lastUsed);

  // --- extracción robusta del texto del mensaje ---
  let input = (m.text || m.message?.conversation || m.message?.extendedTextMessage?.text || '').toString().trim();

  // quitar un prefijo común si lo puso el usuario (., ! o / al inicio)
  if (input.startsWith('.') || input.startsWith('!')) input = input.slice(1);
  // si el usuario escribió "/lista/..." quitamos solo la primera barra para no romper el split
  if (input.startsWith('/') && input.toLowerCase().startsWith('/lista')) input = input.slice(1);

  // formato esperado: lista/nombre/edad  -> parts[0]=='lista' parts[1]=='nombre' parts[2]=='edad'
  const parts = input.split('/');
  const nombre = parts[1]?.trim() || 'No especificado';
  const edad = parts[2]?.trim() || 'No especificada';

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
    botOfc,
    nombre,
    edad
  };

  text = String(text).replace(new RegExp(`%(${Object.keys(replace).join('|')})`, 'g'), (_, key) => replace[key] ?? '');

  try {
    const menuMessage = await conn.sendMessage(chatId, { text, mentions: await conn.parseMention(text) }, { quoted: m });
    cooldowns.set(chatId, { lastUsed: now, menuMessage })
    if (m.react) await m.react('🙌');
  } catch (err) {
    if (m.react) await m.react('❌')
    console.error(err);
  }
}

handler.help = ['lista']
handler.tags = ['main']
// Regex que acepta: "lista", ".lista", "lista/juan/18" o ".lista/juan/18"
handler.command = /^\.?lista(?:\/.*)?$/i
export default handler

const clockString = ms => {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
