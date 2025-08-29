import yts from 'yt-search'
import fetch from 'node-fetch'

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  if (!text) return m.reply(`❗ Ingresa el nombre de la canción o video\n\nEjemplo: ${usedPrefix + command} emilia 420`)

  // Buscar en YouTube
  const result = await search(args.join(' '))

  const info = `
🎶 *Título:* ${result.title}
⌛ *Duración:* ${result.duration.timestamp}
👁️ *Vistas:* ${formatNumber(result.views)}
👤 *Autor:* ${result.author.name}
🔗 *URL:* ${result.url}
`.trim()

  await conn.sendMessage(m.chat, { image: { url: result.thumbnail }, caption: info }, { quoted: m })

  if (command === 'play') {
    try {
      // Usar API FGMods primero
      let apiUrl = `https://api-fgmods.ddns.net/api/downloader/ytmp3?url=${result.url}&apikey=fg-dylux`
      let res = await fetch(apiUrl)
      let json = await res.json()
      if (!json.result?.download) throw new Error("FGMods falló")
      
      await conn.sendMessage(m.chat, { audio: { url: json.result.download }, mimetype: "audio/mpeg", fileName: `${result.title}.mp3` }, { quoted: m })
    } catch (e) {
      console.error(e)
      // Respaldo con Neoxr
      try {
        let apiUrl = `https://api.neoxr.my.id/api/youtube?url=${result.url}&type=audio&quality=128kbps&apikey=5VC9rvNx`
        let res = await fetch(apiUrl)
        let json = await res.json()
        if (!json.data?.url) throw new Error("Neoxr falló")
        
        await conn.sendMessage(m.chat, { audio: { url: json.data.url }, mimetype: "audio/mpeg", fileName: `${result.title}.mp3` }, { quoted: m })
      } catch (err) {
        console.error(err)
        m.reply("❌ No se pudo descargar el audio.")
      }
    }
  }

  if (command === 'play2') {
    try {
      let apiUrl = `https://api-fgmods.ddns.net/api/downloader/ytmp4?url=${result.url}&apikey=fg-dylux`
      let res = await fetch(apiUrl)
      let json = await res.json()
      if (!json.result?.dl_url) throw new Error("FGMods falló")

      await conn.sendMessage(m.chat, { video: { url: json.result.dl_url }, mimetype: "video/mp4", fileName: `${result.title}.mp4` }, { quoted: m })
    } catch (e) {
      console.error(e)
      // Respaldo con Neoxr
      try {
        let apiUrl = `https://api.neoxr.my.id/api/youtube?url=${result.url}&type=video&quality=720p&apikey=5VC9rvNx`
        let res = await fetch(apiUrl)
        let json = await res.json()
        if (!json.data?.url) throw new Error("Neoxr falló")

        await conn.sendMessage(m.chat, { video: { url: json.data.url }, mimetype: "video/mp4", fileName: `${result.title}.mp4` }, { quoted: m })
      } catch (err) {
        console.error(err)
        m.reply("❌ No se pudo descargar el video.")
      }
    }
  }
}

handler.help = ['play23', 'play2']
handler.tags = ['downloader']
handler.command = ['play23', 'play2']

export default handler

async function search(query, options = {}) {
  const search = await yts.search({ query, hl: 'es', gl: 'ES', ...options })
  return search.videos[0]
}

function formatNumber(num) {
  return num.toLocaleString()
}
