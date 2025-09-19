// Plantillas posibles
const menus = [
  {
    before: `
┌─── •✧    🦅   ✧• ───┐
                         
_*LISTA DE VS 16 VS 16*_

⏰ | *HORA:* %nombre
🥋 | *VESTIMENTA:* %edad

▫𝐄𝐒𝐂𝐔𝐀𝐃𝐑𝐀 1▫

🦅 | 
*   | 
*   | 
*   |

▫𝐄𝐒𝐂𝐔𝐀𝐃𝐑𝐀 2▫

🦅 | 
*   | 
*   | 
*   | 

▫𝐄𝐒𝐂𝐔𝐀𝐃𝐑𝐀 3▫

🦅 | 
*   | 
*   | 
*   | 

▫𝐄𝐒𝐂𝐔𝐀𝐃𝐑𝐀 4▫

🦅 | 
*   | 
*   | 
*   | 

`.trimStart(),
    after: ''
  },
  {
    before: `
┌─── •✧    🐉   ✧• ───┐
                         
_*LISTA DE VS 16 VS 16*_

⏰ | *HORA:* %nombre
🥋 | *VESTIMENTA:* %edad

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

`.trimStart(),
    after: ''
  }
]

const handler = async (m, { conn }) => {
  const chatId = m.key?.remoteJid

  // extracción del texto
  let input = (m.text || '').toString().trim()

  if (input.startsWith('.') || input.startsWith('!')) input = input.slice(1)
  if (input.startsWith('/') && input.toLowerCase().startsWith('/lista')) input = input.slice(1)

  // formato esperado: lista/hora/vestimenta
  const parts = input.split('/')
  const nombre = parts[1]?.trim() || ''
  const edad = parts[2]?.trim() || ''

  // escoger un menú aleatorio
  const selectedMenu = menus[Math.floor(Math.random() * menus.length)]
  let text = selectedMenu.before + selectedMenu.after

  // reemplazo
  text = text.replace(/%nombre/g, nombre).replace(/%edad/g, edad)

  try {
    // ⚡ limpio: solo envía texto, sin links, sin menciones
    await conn.sendMessage(chatId, { text })
  } catch (err) {
    console.error(err)
  }
}

handler.help = ['lista']
handler.tags = ['main']
handler.command = /^\.?lista(?:\/.*)?$/i

export default handler
