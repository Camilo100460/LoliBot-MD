import moment from 'moment-timezone'

// Guardar última hora y color (global)
let ultimaHora = "--"
let ultimoColor = "--"

// Menús con placeholders %horaLista y %colorLista
const menuOptions = [
  `
╭───┄ °❀° ┄───╮
│   🌸 Menú 1 🌸
╰───┄ °❀° ┄───╯
Hora: %horaLista
Color: %colorLista
  `,
  `
╭─⊰ ❀ ⊱─╮
│   💎 Menú 2 💎
╰─⊰ ❀ ⊱─╯
Hora: %horaLista
Color: %colorLista
  `,
  `
╔══ ❀•°❀°•❀ ══╗
   🌙 Menú 3 🌙
╚══ ❀•°❀°•❀ ══╝
Hora: %horaLista
Color: %colorLista
  `,
  `
✦••┈┈┈┈┈┈┈••✦
     🔥 Menú 4 🔥
✦••┈┈┈┈┈┈┈••✦
Hora: %horaLista
Color: %colorLista
  `
]

const handler = async (m, { conn }) => {
  const chatId = m.key?.remoteJid;

  // Obtener texto real del mensaje (soporta varias estructuras)
  const body = (typeof m.text === 'string' && m.text.trim().length > 0)
    ? m.text
    : (m.message?.conversation
       || m.message?.extendedTextMessage?.text
       || m.message?.imageMessage?.caption
       || m.message?.videoMessage?.caption
       || ''
      );

  // Intentar extraer .lista/hora/color
  // Acepta: ".lista/6:00 pm/Blanco" o "lista/6:00 pm/Blanco" (con o sin punto)
  const listaMatch = body.match(/^\s*\.?lista\/\s*([^\/]+?)\/\s*(.+?)\s*$/i);

  if (listaMatch) {
    // grupos: 1 => hora, 2 => color
    ultimaHora = listaMatch[1].trim() || "--";
    ultimoColor = listaMatch[2].trim() || "--";
    // (seguimos para enviar el menú inmediatamente)
  }

  // Datos dinámicos (si los usas en los menús)
  const fecha = moment.tz('America/Argentina/Buenos_Aires').format('DD/MM/YYYY');
  const hora = moment.tz('America/Argentina/Buenos_Aires').format('HH:mm:ss');
  const _uptime = process.uptime() * 1000;
  const muptime = clockString(_uptime);

  const nombreBot = conn.user?.name || 'Bot';
  const tipo = conn === global.conn ? 'Bot Oficial' : 'Sub Bot';
  const botOfc = `*• Bot:* ${nombreBot} (${tipo})`

  // Escoger menu aleatorio
  let text = menuOptions[Math.floor(Math.random() * menuOptions.length)];

  const replace = {
    '%': '%',
    fecha, hora, muptime,
    wm: 'MAY-BOT',
    botOfc,
    horaLista: ultimaHora,
    colorLista: ultimoColor
  };

  text = String(text).replace(
    new RegExp(`%(${Object.keys(replace).join('|')})`, 'g'),
    (_, key) => replace[key] ?? ''
  );

  try {
    await conn.sendMessage(chatId, { text, mentions: await conn.parseMention(text) }, { quoted: m });
    m.react('🙌');
  } catch (err) {
    m.react('❌');
    console.error(err);
  }
}

// Asegúrate de que el handler capture tanto "menu" como "lista/..." (con o sin punto)
handler.help = ['menu', 'lista']
handler.tags = ['main']
// Esta regex acepta: menu, help, allmenu, menú, lista (solo), .lista/... o lista/...
handler.command = /^(menu|help|allmenu|menú|lista|\.?lista\/.*)$/i

export default handler

const clockString = ms => {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
