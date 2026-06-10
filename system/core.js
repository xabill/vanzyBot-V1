// ==================================================
// VANZYBOT CORE SYSTEM
// Message + Command Handler
// ==================================================

const fs = require("fs");
const path = require("path");

// ==================================================
// LOAD PLUGINS
// ==================================================
function loadPlugins() {
  const pluginDir = "./plugins";
  const plugins = new Map();

  if (!fs.existsSync(pluginDir)) {
    fs.mkdirSync(pluginDir);
    console.log("📁 Plugins folder created");
  }

  const files = fs.readdirSync(pluginDir).filter(f => f.endsWith(".js"));

  for (const file of files) {
    try {
      const fullPath = path.join(__dirname, "../plugins", file);

      delete require.cache[require.resolve(fullPath)];
      const plugin = require(fullPath);

      if (plugin?.name && typeof plugin.execute === "function") {
        plugins.set(plugin.name.toLowerCase(), plugin);
        console.log("✅ Plugin loaded:", plugin.name);
      } else {
        console.log("⚠️ Invalid plugin:", file);
      }

    } catch (err) {
      console.log("❌ Failed load plugin:", file);
    }
  }

  return plugins;
}

// ==================================================
// SAFE REPLY
// ==================================================
async function reply(sock, jid, text, quoted = null) {
  try {
    await sock.sendMessage(jid, { text }, { quoted });
  } catch (err) {
    console.log("REPLY ERROR:", err.message);
  }
}

// ==================================================
// EXTRACT TEXT MESSAGE
// ==================================================
function getText(m) {
  return (
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    m.message?.imageMessage?.caption ||
    m.message?.videoMessage?.caption ||
    ""
  );
}

// ==================================================
// MAIN MESSAGE HANDLER
// ==================================================
async function handleMessage(sock, state, m) {
  try {
    if (!m?.message) return;

    const jid = m.key.remoteJid;
    const text = getText(m);

    if (!text.startsWith(state.prefix)) return;

    const args = text.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    const plugin = state.plugins.get(command);

    console.log("📩 CMD:", command);

    if (!plugin) {
      return reply(sock, jid, "❌ Command tidak ditemukan\n💡 ketik .menu", m);
    }

    await plugin.execute(sock, m, args);

  } catch (err) {
    console.log("CORE ERROR:", err.message);
  }
}

// ==================================================
// EXPORT MODULE
// ==================================================
module.exports = {
  loadPlugins,
  handleMessage,
  reply,
  getText
};
