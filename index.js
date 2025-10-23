// index.js
const express = require("express");
const admin = require("firebase-admin");
require("dotenv").config(); // Load .env file in local dev

// ✅ Build service account object from environment variables
const serviceAccount = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL
};

// ✅ Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const app = express();

// GET /getRiders — fetch data from Firestore
app.get("/getRiders", async (req, res) => {
  try {
    const ridersSnapshot = await db.collection("Riders").get();

    const ridersList = ridersSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || null,
      isActive: doc.data().isActive || null,
      supervisor: doc.data().supervisor || null,
    }));

    res.status(200).json({
      count: ridersList.length,
      riders: ridersList,
    });
  } catch (error) {
    console.error("❌ Error fetching riders:", error);
    res.status(500).json({ error: "Failed to fetch riders" });
  }
});

// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
