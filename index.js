import "./Configurations.js";
import ffmpegStatic from "ffmpeg-static";
process.env.FFMPEG_PATH = ffmpegStatic;

// =========================
// 📦 BAILEYS CORE
// =========================
import {
  makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadContentFromMessage,
  downloadMediaMessage,
  jidDecode
} from "@whiskeysockets/baileys";

import fs from "fs";
import express from "express";
import mongoose from "mongoose";
import got from "got";
import pino from "pino";
import chalk from "chalk";
import figlet from "figlet";
import qrcode from "qrcode";
import qrcodeTerminal from "qrcode-terminal";
import { Boom } from "@hapi/boom";
import { fileTypeFromBuffer } from "file-type";
import path from "path";
import { fileURLToPath } from "url";

// =========================
// 📁 LOCAL MODULES (TIDAK DIHAPUS)
// =========================
import MongoAuth from "./System/MongoAuth/MongoAuth.js";
import { serialize } from "./System/whatsapp.js";
import { smsg, getBuffer, getSizeMedia } from "./System/Function2.js";

import core from "./Core.js";
import { readcommands, commands } from "./System/ReadCommands.js";

import {
  getPluginURLs,
  checkAntidelete,
  checkMod
} from "./System/MongoDB/MongoDb_Core.js";

import welcomeLeft from "./System/Welcome.js";

// =========================
// 📁 PATH
// =========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================
// 🌐 EXPRESS SERVER
// =========================
const app = express();
app.use(express.json());

const PORT = global.port || 3000;

// =========================
// 💾 PID FILE
// =========================
fs.writeFileSync(
  path.join(__dirname, "atlas.pid"),
  process.pid.toString()
);

// =========================
// 🔥 GLOBAL STATE
// =========================
let QR_GENERATE = "invalid";
let status = "initializing";
let AtlasSocket = null;
let mongoAuth;

// =========================
// 🚀 START BOT
// =========================
const startAtlas = async () => {
  try {
    await mongoose.connect(mongodb);
    console.log(chalk.green("[ ATLAS ] MongoDB connected ✓"));
  } catch (err) {
    console.log(chalk.red("[ DB ERROR ] " + err.message));
  }

  mongoAuth = new MongoAuth(sessionId);
  const { state, saveCreds, clearState } = await mongoAuth.init();

  console.log(
    figlet.textSync("VANZYBOT", {
      font: "Standard",
      horizontalLayout: "default",
      width: 70
    })
  );

  console.log(
    chalk.cyan(`[ BOT ] Node ${process.version} | ${process.platform}`)
  );

  await readcommands();

  // =========================
  // 🤖 SOCKET
  // =========================
  const { version } = await fetchLatestBaileysVersion();

  const Atlas = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
    version,
    browser: ["VanzyBot-V1", "Chrome", "1.0"]
  });

  AtlasSocket = Atlas;

  // =========================
  // 📡 CONNECTION HANDLER
  // =========================
  Atlas.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    status = connection;

    console.log("[ STATUS ]", connection);

    if (connection === "open") {
      console.log(chalk.green("🤖 BOT CONNECTED"));
    }

    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;

      if (reason !== DisconnectReason.loggedOut) {
        startAtlas();
      } else {
        await clearState();
        startAtlas();
      }
    }

    // =========================
    // 🔥 QR + PAIRING SUPPORT
    // =========================
    if (qr) {
      QR_GENERATE = qr;
      qrcodeTerminal.generate(qr, { small: true });
    }
  });

  // =========================
  // 💬 MESSAGE CORE (TIDAK DIHAPUS)
  // =========================
  Atlas.ev.on("messages.upsert", async (chatUpdate) => {
    const msg = chatUpdate.messages?.[0];
    if (!msg?.message) return;

    const m = serialize(Atlas, msg);
    if (!m?.message) return;

    core(Atlas, m, commands, chatUpdate);
  });

  // =========================
  // 👥 GROUP HANDLER
  // =========================
  Atlas.ev.on("group-participants.update", async (m) => {
    welcomeLeft(Atlas, m);
  });

  // =========================
  // 🧩 PLUGIN INSTALL (TIDAK DIHAPUS)
  // =========================
  const installPlugin = async () => {
    let plugins = [];
    try {
      plugins = await getPluginURLs();
    } catch (e) {
      console.log("[ PLUGIN ERROR ]", e.message);
    }

    for (let url of plugins) {
      try {
        const { body } = await got(url);
        fs.writeFileSync("./Plugins/" + path.basename(url), body);
        console.log("✔ plugin:", url);
      } catch (e) {}
    }
  };

  await installPlugin();

  Atlas.ev.on("creds.update", saveCreds);
};

// =========================
// 🌐 EXPRESS ROUTES
// =========================
app.get("/", (req, res) => {
  res.json({
    status: true,
    bot: "VanzyBot-V1"
  });
});

app.get("/api/status", (req, res) => {
  res.json({ status });
});

app.get("/api/qr", async (req, res) => {
  if (status === "open") return res.json({ status: "connected" });
  if (!QR_GENERATE || QR_GENERATE === "invalid")
    return res.json({ status: "waiting" });

  const img = await qrcode.toDataURL(QR_GENERATE);
  res.json({ status: "qr", qr: img });
});

// =========================
// 🔥 PAIRING SYSTEM (FULL AKTIF)
// =========================
app.post("/api/pair", async (req, res) => {
  const { phone } = req.body;

  if (!phone) return res.status(400).json({ error: "no number" });
  if (!AtlasSocket) return res.status(503).json({ error: "not ready" });

  try {
    const cleaned = phone.replace(/[^0-9]/g, "");

    let code = await AtlasSocket.requestPairingCode(cleaned);

    console.log(
      chalk.black.bgGreen(" PAIRING CODE "),
      chalk.black.bgWhite(code)
    );

    res.json({ code });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =========================
// 🚀 START SERVER + BOT
// =========================
app.listen(PORT, () => {
  console.log(chalk.green("[ WEB ] running on port " + PORT));
});

startAtlas();
