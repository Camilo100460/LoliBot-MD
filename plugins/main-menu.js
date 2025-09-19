import moment from 'moment-timezone'

const cooldowns = new Map()
const COOLDOWN_DURATION = 180000

const defaultMenu = {
  before: `
╭───┄ °❀° ┄───╮

📜 *MENÚ DE COMANDOS*

*<[ 🕹 ENABLE/DISABLE ]>*

✅ .enable <opción>  
❌ .disable <opción> 

*<[ 🚀 DESCARGAS ]>*

🗂️ .drive <url> (💎)  
📹 .fb  
📹 .facebook  
📹 .fbdl  
🌐 .gitclone <url> (💎)  
🔍 .igstalk (💎)  
📦 .mediafire (💎)  
📦 .mediafiredl (💎)  
📱 .apk (💎)  
📱 .apkmod (💎)  
🎶 .play  
🎶 .play2  
🎶 .play3  
🎶 .play4  
📄 .playdoc  
🎬 .ytmp4  
🎧 .ytmp3  
🎵 .playlist  
🔎 .yts  
🎼 .spotify (💎)  
🧵 .thread (💎)  
🎵 .tiktok (💎)  
🔍 .tiktoksearch <texto> (💎)  
👤 .tiktokstalk (💎)  
🍏 .applemusic (💎)  
🎭 .stikertele <url> (💎)  

*<[ ⚙ GRUPO ]>*

🔓 .group open/close  
🔓 .grupo abrir/cerrar  
✅ .grupo aprobar +number  
🗑️ .delete @user  
⚠️ .delwarn @user  
♻️ .unwarn @user  
⬇️ .demote 593xxx  
⬇️ .demote @usuario  
⬇️ .demote responder chat  
👻 .fantasmas  
👻 .kickfantasmas  
ℹ️ .infogp  
🙈 .hidetag  
🚪 .kick @user  
🚪 .kicknum  
📞 .listnum  
🔗 .linkgroup  
⚠️ .listwarn  
📌 .pin  
⬆️ .promote 593xxx  
⬆️ .promote @usuario  
⬆️ .promote responder chat  
🔄 .resetlink  
👋 .setwelcome <texto>  
👋 .setbye <texto>  
📄 .setdesc  
✍️ .setname  
🖼️ .setppgc  
🤖 .setprompt  
🔄 .resetai  
⏰ .timeIA  
👑 .staff  
📢 .tagall <mensaje>  
📢 .invocar <mensaje>  
📊 .contador  
⚠️ .warn @user [razón]   

*<[ 🧧 STICKER ]>*

🔤 .attp  
😈 .brat  
🎥 .bratvid  
😃 .emojimix emot1|emot2> (💎)  
🏷️ .exif <packname> | <author>  
🤗 .hug  
🔪 .kill  
💋 .kiss  
📄 .stickerly <texto>  
🤲 .pat  
💬 .qc  
👋 .slap  
🖼️ .sticker  
🎭 .stikertele <url> (💎)  
👅 .lick  
🦷 .bite  
😊 .blush  
🤗 .cuddle  
🤝 .handhold  
✋ .highfive  
👉 .poke  
😁 .smile  
👋 .wave  
🍴 .nom  
💃 .dance  
😉 .wink  
😃 .happy  
😏 .smug  
👄 .blowjob  
👄 .oral  

*<[ 🎈 CONVERTIDORES ]>*

🖼️ .toimg (reply)  
🎵 .tomp3  
🌐 .tourl <opcional servicio>  
🔊 .tts <voz|idioma> <texto>  

*<[ 🔧 HERRAMIENTA ]>*

🆔 .mylid  
🔐 .tobase64 (💎)  
🖼️ .hd (💎)  
✨ .remini (💎)  
🔧 .enhance (💎)  
📸 .ss <url> (💎)  
📸 .ssweb <url> (💎)  
🕵️ .superinspect  
🔍 .inspect  
🌐 .traducir  
🌐 .translate  
🎶 .quemusica  

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
