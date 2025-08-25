import axios from 'axios';

let previousCommitSHA = '';
let previousCommitMessage = '';
let previousCommitUser = ''; 
const owner = 'Camilo100460';
const repo = 'LoliBot-MD';

// Textos fijos en un solo idioma (Español)
const textos = {
  inicio: "🔎 Revisando actualizaciones del repositorio...",
  actualizacion: [
    "📌 Nueva actualización detectada:",
    "📝 Mensaje:",
    "👤 Autor:"
  ],
  error: "⚠️ No se pudo obtener la información del repositorio."
};

async function checkRepoUpdates(conn, m) {
  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`);
    const {sha, commit: {message}, html_url, author: { login } } = response.data[0];

    if (sha !== previousCommitSHA || message !== previousCommitMessage) {
      previousCommitSHA = sha;
      previousCommitMessage = message;
      previousCommitUser = login;

      conn.sendMessage(m.chat, {
        text: `${textos.actualizacion[0]} ${html_url}\n${textos.actualizacion[1]} ${message}\n${textos.actualizacion[2]} ${login}`
      }, {quoted: m});
    }
  } catch (error) {
    console.error(error);
    m.reply(textos.error);
  }
}

const handler = async (m, {conn}) => {
  conn.sendMessage(m.chat, {text: textos.inicio}, {quoted: m});  

  // Ejecutar solo una vez el intervalo
  if (!global.checkingUpdates) {
    global.checkingUpdates = true;
    setInterval(() => checkRepoUpdates(conn, m), 5 * 60 * 1000); // cada 5 minutos
  }
};

handler.command = /^(actualizacion|actualizaciones)/i;
handler.rowner = true;
export default handler;
