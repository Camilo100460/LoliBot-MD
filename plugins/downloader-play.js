import fetch from 'node-fetch';
import yts from 'yt-search';
import ytdl from 'ytdl-core';

const userCaptions = new Map();
const userRequests = {};

const handler = async (m, { conn, command, args, text, usedPrefix }) => {
  if (!text) return m.reply(`*🤔 Que está buscando? 🤔*\n*Ingrese el nombre de la canción o video*\n\n*Ejemplo:*\n${usedPrefix + command} emilia 420`);

  const tipoDescarga = command === 'play' || command === 'musica' ? 'audio' : 
                       command === 'play2' || command === 'video' ? 'video' : 
                       command === 'play3' ? 'audio (documento)' : 
                       command === 'play4' ? 'video (documento)' : '';

  if (userRequests[m.sender]) return await conn.reply(m.chat, `⏳ Hey @${m.sender.split('@')[0]} espera, ya estás descargando algo 🙄`, userCaptions.get(m.sender) || m);
  userRequests[m.sender] = true;

  try {
    // 🔎 Buscar en YouTube
    const yt_play = await search(args.join(' '));
    if (!yt_play || yt_play.length === 0) {
      delete userRequests[m.sender];
      return m.reply("❌ No encontré resultados en YouTube.");
    }

    const video = yt_play[0];

    const PlayText = await conn.sendMessage(m.chat, { 
      text: `${video.title}
*⇄ㅤ     ◁   ㅤ  ❚❚ㅤ     ▷ㅤ     ↻*

*⏰ Duración:* ${secondString(video.duration.seconds)}
*👉🏻 Aguarde un momento en lo que envío su ${tipoDescarga}*`,  
      contextInfo:{  
        externalAdReply: {  
          title: video.title,   
          body: "YouTube Downloader",
          thumbnailUrl: video.thumbnail, 
          sourceUrl: video.url
        }
      }}, { quoted: m });

    userCaptions.set(m.sender, PlayText);

    // --- AUDIO ---
    if (command === 'play' || command === 'musica') {
      const stream = ytdl(video.url, { filter: 'audioonly', quality: 'lowestaudio' });
      await conn.sendMessage(m.chat, { 
        audio: { stream }, 
        mimetype: 'audio/mpeg', 
        fileName: `${video.title}.mp3` 
      }, { quoted: m });
    }

    // --- VIDEO ---
    if (command === 'play2' || command === 'video') {
      const stream = ytdl(video.url, { filter: 'videoandaudio', quality: 'lowest' });
      await conn.sendMessage(m.chat, { 
        video: { stream }, 
        mimetype: 'video/mp4',
        fileName: `${video.title}.mp4`,
        caption: `🔰 Aquí está tu video \n🔥 Título: ${video.title}`,
        thumbnail: video.thumbnail 
      }, { quoted: m });
    }

    // --- AUDIO COMO DOCUMENTO ---
    if (command === 'play3' || command === 'playdoc') {
      const stream = ytdl(video.url, { filter: 'audioonly', quality: 'lowestaudio' });
      await conn.sendMessage(m.chat, { 
        document: { stream }, 
        mimetype: 'audio/mpeg', 
        fileName: `${video.title}.mp3` 
      }, { quoted: m });
    }

    // --- VIDEO COMO DOCUMENTO ---
    if (command === 'play4' || command === 'playdoc2') {
      const stream = ytdl(video.url, { filter: 'videoandaudio', quality: 'lowest' });
      await conn.sendMessage(m.chat, { 
        document: { stream }, 
        mimetype: 'video/mp4',
        fileName: `${video.title}.mp4`,
        caption: `🔰 Título: ${video.title}`,
        thumbnail: video.thumbnail 
      }, { quoted: m });
    }

  } catch (error) {
    console.error(error);
    m.react("❌️")
    m.reply("❌ Ocurrió un error al descargar.");
  } finally {
    delete userRequests[m.sender]; 
  }
}

handler.help = ['play', 'play2', 'play3', 'play4'];
handler.tags = ['downloader'];
handler.command = ['playplus'];
handler.register = false;
export default handler;

// 🔎 Función de búsqueda en YouTube
async function search(query, options = {}) {
  const search = await yts.search({query, hl: 'es', gl: 'ES', ...options});
  return search.videos;
}

// 🕒 Duración en texto
function secondString(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const dDisplay = d > 0 ? d + (d == 1 ? ' día, ' : ' días, ') : '';
  const hDisplay = h > 0 ? h + (h == 1 ? ' hora, ' : ' horas, ') : '';
  const mDisplay = m > 0 ? m + (m == 1 ? ' minuto, ' : ' minutos, ') : '';
  const sDisplay = s > 0 ? s + (s == 1 ? ' segundo' : ' segundos') : '';
  return dDisplay + hDisplay + mDisplay + sDisplay;
}
