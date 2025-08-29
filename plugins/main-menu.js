const handler = async (m, { conn, usedPrefix }) => {
  try {
    const username = '@' + m.sender.split('@')[0];
    if (usedPrefix == 'a' || usedPrefix == 'A') return;

    const more = String.fromCharCode(8206);
    const readMore = more.repeat(4001);

    const d = new Date(new Date().getTime() + 3600000);
    const week = d.toLocaleDateString('es-ES', { weekday: 'long' });
    const date = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const _uptime = process.uptime() * 1000;
    const uptime = clockString(_uptime);

    // Base de datos (ajústalo según uses Postgres o JSON)
    const rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length;
    const rtotal = Object.keys(global.db.data.users).length || '0';

    // Información del usuario
    let user = global.db.data.users[m.sender];
    let exp = user?.exp || 0;
    let limit = user?.limit || 0;
    let level = user?.level || 0;
    let role = user?.role || 'Nuevo';
    let money = user?.money || 0;
    let joincount = user?.joincount || 0;

    // Encabezado
    const header = `
🔮 𝙈𝘼𝙔-𝘽𝙊𝙏 🔮

📌 Hola, ${username}

📅 *Fecha:* ${week}, ${date}
⏱️ *Uptime:* ${uptime}
📊 *Usuarios:* ${rtotal} (Registrados: ${rtotalreg})

───────────────
👤 *Tu Perfil*:
- Nivel: ${level}
- Exp: ${exp}
- Rol: ${role}
- Límite: ${limit}
- Dinero: ${money}
- Tokens: ${joincount}
───────────────
${readMore}
`.trim();

    // Menú fijo
    const comandos = `
📜 *Menú de comandos:*

🎵 ${usedPrefix}menuaudios
🍂 ${usedPrefix}menufreefire
📖 ${usedPrefix}labiblia
🤖 ${usedPrefix}infobot
💻 ${usedPrefix}script
🎮 ${usedPrefix}menugames
📲 ${usedPrefix}menuapps
🔍 ${usedPrefix}menubuscadores
`.trim();

    const texto = `${header}\n${comandos}`;

    // Imagen
    const pp = global.imagen1 || 'https://i.imgur.com/xyz.jpg';

    await conn.sendMessage(
      m.chat,
      { image: { url: pp }, caption: texto, mentions: [m.sender] },
      { quoted: m }
    );
  } catch (e) {
    await m.reply(`❌ Error al mostrar el menú: ${e.message}`);
  }
};

handler.help = ['menu'];
handler.tags = ['info'];
handler.command = /^(menu|help|comandos|commands|cmd|cmds)$/i;
export default handler;

function clockString(ms) {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
}
