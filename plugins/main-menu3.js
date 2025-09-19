const handler = async (m, { conn }) => {
  const chatId = m.key?.remoteJid

  // Extraer texto del mensaje
  let input = (m.text || '').trim()

  if (input.startsWith('.') || input.startsWith('!')) input = input.slice(1)
  if (input.startsWith('/') && input.toLowerCase().startsWith('/lista')) input = input.slice(1)

  // Formato esperado: lista/hora/vestimenta
  const parts = input.split('/')
  const hora = parts[1]?.trim() || ''
  const vestimenta = parts[2]?.trim() || ''

  // Texto base
  const text = `
┌─── •✧    🐉   ✧• ───┐
                         
_*LISTA DE VS 16 VS 16*_

⏰ | *HORA:* ${hora}
🥋 | *VESTIMENTA:* ${vestimenta}

▫𝐄𝐒𝐂𝐔𝐀𝐃𝐑𝐀 1▫

🐲 | 
*   | 
*   | 
*   |

▫𝐄𝐒𝐂𝐔𝐀𝐃𝐑𝐀 2▫

🐲 | 
*   | 
*   | 
*   | 

▫𝐄𝐒𝐂𝐔𝐀𝐃𝐑𝐀 3▫

🐲 | 
*   | 
*   | 
*   | 

▫𝐄𝐒𝐂𝐔𝐀𝐃𝐑𝐀 4▫

🐲 | 
*   | 
*   | 
*   | 
`.trim()

  try {
    // Solo envía el texto plano
    await conn.sendMessage(chatId, { text })
  } catch (err) {
    console.error(err)
  }
}

handler.help = ['lista']
handler.tags = ['main']
handler.command = /^\.?lista(?:\/.*)?$/i

export default handler
