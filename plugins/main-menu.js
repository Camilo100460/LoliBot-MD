import moment from 'moment-timezone'

const cooldowns = new Map()
const COOLDOWN_DURATION = 180000

const defaultMenu = {
  before: `

📜 *Menú de comandos:*

🎵 %pmenuaudios
🍂 %pmenufreefire
📖 %plabiblia
🤖 %pinfobot
💻 %pscript
🎮 %pmenugames
📲 %pmenuapps
🔍 %pmenubuscadores

`.trimStart(),
  after: ''
}

const handler = async (m, { conn, usedPrefix: _p }) => {
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

  const name = m.pushName || 'sin name';
  const fecha = moment.tz('America/Argentina/Buenos_Aires').format('DD/MM/YYYY');
  const hora = moment.tz('America/Argentina/Buenos_Aires').format('HH:mm:ss');
  const _uptime = process.uptime() * 1000;
  const muptime = clockString(_uptime);

  // 🔹 Datos ficticios (ajusta si usas DB)
  let user = { limite: 10, level: 1, exp: 0, role: 'Novato' };
  let totalreg = 100, rtotalreg = 50;
  const toUsers = toNum(totalreg);
  const toUserReg = toNum(rtotalreg);

  const nombreBot = conn.user?.name || 'Bot'
  const tipo = conn === global.conn ? 'Bot Oficial' : 'Sub Bot';
  let botOfc = `*• Bot:* ${nombreBot} (${tipo})`

  let text = defaultMenu.before + defaultMenu.after;

  const replace = {
    '%': '%', p: _p, name,
    limit: user.limite || 0,
    level: user.level || 0,
    role: user.role || '-',
    totalreg, rtotalreg, toUsers, toUserReg,
    exp: 0, maxexp: 0, totalexp: 0, xp4levelup: 0,
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

const toNum = n => (n >= 1_000_000) ? (n / 1_000_000).toFixed(1) + 'M'
  : (n >= 1_000) ? (n / 1_000).toFixed(1) + 'k'
  : n.toString()
