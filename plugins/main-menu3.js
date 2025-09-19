import moment from 'moment-timezone'

// Lista de menús posibles
const menuOptions = [
  `
╭───┄ °❀° ┄───╮
│   🌸 Menú 1 🌸
╰───┄ °❀° ┄───╯
  `,
  `
╭─⊰ ❀ ⊱─╮
│   💎 Menú 2 💎
╰─⊰ ❀ ⊱─╯
  `,
  `
╔══ ❀•°❀°•❀ ══╗
   🌙 Menú 3 🌙
╚══ ❀•°❀°•❀ ══╝
  `,
  `
✦••┈┈┈┈┈┈┈••✦
     🔥 Menú 4 🔥
✦••┈┈┈┈┈┈┈••✦
  `
]

const handler = async (m, { conn }) => {
  const chatId = m.key?.remoteJid;

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
    botOfc
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

handler.help = ['menu']
handler.tags = ['main']
handler.command = /^(lista1|lista2)$/i
export default handler

const clockString = ms => {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
