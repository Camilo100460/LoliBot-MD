import moment from 'moment-timezone'

// Array de plantillas posibles
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
  },
  {
    before: `
┌─── •✧    🐺   ✧• ───┐
                         
_*LISTA DE VS 16 VS 16*_

⏰ | *HORA:* %nombre
🥋 | *VESTIMENTA:* %edad

▫𝐄𝐒𝐂𝐔𝐀𝐃𝐑𝐀 1▫

🐺 | 
*   | 
*   | 
*   |

▫𝐄𝐒𝐂𝐔𝐀𝐃𝐑𝐀 2▫

🐺 | 
*   | 
*   | 
*   | 

▫𝐄𝐒𝐂𝐔𝐀𝐃𝐑𝐀 3▫

🐺 | 
*   | 
*   | 
*   | 

▫𝐄𝐒𝐂𝐔𝐀𝐃𝐑𝐀 4▫

🐺 | 
*   | 
*   | 
*   | 

`.trimStart(),
    after: ''
  },
  {
    before: `
┌─── •✧    🐊   ✧• ───┐
                         
_*LISTA DE VS 16 VS 16*_

⏰ | *HORA:* %nombre
🥋 | *VESTIMENTA:* %edad

▫𝐄𝐒𝐂𝐔𝐀𝐃𝐑𝐀 1▫

🐊 | 
*   | 
*   | 
*   |

▫𝐄𝐒𝐂𝐔𝐀𝐃𝐑𝐀 2▫

🐊 | 
*   | 
*   | 
*   | 

▫𝐄𝐒𝐂𝐔𝐀𝐃𝐑𝐀 3▫

🐊 | 
*   | 
*   | 
*   | 

▫𝐄𝐒𝐂𝐔𝐀𝐃𝐑𝐀 4▫

🐊 | 
*   | 
*   | 
*   | 

`.trimStart(),
    after: ''
  }
]

const handler = async (m, { conn }) => {
  const chatId = m.key?.remoteJid

  // --- extracción del texto del mensaje ---
  let input = (m.text || m.message?.conversation || m.message?.extendedTextMessage?.text || '').toString().trim()

  if (input.startsWith('.') || input.startsWith('!')) input = input.slice(1)
  if (input.startsWith('/') && input.toLowerCase().startsWith('/lista')) input = input.slice(1)

  // formato esperado: lista/nombre/edad
  const parts = input.split('/')
  const nombre = parts[1]?.trim() || ''
  const edad = parts[2]?.trim() || ''

  // 🔀 escoger un menú aleatorio
  const selectedMenu = menus[Math.floor(Math.random() * menus.length)]
  let text = selectedMenu.before + selectedMenu.after

  const replace = {
    '%': '%',
    nombre,
    edad
  }

  text = String(text).replace(new RegExp(`%(${Object.keys(replace).join('|')})`, 'g'), (_, key) => replace[key] ?? '')

  try {
    // 👇 ahora solo manda el mensaje limpio, sin links ni reacciones
    await conn.sendMessage(chatId, { text })
  } catch (err) {
    console.error(err)
  }
}

handler.help = ['lista']
handler.tags = ['main']
// Acepta: "lista", ".lista", "lista/juan/18", ".lista/juan/18"
handler.command = /^\.?lista(?:\/.*)?$/i
export default handler
