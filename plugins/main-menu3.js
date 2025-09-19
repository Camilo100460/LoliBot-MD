import moment from 'moment-timezone'

const handler = async (m, { conn }) => {
  const chatId = m.key?.remoteJid
  const nombreBot = conn.user?.name || 'Bot'
  const tipo = conn === global.conn ? 'Bot Oficial' : 'Sub Bot'
  let botOfc = `*• Bot:* ${nombreBot} (${tipo})`

  // --- Detectamos formato: .lista/hora/color ---
  const regex = /^\.lista\/([^/]+)\/([^/]+)$/i
  const match = m.text.match(regex)

  if (!match) {
    await conn.sendMessage(chatId, { text: `❌ Formato incorrecto.\nUsa: *.lista/6:00 pm/Blanco*` }, { quoted: m })
    return
  }

  const hora = match[1].trim()
  const color = match[2].trim()

  // --- Lista de 4 mensajes aleatorios ---
  const mensajes = [
    `╰───┄ °❀° ┄───╯\nHora: *${hora}*\nColor: *${color}*\n${botOfc}`,
    `🌸 Lista generada 🌸\n> Hora: *${hora}*\n> Color: *${color}*\n${botOfc}`,
    `✨ Registro creado ✨\nHora asignada: *${hora}*\nColor elegido: *${color}*\n${botOfc}`,
    `📝 Nueva entrada 📝\n• Hora: *${hora}*\n• Color: *${color}*\n${botOfc}`
  ]

  // Escoger aleatoriamente
  const mensajeFinal = mensajes[Math.floor(Math.random() * mensajes.length)]

  try {
    await conn.sendMessage(chatId, { text: mensajeFinal, mentions: await conn.parseMention(mensajeFinal) }, { quoted: m })
    m.react('✅')
  } catch (err) {
    console.error(err)
    m.react('❌')
  }
}

handler.help = ['lista']
handler.tags = ['main']
handler.command = /^\.lista\/.+/i
export default handler
