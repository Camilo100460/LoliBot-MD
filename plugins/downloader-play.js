// YouTube Downloader – Calidad Baja (comando: playplus)
import fetch from 'node-fetch';
import yts from 'yt-search';
import { savetube } from '../lib/yt-savetube.js'
import { ogmp3 } from '../lib/youtubedl.js'; 

const userCaptions = new Map();
const userRequests = {};

const handler = async (m, { conn, command, args, text, usedPrefix }) => {
  if (!text) return m.reply(`*🤔 ¿Qué está buscando? 🤔*\nIngrese el nombre de la canción\n\nEjemplo:\n${usedPrefix + command} emilia 420`);

  const tipoDescarga =
    command === 'playplus' ? 'audio' :
    command === 'playplus2' ? 'video' :
    command === 'playplus3' ? 'audio (documento)' :
    command === 'playplus4' ? 'video (documento)' : '';

  if (userRequests[m.sender]) return conn.reply(m.chat, `⏳ Hey @${m.sender.split('@')[0]} espera, ya estás descargando algo 🙄`, userCaptions.get(m.sender) || m);
  userRequests[m.sender] = true;

  try {
    const yt_play = await search(args.join(' '));
    const video = yt_play[0];

    const PlayText = await conn.sendMessage(m.chat, {
      text: `${video.title}
*⇄ㅤ     ◁   ㅤ  ❚❚ㅤ     ▷ㅤ     ↻*

*⏰ Duración:* ${secondString(video.duration.seconds)}
*👉🏻 Aguarde un momento en lo que envío su ${tipoDescarga}*`,
      contextInfo: {
        externalAdReply: {
          title: video.title,
          body: "YouTube Downloader",
          thumbnailUrl: video.thumbnail,
          sourceUrl: video.url
        }
      }
    }, { quoted: m });

    userCaptions.set(m.sender, PlayText);

    // Calidad más baja por defecto
    const selectedQuality = (command === 'playplus' || command === 'playplus3') ? '64' : '240';
    const format = command === 'playplus' || command === 'playplus3' ? 'mp3' : '240';

    const audioApis = [
      { url: () => fetch(`https://api.neoxr.eu/api/youtube?url=${video.url}&type=audio&quality=64kbps&apikey=GataDios`).then(res => res.json()), extract: d => ({ data: d.data.url, isDirect: false }) },
      { url: () => fetch(`https://api.dorratz.com/v3/ytdl?url=${video.url}`).then(res => res.json()), extract: d => { const mp3 = d.medias.find(m => m.extension === "mp3"); return { data: mp3?.url, isDirect: false } } },
      { url: () => ogmp3.download(video.url, selectedQuality, 'audio'), extract: d => ({ data: d.result.download, isDirect: false }) },
      { url: () => savetube.download(video.url, format), extract: d => ({ data: d.result.download, isDirect: false }) }
    ];

    const videoApis = [
      { url: () => fetch(`https://api.neoxr.eu/api/youtube?url=${video.url}&type=video&quality=240p&apikey=GataDios`).then(res => res.json()), extract: d => ({ data: d.data.url, isDirect: false }) },
      { url: () => ogmp3.download(video.url, selectedQuality, 'video'), extract: d => ({ data: d.result.download, isDirect: false }) },
      { url: () => savetube.download(video.url, '240'), extract: d => ({ data: d.result.download, isDirect: false }) }
    ];

    const download = async (apis) => {
      for (const api of apis) {
        try {
          const data = await api.url();
          const { data: link } = api.extract(data);
          if (link) return { mediaData: link };
        } catch {}
      }
      return { mediaData: null };
    };

    if (command === 'playplus') {
      const { mediaData } = await download(audioApis);
      if (mediaData) await conn.sendMessage(m.chat, { audio: { url: mediaData }, mimetype: 'audio/mpeg' }, { quoted: m });
      else await m.react('❌');
    }

    if (command === 'playplus2') {
      const { mediaData } = await download(videoApis);
      if (mediaData) await conn.sendMessage(m.chat, { video: { url: mediaData }, mimetype: 'video/mp4', caption: `🔰 Aquí está tu video\n🔥 ${video.title}` }, { quoted: m });
      else await m.react('❌');
    }

    if (command === 'playplus3') {
      const { mediaData } = await download(audioApis);
      if (mediaData) await conn.sendMessage(m.chat, { document: { url: mediaData }, mimetype: 'audio/mpeg', fileName: `${video.title}.mp3` }, { quoted: m });
      else await m.react('❌');
    }

    if (command === 'playplus4') {
      const { mediaData } = await download(videoApis);
      if (mediaData) await conn.sendMessage(m.chat, { document: { url: mediaData }, mimetype: 'video/mp4', fileName: `${video.title}.mp4`, caption: `🔰 ${video.title}` }, { quoted: m });
      else await m.react('❌');
    }

  } catch (err) {
    console.error(err);
    await m.react('❌');
    await m.reply("❌ Error al descargar. Intente otra vez.");
  } finally {
    delete userRequests[m.sender];
  }
};

handler.help = ['playplus', 'playplus2', 'playplus3', 'playplus4'];
handler.tags = ['downloader'];
handler.command = ['playplus', 'playplus2', 'playplus3', 'playplus4'];
export default handler;

async function search(query) {
  const r = await yts.search({ query, hl: 'es', gl: 'ES' });
  return r.videos;
}

function secondString(seconds) {
  seconds = Number(seconds);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${m} min ${s} seg`;
}
