import fs from "fs";
import os from "os";

// =========================
// 🤖 BOT IDENTITY
// =========================
global.botName = "VanzyBot-V1";
global.ownerName = "Vanzy";
global.owner = ["628xxxxxxxxxx"]; // ganti nomor kamu
global.botVersion = "1.0.0";

global.packname = "VanzyBot MD";
global.author = "VanzyBot System";
global.watermark = "VanzyBot-V1";

// =========================
// ⚙️ SYSTEM MODE
// =========================
global.mode = "public"; // public / self
global.devMode = true;
global.multiDevice = true;

global.autoRead = true;
global.autoTyping = false;
global.autoRecording = false;

// =========================
// 🌐 SERVER CONFIG
// =========================
global.port = process.env.PORT || 3000;
global.webApi = true;
global.apiPrefix = "/api";

// =========================
// 🧠 DATABASE CONFIG
// =========================
global.mongodb =
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/vanzybot";

global.sessionId = "vanzy-session";
global.databasePath = "./src/database";
global.backupPath = "./backup";

// =========================
// 🔥 PAIRING / QR SYSTEM
// =========================
global.usePairing = true;
global.pairingNumber = "628xxxxxxxxxx";
global.showQR = true;
global.qrInTerminal = true;

// =========================
// ⚡ DEV SETTINGS
// =========================
global.dev = {
  enabled: true,
  debugLog: true,
  watchPlugins: true,
  reloadDelay: 500
};

// =========================
// 💾 BACKUP SYSTEM
// =========================
global.backup = {
  enabled: true,
  interval: 60 * 60 * 1000
};

// =========================
// 📦 PLUGIN SYSTEM
// =========================
global.plugin = {
  autoInstall: true,
  folder: "./Plugins",
  maxPlugins: 500
};

// =========================
// 🔐 SECURITY SYSTEM
// =========================
global.security = {
  antidelete: true,
  antilink: true,
  antispam: true
};

// =========================
// 📊 LIMIT SYSTEM
// =========================
global.limit = {
  freeUser: 20,
  premiumUser: 999999
};

// =========================
// 🚀 API KEYS
// =========================
global.api = {
  openai: "",
  removebg: "",
  screenshot: "",
  tiktokApi: "",
  youtubeApi: ""
};

// =========================
// 💻 SYSTEM INFO
// =========================
global.systemInfo = {
  os: os.type(),
  arch: os.arch(),
  ram: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
  cpu: os.cpus()[0].model
};

// =========================
// 📁 AUTO CREATE FOLDERS
// =========================
const folders = [
  "./Plugins",
  "./src/database",
  "./tmp",
  "./backup",
  "./logs"
];

folders.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`[ VANZYBOT ] created folder: ${dir}`);
  }
});

// =========================
// 🧪 LOG STYLE
// =========================
global.logStyle = {
  prefix: "[ VANZYBOT-V1 ]",
  success: "✔",
  error: "✖",
  warning: "⚠",
  info: "ℹ"
};

// =========================
// 🔥 FEATURE FLAGS
// =========================
global.features = {
  aiChat: true,
  downloader: true,
  groupTools: true,
  stickerMaker: true,
  gameSystem: true,
  economySystem: true,
  levelSystem: true
};

// =========================
// ⚡ PERFORMANCE
// =========================
global.performance = {
  gcInterval: 30 * 60 * 1000,
  keepAlive: true
};

// =========================
// 📡 CONNECTION SETTINGS
// =========================
global.connection = {
  retryCount: 10,
  timeout: 60000
};

// =========================
// 🧪 VERSION CONTROL
// =========================
global.versionControl = {
  autoCheckUpdate: true,
  repo: "https://github.com/vanzybot/vanzybot-v1",
  branch: "main"
};

// =========================
// 🔥 EXPORT FULL CONFIG (SAFE)
// =========================
export default {
  botName: global.botName,
  ownerName: global.ownerName,
  owner: global.owner,

  botVersion: global.botVersion,

  packname: global.packname,
  author: global.author,
  watermark: global.watermark,

  mode: global.mode,
  devMode: global.devMode,
  multiDevice: global.multiDevice,

  autoRead: global.autoRead,
  autoTyping: global.autoTyping,
  autoRecording: global.autoRecording,

  port: global.port,
  webApi: global.webApi,
  apiPrefix: global.apiPrefix,

  mongodb: global.mongodb,
  sessionId: global.sessionId,
  databasePath: global.databasePath,
  backupPath: global.backupPath,

  usePairing: global.usePairing,
  pairingNumber: global.pairingNumber,
  showQR: global.showQR,
  qrInTerminal: global.qrInTerminal,

  dev: global.dev,
  backup: global.backup,
  plugin: global.plugin,
  security: global.security,
  limit: global.limit,
  api: global.api,

  systemInfo: global.systemInfo,
  logStyle: global.logStyle,
  features: global.features,
  performance: global.performance,
  connection: global.connection,
  versionControl: global.versionControl
};
