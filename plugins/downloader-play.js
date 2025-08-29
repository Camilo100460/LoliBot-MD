// handler-youtube-bajo.js
// Descarga SIEMPRE en la calidad más baja, usando APIs web (Piped + Invidious).
// - Busca con Invidious (web API) y si falla, intenta con yt-search (opcional).
// - Obtiene streams con Piped y envía por URL (rápido, sin procesar localmente).

import fetch from 'node-fetch';
// Si quieres fallback local, descomenta yt-search:
// import yts from 'yt-search';

const PIPED_API = process.env.PIPED_API || 'https://pipedapi.kavin.rocks'; // API oficial (Piped) -> /streams/:id
const INVIDIOUS_APIS = (process.env.INVIDIOUS_APIS || 'https://yewtu.be').split(','); // puedes poner varias separadas por coma

const userCaptions = new Map();
const userRequests = {};

const handler = async (m, { conn, command, args, text, usedPrefix }) => {
  if (!text) {
    return m.reply(
      `*🤔 ¿Qué desea buscar?*\n` +
      `Escriba el nombre de la canción o pegue un enlace de YouTube.\n\n` +
      `*Ejemplos:*\n${usedPrefix + command} emilia 420\n${usedPrefix + command} https://youtu.be/XXXXXXXX`
    );
  }

  const tipoDescarga = (
    command === 'play' || command === 'musica' ? 'audio' :
    command === 'play2' || command === 'video' ? 'video' :
    command === 'play3' ? 'audio (documento)' :
    command === 'play4' ? 'video (documento)' : ''
  );

  if (userRequests[m.sender]) {
    return await conn.reply(
      m.chat,
      `⏳ Hey @${m.sender.split('@')[0]} espera, ya estás descargando algo.`,
      userCaptions.get(m.sender) || m
    );
  }
  userRequests[m.sender] = true;

  try {
    // 1) Resolver videoId
    const urlOrQuery = text.trim();
    const videoId = await resolveVideoId(urlOrQuery);

    if (!videoId) {
      throw new Error('No pude encontrar un videoId válido.');
    }

    // 2) Obtener streams desde Piped (audioStreams / videoStreams + metadatos)
    const streams = await getPipedStreams(videoId);
    if (!streams) throw new Error('No pude obtener streams desde la API de Piped.');

    // 3) Elegir siempre la calidad MÁS BAJA
    const lowAudio = pickLowestAudio(streams.audioStreams || []);
    const lowMuxedVideo = pickLowestMuxedVideo(streams.videoStreams || []);

    const title = streams.title || 'YouTube';
    const thumb = streams.thumbnailUrl;
    const videoUrlWatch = `https://www.youtube.com/watch?v=${videoId}`;

    // Aviso inicial
    const PlayText = await conn.sendMessage(
      m.chat,
      {
        text:
`${title}
*⇄ㅤ     ◁   ㅤ  ❚❚ㅤ     ▷ㅤ     ↻*

*⏰ Duración:* ${secondString(streams.duration || 0)}
*👉🏻 Envío su ${tipoDescarga} (calidad más baja)*`,
        contextInfo: {
          externalAdReply: {
            title,
            body: 'Downloader (API Web)',
            thumbnailUrl: thumb,
            sourceUrl: videoUrlWatch
          }
        }
      },
      { quoted: m }
    );
    userCaptions.set(m.sender, PlayText);

    // 4) Enviar según comando (siempre lo más bajo)
    if (command === 'play' || command === 'musica') {
      if (!lowAudio) throw new Error('No hay audio disponible');
      const { url, mimeType, quality, format } = lowAudio;

      await conn.sendMessage(
        m.chat,
        {
          audio: { url },
          mimetype: normalizeAudioMime(mimeType, format), // intenta m4a/mp4/ogg
          fileName: `${sanitize(title)}.${guessAudioExt(mimeType, format)}`
        },
        { quoted: m }
      );
    }

    if (command === 'play2' || command === 'video') {
      if (!lowMuxedVideo) throw new Error('No hay video con audio (progresivo) disponible');
      const { url, mimeType, quality } = lowMuxedVideo;

      await conn.sendMessage(
        m.chat,
        {
          video: { url },
          mimetype: normalizeVideoMime(mimeType),
          fileName: `${sanitize(title)}.mp4`,
          caption: `🔰 Aquí está tu video (baja): ${quality || 'baja'}`,
          thumbnail: thumb
        },
        { quoted: m }
      );
    }

    if (command === 'play3' || command === 'playdoc') {
      if (!lowAudio) throw new Error('No hay audio disponible');
      const { url, mimeType, format } = lowAudio;

      await conn.sendMessage(
        m.chat,
        {
          document: { url },
          mimetype: normalizeAudioMime(mimeType, format),
          fileName: `${sanitize(title)}.${guessAudioExt(mimeType, format)}`
        },
        { quoted: m }
      );
    }

    if (command === 'play4' || command === 'playdoc2') {
      if (!lowMuxedVideo) throw new Error('No hay video con audio (progresivo) disponible');
      const { url, mimeType, quality } = lowMuxedVideo;

      await conn.sendMessage(
        m.chat,
        {
          document: { url },
          mimetype: normalizeVideoMime(mimeType),
          fileName: `${sanitize(title)}.mp4`,
          caption: `🔰 Título: ${title} (baja: ${quality || 'baja'})`,
          thumbnail: thumb
        },
        { quoted: m }
      );
    }

  } catch (err) {
    console.error(err);
    m.react?.('❌');
    await m.reply('❌ Ocurrió un error con la API. Intente con otro término o más tarde.');
  } finally {
    delete userRequests[m.sender];
  }
};

handler.help = ['play', 'play2', 'play3', 'play4'];
handler.tags = ['downloader'];
handler.command = ['playplus', 'play2', 'play3', 'play4', 'musica', 'video', 'playdoc', 'playdoc2'];
handler.register = false;
export default handler;

/* =========================
   Helpers
   ========================= */

// 1) Resolver videoId desde texto o URL
async function resolveVideoId(input) {
  // Si pegan un link de YouTube, intenta extraer v= o youtu.be/<id>
  const idFromUrl = extractYouTubeId(input);
  if (idFromUrl) return idFromUrl;

  // Buscar por API de Invidious (rápido y sin API key)
  for (const base of INVIDIOUS_APIS) {
    try {
      const u = new URL('/api/v1/search', base);
      u.searchParams.set('q', input);
      u.searchParams.set('type', 'video');
      const res = await fetch(u.toString(), { headers: defaultHeaders(), timeout: 15000 });
      if (!res.ok) continue;
      const data = await res.json();
      const first = Array.isArray(data) ? data.find(v => v?.videoId) : null;
      if (first?.videoId) return first.videoId;
    } catch {}
  }

  // Fallback local con yt-search (descomenta arriba si lo quieres)
  // try {
  //   const r = await yts.search({ query: input, hl: 'es', gl: 'ES' });
  //   if (r?.videos?.length) return r.videos[0].videoId;
  // } catch {}

  return null;
}

function extractYouTubeId(u) {
  try {
    const url = new URL(u);
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.replace('/', '').trim();
      return id || null;
    }
    if (url.searchParams.get('v')) return url.searchParams.get('v');
  } catch {}
  // También aceptar un ID directo (11 chars típicamente)
  if (/^[\w-]{11}$/.test(u)) return u;
  return null;
}

// 2) Obtener streams desde Piped
async function getPipedStreams(videoId) {
  const u = new URL(`/streams/${videoId}`, PIPED_API);
  const res = await fetch(u.toString(), { headers: defaultHeaders(), timeout: 20000 });
  if (!res.ok) throw new Error('Piped respondió con error ' + res.status);
  return res.json();
}

// 3) Elegir SIEMPRE la calidad más baja (audio/video)
function pickLowestAudio(audioStreams) {
  if (!Array.isArray(audioStreams) || audioStreams.length === 0) return null;
  const scored = audioStreams
    .filter(s => s?.url)
    .map(s => {
      // Piped da `quality` como "48 kbps" y a veces `bitrate` aproximado
      const kbps = parseInt(String(s.quality || '').replace(/\D+/g, ''), 10);
      const score = Number.isFinite(kbps) ? kbps : (s.bitrate ? Math.round(+s.bitrate / 1000) : 999999);
      return { ...s, _score: score };
    })
    .sort((a, b) => a._score - b._score);
  return scored[0] || null;
}

function pickLowestMuxedVideo(videoStreams) {
  if (!Array.isArray(videoStreams) || videoStreams.length === 0) return null;
  // Queremos streams "muxed" (video + audio) => videoOnly === false
  const muxed = videoStreams.filter(v => v?.url && !v.videoOnly);
  if (muxed.length === 0) return null;

  // Ordena por altura (o por la etiqueta "144p/240p")
  const scored = muxed.map(v => {
    let h = v.height;
    if (!Number.isFinite(h)) {
      const q = String(v.quality || '').toLowerCase();
      const m = q.match(/(\d+)\s*p/);
      h = m ? parseInt(m[1], 10) : 9999;
    }
    return { ...v, _h: h };
  }).sort((a, b) => a._h - b._h);

  return scored[0] || null;
}

// 4) Utilidades
function defaultHeaders() {
  return {
    'user-agent': 'Mozilla/5.0 (DownloaderBot; +https://github.com/)',
    'accept': 'application/json'
  };
}

function guessAudioExt(mimeType, format) {
  const mt = (mimeType || '').toLowerCase();
  const fmt = (format || '').toLowerCase();
  if (mt.includes('webm') || fmt.includes('webm')) return 'webm';
  if (mt.includes('mp4') || fmt.includes('m4a')) return 'm4a';
  if (mt.includes('ogg') || fmt.includes('opus')) return 'ogg';
  return 'm4a';
}
function normalizeAudioMime(mimeType, format) {
  const ext = guessAudioExt(mimeType, format);
  if (ext === 'webm') return 'audio/webm';
  if (ext === 'ogg') return 'audio/ogg';
  return 'audio/mp4'; // WhatsApp acepta m4a/mp4
}
function normalizeVideoMime(mimeType) {
  const mt = (mimeType || '').toLowerCase();
  if (mt.includes('webm')) return 'video/webm';
  return 'video/mp4';
}

function sanitize(name = '') {
  return name.replace(/[\\/:*?"<>|]+/g, '').slice(0, 100).trim() || 'video';
}

function secondString(seconds) {
  seconds = Number(seconds || 0);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const dDisplay = d > 0 ? d + (d == 1 ? ' día, ' : ' días, ') : '';
  const hDisplay = h > 0 ? h + (h == 1 ? ' hora, ' : ' horas, ') : '';
  const mDisplay = m > 0 ? m + (m == 1 ? ' minuto, ' : ' minutos, ') : '';
  const sDisplay = s > 0 ? s + (s == 1 ? ' segundo' : ' segundos') : '';
  return dDisplay + hDisplay + mDisplay + sDisplay || '0 segundos';
}
