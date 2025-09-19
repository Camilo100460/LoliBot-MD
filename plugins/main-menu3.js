import moment from 'moment-timezone'

// Guardar última hora y color (persisten mientras el proceso esté up)
let ultimaHora = "--"
let ultimoColor = "--"

// Menús (siempre contienen Hora: y Color:)
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

// función que extrae texto "real" del objeto m (varias estructuras comunes)
const getBody = (m) => {
  return (typeof m.text === 'string' && m.text.trim().length > 0)
    ? m.text.trim()
    : (m.message?.conversation
       || m.message?.extendedTextMessage?.text
       || m.message?.imageMessage?.caption
       || m.message?.videoMessage?.caption
       || m.message?.buttonsResponseMessage?.selectedButtonId
       || m.message?.templateButtonReplyMessage?.selectedId
       || ''
      ).toString().trim()
}

// parser tolerante para ".lista ..." o "lista ..."
const parseLista = (body) => {
  if (!body) return null
  const start = body.match(/^\s*\.?\s*lista\b(.*)$/i)
  if (!start) return null
  let rest = start[1].trim()
  // quitar separadores al inicio
  rest = rest.replace(/^[\s\/\-\:\|,]+/, '')

  // intentos de split por varios separadores (prioridad /, |, , , : , espacio)
  const separators = ['/', '\\|', ',', ':']
  for (const sep of separators) {
    if (new RegExp(sep).test(rest)) {
      const parts = rest.split(new RegExp(sep)).map(p => p.trim()).filter(Boolean)
      if (parts.length >= 2) return { hora: parts[0], color: parts.slice(1).join(' / ') } // unir resto como color si hay más
    }
  }

  // si no hay separador, intentar por espacios: primera palabra = hora, resto = color
  const bySpace = rest.split(/\s+/).filter(Boolean)
  if (bySpace.length >= 2) {
    return { hora: bySpace[0], color: bySpace.slice(1).join(' ') }
  }

  // si llegó sólo 1 token, lo tomamos como hora y color queda --
  if (bySpace.length === 1) {
    return { hora: bySpace[0], color: "--" }
  }

  return null
}

const handler = async (m, { conn }) => {
  const chatId = m.key?.remoteJid
  const body = getBody(m)
  // console.log('DEBUG body:', body)

  // intentar parsear .lista
  const parsed = parseLista(body)
  if (parsed) {
    ultimaHora = parsed.hora || "--"
    ultimoColor = parsed.color || "--"
    // console.log('DEBUG parsed:', parsed)
  }

  // Si no vino .lista, no hay problema: usamos ultimaHora/ultimoColor (o -- si no hay)
  const horaParaMostrar = parsed ? parsed.hora : ultimaHora
  const colorParaMostrar = parsed ? parsed.color : ultimoColor

  // datos dinámicos (opcional)
  const fecha = moment.tz('America/Argentina/Buenos_Aires').format('DD/MM/YYYY')
  const horaNow = moment.tz('America/Argentina/Buenos_Aires').format('HH:mm:ss')
  const _uptime = process.uptime() * 1000
  const muptime = clockString(_uptime)

  const nombreBot = conn.user?.name || 'Bot'
  const tipo = conn === global.conn ? 'Bot Oficial' : 'Sub Bot'
  const botOfc = `*• Bot:* ${nombreBot} (${tipo})`

  // escoger aleatorio
  let text = menuOptions[Math.floor(Math.random() * menuOptions.length)]

  const replace = {
    '%': '%',
    fecha, hora: horaNow, muptime,
    wm: 'MAY-BOT',
    botOfc,
    horaLista: horaParaMostrar || "--",
    colorLista: colorParaMostrar || "--"
  }

  text = String(text).replace(
    new RegExp(`%(${Object.keys(replace).join('|')})`, 'g'),
    (_, key) => replace[key] ?? ''
  )

  try {
    await conn.sendMessage(chatId, { text, mentions: await conn.parseMention(text) }, { quoted: m })
    // si quieres confirmar qué se guardó, puedes descomentar:
    // await conn.sendMessage(chatId, { text: `Guardado -> Hora: ${ultimaHora}, Color: ${ultimoColor}` }, { quoted: m })
    m.react('✅')
  } catch (err) {
    console.error(err)
    m.react('❌')
  }
}

// handler.command: acepta "menu", "lista" SOLO o "lista/..." con contenido
handler.help = ['menu', 'lista']
handler.tags = ['main']
// esto cubre: "menu", "lista", ".lista/7:00/blanco", "lista/7:00/blanco", "lista 7:00 blanco"
handler.command = /^(menu|help|allmenu|menú)$|^\.?lista.*$/i

export default handler

const clockString = ms => {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
