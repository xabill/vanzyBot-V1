// ==================================================
// VANZYBOT MONGODB CORE SYSTEM
// CONNECTION + BASIC HELPERS
// ==================================================

const mongoose = require("mongoose");

// ==================================================
// CONNECT DATABASE
// ==================================================
async function connectMongoDB(uri) {
  if (!uri) {
    console.log("❌ MONGO URI tidak ditemukan");
    return;
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("🟢 MongoDB CONNECTED SUCCESSFULLY");
  } catch (err) {
    console.log("🔴 MongoDB CONNECTION ERROR:", err.message);

    // auto retry connect
    setTimeout(() => {
      console.log("♻️ RETRY CONNECT MONGODB...");
      connectMongoDB(uri);
    }, 5000);
  }
}

// ==================================================
// DISCONNECT
// ==================================================
async function disconnectMongoDB() {
  try {
    await mongoose.disconnect();
    console.log("⚠️ MongoDB DISCONNECTED");
  } catch (err) {
    console.log("DISCONNECT ERROR:", err.message);
  }
}

// ==================================================
// CHECK STATUS
// ==================================================
function mongoStatus() {
  return mongoose.connection.readyState === 1
    ? "CONNECTED"
    : "DISCONNECTED";
}

// ==================================================
// EXPORT
// ==================================================
module.exports = {
  connectMongoDB,
  disconnectMongoDB,
  mongoStatus
};
