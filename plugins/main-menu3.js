import moment from 'moment-timezone'

// Guardar última hora y color globalmente
let ultimaHora = "--"
let ultimoColor = "--"

// Lista de menús posibles (todos incluyen hora y color)
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

  // Si el mensaje empieza con .lista → actualizar valores
  if (m.text && m.text.startsWith(".lista/")) {
    const parts = m.text.split("/")
    if (parts.length >= 3) {
      ultimaHora = parts[1]?.trim() || "--"
      ultimoColor = parts[2]?.trim() || "--"
    }
  }

  // Datos dinámicos
  const fecha = moment.tz('America/Argentina/Buenos_Aires').format('DD/MM/YYYY');
  const hora = moment.tz('America/Argentina/Buenos_Aires').format('HH:mm:ss');
  const _uptime = process.uptime() * 1000;
  const muptime = clockString(_uptime);

  const nombreBot = conn.user?.name || 'Bot'
  const tipo = conn === global.conn ? 'Bot Oficial' : 'Sub Bot';
  let botOfc = `*• Bot:* ${nombreBot} (${tipo})`

  // Escoger un menú aleatorio de la lista
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
    m.react('❌')
    console.error(err);
  }
}

handler.help = ['menu', 'lista']
handler.tags = ['main']
// Regex ajustada: acepta "menu", "help", "allmenu", "menú", "lista" y cualquier cosa que empiece con ".lista"
handler.command = /^(menu|help|allmenu|menú|lista|\.lista.*)$/i
export default handler

const clockString = ms => {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}

