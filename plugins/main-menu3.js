import moment from 'moment-timezone'

// Array de plantillas posibles
const menus = [
  {
    before: `
Nombre: %nombre
Edad: %edad

╰───┄ °❀° ┄───╯
`.trimStart(),
    after: ''
  },
  {
    before: `
🌸 Datos del usuario 🌸
• Nombre → %nombre
• Edad → %edad
╰───────────────╯
`.trimStart(),
    after: ''
  },
  {
    before: `
⚡ Información ⚡
👤 %nombre
🎂 %edad años
╰───☆───╯
`.trimStart(),
    after: ''
  },
  {
    before: `
✦───────────────✦
Nombre >> %nombre
Edad >> %edad
✦───────────────✦
`.trimStart(),
    after: ''
  }
]

const handler = async (m, { conn }) => {
  const chatId = m.key?.remoteJid;

  // --- extracción del texto del mensaje ---
  let input = (m.text || m.message?.conversation || m.message?.extendedTextMessage?.text || '').toString().trim();

  if (input.startsWith('.') || input.startsWith('!')) input = input.slice(1);
  if (input.startsWith('/') && input.toLowerCase().startsWith('/lista')) input = input.slice(1);

  // formato esperado: lista/nombre/edad
  const parts = input.split('/');
  const nombre = parts[1]?.trim() || '';
  const edad = parts[2]?.trim() || '';

  const fecha = moment.tz('America/Argentina/Buenos_Aires').format('DD/MM/YYYY');
  const hora = moment.tz('America/Argentina/Buenos_Aires').format('HH:mm:ss');
  const _uptime = process.uptime() * 1000;
  const muptime = clockString(_uptime);

  const nombreBot = conn.user?.name || 'Bot';
  const tipo = conn === global.conn ? 'Bot Oficial' : 'Sub Bot';
  let botOfc = `*• Bot:* ${nombreBot} (${tipo})`;

  // 🔀 escoger un menú aleatorio
  const selectedMenu = menus[Math.floor(Math.random() * menus.length)];
  let text = selectedMenu.before + selectedMenu.after;

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
    await conn.sendMessage(chatId, { text, mentions: await conn.parseMention(text) }, { quoted: m });
    if (m.react) await m.react('🙌');
  } catch (err) {
    if (m.react) await m.react('❌');
    console.error(err);
  }
}

handler.help = ['lista']
handler.tags = ['main']
// Acepta: "lista", ".lista", "lista/juan/18", ".lista/juan/18"
handler.command = /^\.?lista(?:\/.*)?$/i
export default handler

const clockString = ms => {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
