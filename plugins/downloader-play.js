import yts from 'yt-search';

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  if (!text) return m.reply(`❗ Ingresa el nombre de la canción o video\n\nEjemplo: ${usedPrefix + command} emilia 420`);

  const result = await search(args.join(' '));
  const info = `
🎶 *Título:* ${result.title}
⏳ *Publicado:* ${result.ago}
⌛ *Duración:* ${result.duration.timestamp}
👁️ *Vistas:* ${formatNumber(result.views)}
👤 *Autor:* ${result.author.name}
🔗 *URL:* ${result.url}
`.trim();

  await conn.sendMessage(m.chat, { image: { url: result.thumbnail }, caption: info }, { quoted: m });

  if (command === 'play') {
    try {
      const audiodlp = await tools.downloader.ytmp3(result.url);
      conn.sendMessage(m.chat, { audio: { url: audiodlp.download }, mimetype: "audio/mpeg" }, { quoted: m });
    } catch (e) {
      console.error(e);
      m.reply("❌ Error al descargar el audio.");
    }
  }

  if (command === 'play2') {
    try {
      const videodlp = await tools.downloader.ytmp4(result.url);
      conn.sendMessage(m.chat, { video: { url: videodlp.download }, mimetype: "video/mp4" }, { quoted: m });
    } catch (e) {
      console.error(e);
      m.reply("❌ Error al descargar el video.");
    }
  }
};

handler.help = ['play', 'play2'];
handler.tags = ['downloader'];
handler.command = ['play23', 'play2'];

export default handler;

async function search(query, options = {}) {
  const search = await yts.search({ query, hl: 'es', gl: 'ES', ...options });
  return search.videos[0];
}

function formatNumber(num) {
  return num.toLocaleString();
}
