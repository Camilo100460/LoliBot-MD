import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'

//owner
global.owner = [
['573234745757'],
['5214774444444'],
['593968585383'],
['13022590512'],
['595975711894'],
['595975711894'],
['5219999699999']
]

//Información 
globalThis.info = {
wm: "MAY-MD",
vs: "2.0.0 (beta)",
packname: "𝗦𝗧𝗜𝗖𝗞𝗘𝗥𝗦❤️‍🔥 - LoliBot\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",
author: "Owner: @elrebelde21\n• Dueña: @itschinita_official",
apis: "https://api.delirius.store",
apikey: "GataDios",
fgmods: { url: 'https://api.fgmods.xyz/api', key: 'elrebelde21' },
neoxr: { url: 'https://api.neoxr.eu/api', key: 'GataDios' },
img2: "https://telegra.ph/file/39fb047cdf23c790e0146.jpg",
img4: fs.readFileSync('./media/Menu2.jpg'),
yt: "https://www.youtube.com/@elrebelde.21",
tiktok: "https://www.tiktok.com/@elrebelde.21",
md: "https://github.com/elrebelde21/LoliBot-MD",
fb: "https://www.facebook.com/elrebelde21",
ig: "https://www.instagram.com/its_china_official",
nn: "0", //Grupo ofc1
nn2: "0", //Grupo ofc2
nn3: "0", //Colab Loli & Gata
nn4: "0", //Enlace LoliBot
nn5: "0", //A.T.M.M
nn6: "0", //Dev support 
nna: "0",
nna2: "0"
}

//----------------------------------------------------

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
