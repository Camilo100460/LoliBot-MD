const handler = async (m, { conn }) => {
  const chatId = m.key?.remoteJid

  // Captura formato: .lista/hora/color
  const regex = /^\.lista\/([^/]+)\/([^/]+)$/i
  const match = m.text.match(regex)

  if (!match) {
    await conn.sendMessage(chatId, { text: `❌ Formato incorrecto.\nUsa: *.lista/6:00/azul*` }, { quoted: m })
    return
  }

  const hora = match[1].trim()
  const color = match[2].trim()

  // Los 4 mensajes
  const mensajes = [
    `╭───┄ °❀° ┄───╮\n│   🌸 Menú 1 🌸\n╰───┄ °❀° ┄───╯\nHora: *${hora}*\nColor: *${color}*`,
    `🌸 Lista generada 🌸\n> Hora: *${hora}*\n> Color: *${color}*`,
    `✨ Registro creado ✨\nHora asignada: *${hora}*\nColor elegido: *${color}*`,
    `📝 Nueva entrada 📝\n• Hora: *${hora}*\n• Color: *${color}*`
  ]

  // Escoger aleatorio
  const mensajeFinal = mensajes[Math.floor(Math.random() * mensajes.length)]

  try {
    await conn.sendMessage(chatId, { text: mensajeFinal }, { quoted: m })
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
