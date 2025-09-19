const handler = async (m, { conn }) => {
  const chatId = m.key?.remoteJid

  // Formato esperado: .lista/hora/color
  let partes = m.text.trim().split('/')
  if (partes.length < 3) {
    await conn.sendMessage(chatId, { text: `❌ Usa el formato correcto:\n.lista/6:00/azul` }, { quoted: m })
    return
  }

  const hora = partes[1].trim()
  const color = partes[2].trim()

  // Lista de 4 mensajes
  const mensajes = [
    `╭───┄ °❀° ┄───╮\n│   🌸 Menú 1 🌸\n╰───┄ °❀° ┄───╯\nHora: *${hora}*\nColor: *${color}*`,
    `🌸 Lista generada 🌸\nHora: *${hora}*\nColor: *${color}*`,
    `✨ Registro creado ✨\nHora: *${hora}*\nColor: *${color}*`,
    `📝 Nueva entrada 📝\nHora: *${hora}*\nColor: *${color}*`
  ]

  // Escoger mensaje aleatorio
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
