// ==================================================
// VANZYBOT MONGODB SCHEMA CENTER (FULL PRO)
// USER + ECONOMY + PREMIUM + GROUP + LOG SYSTEM
// ==================================================

const mongoose = require("mongoose");

const { Schema } = mongoose;

// ==================================================
// 👤 USER CORE SCHEMA
// ==================================================
const userSchema = new Schema({
  jid: { type: String, required: true, unique: true },

  name: { type: String, default: "User" },

  role: {
    type: String,
    default: "free" // free | premium | owner
  },

  premium: {
    type: Boolean,
    default: false
  },

  premiumExpired: {
    type: Date,
    default: null
  },

  limit: {
    type: Number,
    default: 10
  },

  money: {
    type: Number,
    default: 0
  },

  exp: {
    type: Number,
    default: 0
  },

  level: {
    type: Number,
    default: 1
  },

  warning: {
    type: Number,
    default: 0
  },

  banned: {
    type: Boolean,
    default: false
  },

  lastDaily: {
    type: Date,
    default: null
  },

  lastWork: {
    type: Date,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ==================================================
// ⚙️ SETTINGS SCHEMA (USER / GROUP SETTINGS)
// ==================================================
const settingsSchema = new Schema({
  jid: { type: String, required: true, unique: true },

  antiLink: {
    type: Boolean,
    default: false
  },

  antiSpam: {
    type: Boolean,
    default: false
  },

  welcome: {
    type: Boolean,
    default: false
  },

  goodbye: {
    type: Boolean,
    default: false
  },

  autoReply: {
    type: Boolean,
    default: false
  },

  nsfw: {
    type: Boolean,
    default: false
  },

  mute: {
    type: Boolean,
    default: false
  }
});

// ==================================================
// 👥 GROUP DATA SCHEMA
// ==================================================
const groupSchema = new Schema({
  jid: { type: String, required: true, unique: true },

  name: {
    type: String,
    default: "Group"
  },

  owner: {
    type: String,
    default: null
  },

  description: {
    type: String,
    default: ""
  },

  memberCount: {
    type: Number,
    default: 0
  },

  isBanned: {
    type: Boolean,
    default: false
  },

  antiLink: {
    type: Boolean,
    default: false
  },

  welcome: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ==================================================
// 💎 PREMIUM LOG SYSTEM
// ==================================================
const premiumLogSchema = new Schema({
  jid: String,

  action: {
    type: String, // add | remove | extend
    default: "add"
  },

  duration: {
    type: Number,
    default: 0
  },

  by: {
    type: String,
    default: null
  },

  date: {
    type: Date,
    default: Date.now
  }
});

// ==================================================
// 📊 ECONOMY LOG (MONEY HISTORY)
// ==================================================
const economyLogSchema = new Schema({
  jid: String,

  type: {
    type: String, // daily | work | shop | gamble | admin
    default: "work"
  },

  amount: {
    type: Number,
    default: 0
  },

  note: {
    type: String,
    default: ""
  },

  date: {
    type: Date,
    default: Date.now
  }
});

// ==================================================
// 🧠 AI MEMORY (CHAT MEMORY PER USER)
// ==================================================
const aiMemorySchema = new Schema({
  jid: { type: String, unique: true },

  memory: {
    type: Array,
    default: []
  },

  lastUpdate: {
    type: Date,
    default: Date.now
  }
});

// ==================================================
// EXPORT ALL MODELS
// ==================================================
const User = mongoose.model("User", userSchema);
const Settings = mongoose.model("Settings", settingsSchema);
const Group = mongoose.model("Group", groupSchema);
const PremiumLog = mongoose.model("PremiumLog", premiumLogSchema);
const EconomyLog = mongoose.model("EconomyLog", economyLogSchema);
const AIMemory = mongoose.model("AIMemory", aiMemorySchema);

module.exports = {
  User,
  Settings,
  Group,
  PremiumLog,
  EconomyLog,
  AIMemory
};
