//import { youtubedl, youtubedlv2 } from '@bochilteam/scraper'
import fetch from 'node-fetch';
import yts from 'yt-search';
import ytdl from 'ytdl-core';
import axios from 'axios'; 
import { savetube } from '../lib/yt-savetube.js'
import { ogmp3 } from '../lib/youtubedl.js'; 

const LimitAud = 20 * 1024 * 1024; // 725MB
const LimitVid = 50 * 1024 * 1024; // 425MB
const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/;
const userCaptions = new Map();
const userRequests = {};
  
const handler = async (m, { conn, command, args, text, usedPrefix }) => {
  if (!text) return m.reply(`*🤔Que está buscando? 🤔*\n*Ingrese el nombre de la canción*\n\n*Ejemplo:*\n${usedPrefix + command} emilia 420`);

  const tipoDescarga = command === 'play' || command === 'musica' ? 'audio' : command === 'play2' ? 'video' : command === 'play3' ? 'audio (documento)' : command === 'play4' ? 'video (documento)' : '';

  if (userRequests[m.sender]) return await conn.reply(m.chat, `⏳ Hey @${m.sender.split('@')[0]} espera, ya estás descargando algo 🙄\nEspera a que termine tu solicitud actual antes de hacer otra...`, userCaptions.get(m.sender) || m);

  userRequests[m.sender] = true;

  try {
    let videoIdToFind = text.match(youtubeRegexID) || null;
    const yt_play = await search(args.join(' ')); 
    let ytplay2 = await yts(videoIdToFind === null ? text : 'https://youtu.be/' + videoIdToFind[1]);

    if (videoIdToFind) {
      const videoId = videoIdToFind[1];
      ytplay2 = ytplay2.all.find(item => item.videoId === videoId) || ytplay2.videos.find(item => item.videoId === videoId);
    }
    ytplay2 = ytplay2.all?.[0] || ytplay2.videos?.[0] || ytplay2;

    const PlayText = await conn.sendMessage(m.chat, { text: `${yt_play[0].title}
*⇄ㅤ     ◁   ㅤ  ❚❚ㅤ     ▷ㅤ     ↻*

*⏰ Duración:* ${secondString(yt_play[0].duration.seconds)}
*👉🏻Aguarde un momento en lo que envío su ${tipoDescarga}*`,  
contextInfo:{  
forwardedNewsletterMessageInfo: { 
newsletterJid: '120363305025805187@newsletter', 
serverMessageId: '', 
newsletterName: 'LoliBot ✨️' },
forwardingScore: 9999999,  
isForwarded: true,   
mentionedJid: null,  
externalAdReply: {  
showAdAttribution: false,  
renderLargerThumbnail: false,  
title: yt_play[0].title,   
body: "LoliBot",
containsAutoReply: true,  
mediaType: 1,   
thumbnailUrl: yt_play[0].thumbnail, 
sourceUrl: "skyultraplus.com"
}}}, { quoted: m })
    userCaptions.set(m.sender, PlayText);

    // 🔹 Siempre la calidad más baja
    const selectedQuality = (command === 'play' || command === 'musica' || command === 'play3') ? '64' : '240';
    const isAudio = command.toLowerCase().includes('mp3') || command.toLowerCase().includes('audio')
    const format = isAudio ? 'mp3' : '240' 

    const audioApis = [
      { url: () => savetube.download(yt_play[0].url, format), extract: (data) => ({ data: data.result.download, isDirect: false }) },
      { url: () => ogmp3.download(yt_play[0].url, selectedQuality, 'audio'), extract: (data) => ({ data: data.result.download, isDirect: false }) },
      { url: () => fetch(`https://api.dorratz.com/v3/ytdl?url=${yt_play[0].url}`).then(res => res.json()), extract: (data) => { 
        const mp3 = data.medias.find(media => media.extension === "mp3");
        return { data: mp3.url, isDirect: false }}},
      { url: () => fetch(`https://api.neoxr.eu/api/youtube?url=${yt_play[0].url}&type=audio&quality=64kbps&apikey=GataDios`).then(res => res.json()), extract: (data) => ({ data: data.data.url, isDirect: false }) },
    ];

    const videoApis = [
      { url: () => savetube.download(yt_play[0].url, '240'), extract: (data) => ({ data: data.result.download, isDirect: false }) },
      { url: () => ogmp3.download(yt_play[0].url, selectedQuality, 'video'), extract: (data) => ({ data: data.result.download, isDirect: false }) },
      { url: () => fetch(`https://api.neoxr.eu/api/youtube?url=${yt_play[0].url}&type=video&quality=240p&apikey=GataDios`).then(res => res.json()), extract: (data) => ({ data: data.data.url, isDirect: false }) },
    ];

    const download = async (apis) => {
      let mediaData = null;
      let isDirect = false;
      for (const api of apis) {
        try {
          const data = await api.url();
          const { data: extractedData, isDirect: direct } = api.extract(data);
          if (extractedData) {
            mediaData = extractedData;
            isDirect = direct;
            break;
          }
        } catch (e) {
          console.log(`Error con API: ${e}`);
          continue;
        }
      }
      return { mediaData, isDirect };
    };

    // --- AUDIO ---
    if (command === 'play' || command === 'musica') {
      const { mediaData, isDirect } = await download(audioApis);
      if (mediaData) {
        await conn.sendMessage(m.chat, { audio: isDirect ? mediaData : { url: mediaData }, mimetype: 'audio/mpeg', contextInfo: {} }, { quoted: m });
      } else {
        await m.react('❌');
      }
    }

    // --- VIDEO ---
    if (command === 'play2' || command === 'video') {
      const { mediaData, isDirect } = await download(videoApis);
      if (mediaData) {
        const messageOptions = { fileName: `${yt_play[0].title}.mp4`, caption: `🔰 Aquí está tu video \n🔥 Título: ${yt_play[0].title}`, mimetype: 'video/mp4' };
        await conn.sendMessage(m.chat, { video: isDirect ? mediaData : { url: mediaData }, thumbnail: yt_play[0].thumbnail, ...messageOptions }, { quoted: m });
      } else {
        await m.react('❌');
      }
    }

    // --- AUDIO COMO DOCUMENTO ---
    if (command === 'play3' || command === 'playdoc') {
      const { mediaData, isDirect } = await download(audioApis);
      if (mediaData) {
        await conn.sendMessage(m.chat, { document: isDirect ? mediaData : { url: mediaData }, mimetype: 'audio/mpeg', fileName: `${yt_play[0].title}.mp3`, contextInfo: {} }, { quoted: m });
      } else {
        await m.react('❌');
      }
    }

    // --- VIDEO COMO DOCUMENTO ---
    if (command === 'play4' || command === 'playdoc2') {
      const { mediaData, isDirect } = await download(videoApis);
      if (mediaData) {
        await conn.sendMessage(m.chat, { document: isDirect ? mediaData : { url: mediaData }, fileName: `${yt_play[0].title}.mp4`, caption: `🔰Título: ${yt_play[0].title}`, thumbnail: yt_play[0].thumbnail, mimetype: 'video/mp4'}, { quoted: m })
      } else {
        await m.react('❌');
      }
    }

  } catch (error) {
    console.error(error);
    m.react("❌️")
  } finally {
    delete userRequests[m.sender]; 
  }
}

handler.help = ['play', 'play2', 'play3', 'play4', 'playdoc'];
handler.tags = ['downloader'];
handler.command = ['play', 'play2', 'play3', 'play4', 'audio', 'video', 'playdoc', 'playdoc2', 'musica'];
handler.register = false;
export default handler;

async function search(query, options = {}) {
  const search = await yts.search({query, hl: 'es', gl: 'ES', ...options});
  return search.videos;
}

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
