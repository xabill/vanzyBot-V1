// ==================================================
// VANZYBOT ULTRA CORE V3
// PRODUCTION READY | ANTI CRASH | MODULAR STYLE
// BY xabill (upgraded clean system)
// ==================================================

require("./config");

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs");
const path = require("path");
const express = require("express");
const { Boom } = require("@hapi/boom");

// ==================================================
// GLOBAL STATE MANAGER
// ==================================================
const state = {
  sock: null,
  status: "initializing",
  prefix: global.BOT_PREFIX || ".",
  plugins: new Map(),
  reconnectCount: 0,
  uptimeStart: Date.now()
};

let isStarting = false;

// ==================================================
// EXPRESS WEB PANEL (FULL STATUS)
// ==================================================
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    bot: "VANZYBOT ULTRA CORE V3",
    status: state.status,
    prefix: state.prefix,
    plugins: state.plugins.size,
    reconnect: state.reconnectCount,
    uptime: Math.floor((Date.now() - state.uptimeStart) / 1000),
    memory: process.memoryUsage(),
    platform: process.platform
  });
});

app.get("/ping", (req, res) => {
  res.send("PONG OK");
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    status: state.status
  });
});

app.listen(PORT, () => {
  console.log("====================================");
  console.log("🌐 WEB PANEL ACTIVE ON PORT:", PORT);
  console.log("====================================");
});

// ==================================================
// PLUGIN SYSTEM (HOT RELOAD SAFE)
// ==================================================
function loadPlugins() {
  const dir = "./plugins";
  const plugins = new Map();

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    console.log("📁 plugins folder created");
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));

  for (const file of files) {
    try {
      const fullPath = path.join(__dirname, "plugins", file);

      // clear cache (HOT RELOAD)
      delete require.cache[require.resolve(fullPath)];

      const plugin = require(fullPath);

      if (!plugin?.name || typeof plugin.execute !== "function") {
        console.log("⚠️ Invalid plugin:", file);
        continue;
      }

      plugins.set(plugin.name.toLowerCase(), plugin);
      console.log("✅ Loaded plugin:", plugin.name);

    } catch (err) {
      console.log("❌ Plugin error:", file);
    }
  }

  console.log("📦 TOTAL PLUGINS:", plugins.size);
  return plugins;
}

// ==================================================
// SAFE REPLY FUNCTION
// ==================================================
async function reply(sock, jid, text, quoted) {
  try {
    await sock.sendMessage(jid, { text }, { quoted });
  } catch (e) {
    console.log("REPLY ERROR:", e.message);
  }
}

// ==================================================
// BOT CORE START FUNCTION
// ==================================================
async function startBot() {
  if (isStarting) return;
  isStarting = true;

  console.log("🚀 STARTING BOT...");

  try {
    const { state: auth, saveCreds } =
      await useMultiFileAuthState("./session");

    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth,
      logger: pino({ level: "silent" }),
      printQRInTerminal: true,
      browser: ["VANZYBOT", "Chrome", "3.0"]
    });

    state.sock = sock;
    state.status = "connecting";
    state.plugins = loadPlugins();

    sock.ev.on("creds.update", saveCreds);

    // ==================================================
    // OPTIONAL PAIRING MODE (UNCOMMENT IF NEEDED)
    // ==================================================
    /*
    if (!sock.authState.creds.registered) {
      const number = "62xxxxxxxxxx";
      const code = await sock.requestPairingCode(number);
      console.log("PAIRING CODE:", code);
    }
    */

    // ==================================================
    // CONNECTION HANDLER
    // ==================================================
    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === "open") {
        state.status = "online";
        console.log("✅ BOT ONLINE");
      }

      if (connection === "close") {
        state.status = "offline";
        state.reconnectCount++;

        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;

        console.log("⚠️ CONNECTION CLOSED, REASON:", reason);

        if (reason !== DisconnectReason.loggedOut) {
          console.log("♻️ RECONNECTING BOT...");
          setTimeout(() => {
            isStarting = false;
            startBot();
          }, 3000);
        } else {
          console.log("❌ LOGGED OUT - RESET SESSION");

          try {
            fs.rmSync("./session", { recursive: true, force: true });
          } catch {}

          setTimeout(() => {
            isStarting = false;
            startBot();
          }, 4000);
        }
      }

      if (connection === "connecting") {
        state.status = "connecting";
        console.log("🔄 CONNECTING...");
      }
    });

    // ==================================================
    // MESSAGE HANDLER CORE
    // ==================================================
    sock.ev.on("messages.upsert", async ({ messages }) => {
      const m = messages?.[0];
      if (!m?.message) return;

      const jid = m.key.remoteJid;

      const text =
        m.message.conversation ||
        m.message.extendedTextMessage?.text ||
        m.message.imageMessage?.caption ||
        m.message.videoMessage?.caption ||
        "";

      if (!text.startsWith(state.prefix)) return;

      const args = text.slice(1).trim().split(/ +/);
      const command = args.shift().toLowerCase();

      const plugin = state.plugins.get(command);

      console.log("📩 COMMAND:", command);

      if (!plugin) {
        return reply(sock, jid, "❌ Command tidak ditemukan\n💡 ketik .menu", m);
      }

      try {
        await plugin.execute(sock, m, args);
      } catch (err) {
        console.log("❌ PLUGIN ERROR:", err.message);
        await reply(sock, jid, "❌ Error saat menjalankan command", m);
      }
    });

  } catch (err) {
    console.log("❌ FATAL START ERROR:", err.message);

    setTimeout(() => {
      isStarting = false;
      startBot();
    }, 5000);
  } finally {
    isStarting = false;
  }
}

// ==================================================
// GLOBAL ERROR HANDLER (ANTI CRASH FULL)
// ==================================================
process.on("uncaughtException", (err) => {
  console.log("⚠️ UNCAUGHT ERROR:", err.message);
});

process.on("unhandledRejection", (err) => {
  console.log("⚠️ PROMISE REJECTION:", err.message);
});

process.on("warning", (w) => {
  console.log("⚠️ WARNING:", w.message);
});

process.on("SIGINT", () => {
  console.log("🛑 STOPPING BOT...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("🛑 FORCE STOP...");
  process.exit(0);
});

// ==================================================
// AUTO START SYSTEM
// ==================================================
startBot();
