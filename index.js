// ==================================================
//  VANZYBOT PRO MAX ULTRA CORE SYSTEM
//  WhatsApp Bot + Plugin + Web Panel + Auto Reconnect
//  Author: xabill (optimized version)
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
const http = require("http");
const express = require("express");
const { Boom } = require("@hapi/boom");

// ==================================================
// GLOBAL STATE SYSTEM
// ==================================================
const state = {
  sock: null,
  status: "initializing",
  prefix: global.BOT_PREFIX || ".",
  plugins: new Map(),
  reconnectCount: 0
};

// ==================================================
// EXPRESS WEB SERVER (STATUS PANEL)
// ==================================================
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    bot: "VANZYBOT PRO MAX ULTRA",
    status: state.status,
    prefix: state.prefix,
    plugins: state.plugins.size,
    reconnect: state.reconnectCount
  });
});

app.get("/ping", (req, res) => {
  res.send("PONG - BOT ACTIVE");
});

app.listen(PORT, () => {
  console.log("🌐 Web Panel running on port " + PORT);
});

// ==================================================
// PLUGIN LOADER SYSTEM
// ==================================================
function loadPlugins() {
  const pluginPath = "./plugins";
  const plugins = new Map();

  if (!fs.existsSync(pluginPath)) {
    console.log("📁 Plugins folder not found, creating...");
    fs.mkdirSync(pluginPath);
  }

  const files = fs.readdirSync(pluginPath).filter(f => f.endsWith(".js"));

  for (const file of files) {
    try {
      const plugin = require(path.join(__dirname, "plugins", file));

      if (plugin?.name && typeof plugin.execute === "function") {
        plugins.set(plugin.name.toLowerCase(), plugin);
        console.log(`✅ Plugin loaded: ${plugin.name}`);
      }
    } catch (err) {
      console.log("❌ Failed plugin:", file);
    }
  }

  console.log(`📦 Total plugins: ${plugins.size}`);
  return plugins;
}

// ==================================================
// BOT START FUNCTION
// ==================================================
async function startBot() {
  const { state: auth, saveCreds } =
    await useMultiFileAuthState("./session");

  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth,
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    browser: ["VANZYBOT", "Chrome", "1.0.0"]
  });

  state.sock = sock;
  state.status = "connecting";

  // load plugins setiap connect
  state.plugins = loadPlugins();

  sock.ev.on("creds.update", saveCreds);

  // ==================================================
  // CONNECTION HANDLER
  // ==================================================
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      state.status = "online";
      console.log("✅ BOT CONNECTED SUCCESSFULLY");
    }

    if (connection === "close") {
      state.status = "offline";
      state.reconnectCount++;

      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;

      if (code !== DisconnectReason.loggedOut) {
        console.log("♻️ Reconnecting bot...");
        setTimeout(startBot, 3000);
      } else {
        console.log("❌ Logged out - resetting session");
        fs.rmSync("./session", { recursive: true, force: true });
        setTimeout(startBot, 3000);
      }
    }

    if (connection === "connecting") {
      state.status = "connecting";
      console.log("🔄 Connecting...");
    }
  });

  // ==================================================
  // MESSAGE HANDLER CORE
  // ==================================================
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m.message) return;

    const text =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      "";

    if (!text.startsWith(state.prefix)) return;

    const args = text.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();

    const plugin = state.plugins.get(command);

    const reply = (txt) =>
      sock.sendMessage(m.key.remoteJid, { text: txt });

    console.log(`📩 CMD: ${command}`);

    if (plugin) {
      try {
        await plugin.execute(sock, m, args);
      } catch (err) {
        console.log("❌ Plugin error:", err.message);
        reply("❌ Error plugin execution");
      }
    } else {
      reply("❌ Command tidak ditemukan\n💡 ketik .menu");
    }
  });
}

// ==================================================
// ERROR HANDLER (ANTI CRASH)
// ==================================================
process.on("uncaughtException", (err) => {
  console.log("⚠️ Crash detected:", err.message);
});

process.on("unhandledRejection", (err) => {
  console.log("⚠️ Promise error:", err.message);
});

// ==================================================
// AUTO START BOT
// ==================================================
startBot();
