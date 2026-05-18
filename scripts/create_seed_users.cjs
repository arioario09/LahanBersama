const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountPath =
  process.env.SERVICE_ACCOUNT ||
  path.resolve(__dirname, "..", "serviceAccountKey.json");

if (!fs.existsSync(serviceAccountPath)) {
  console.error("Service account key not found at", serviceAccountPath);
  console.error(
    "Set SERVICE_ACCOUNT env or place serviceAccountKey.json at project root.",
  );
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
});

const db = admin.firestore();

const seedUsers = [
  {
    email: "admin1@lahanbersama.local",
    password: "Admin123!",
    name: "Admin One",
    role: "admin",
  },
  {
    email: "admin2@lahanbersama.local",
    password: "Admin123!",
    name: "Admin Two",
    role: "admin",
  },
  {
    email: "validator1@lahanbersama.local",
    password: "Valid123!",
    name: "Validator One",
    role: "validator",
  },
  {
    email: "validator2@lahanbersama.local",
    password: "Valid123!",
    name: "Validator Two",
    role: "validator",
  },
];

async function ensureUser(u) {
  try {
    const existing = await admin.auth().getUserByEmail(u.email);
    console.log("User exists:", u.email, "uid=", existing.uid);
    // ensure firestore doc exists/updated
    await db.collection("users").doc(existing.uid).set(
      {
        name: u.name,
        email: u.email,
        role: u.role,
        status: "active",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        verificationStatus: "verified",
        ktpPhotoUrl: "",
        nik: "",
        bio: "",
        balance: 0,
      },
      { merge: true },
    );
    await admin.auth().setCustomUserClaims(existing.uid, { role: u.role });
    return existing.uid;
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      const created = await admin.auth().createUser({
        email: u.email,
        emailVerified: true,
        password: u.password,
        displayName: u.name,
      });
      console.log("Created user:", u.email, "uid=", created.uid);
      await admin.auth().setCustomUserClaims(created.uid, { role: u.role });
      await db.collection("users").doc(created.uid).set({
        name: u.name,
        email: u.email,
        role: u.role,
        status: "active",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        verificationStatus: "verified",
        ktpPhotoUrl: "",
        nik: "",
        bio: "",
        balance: 0,
      });
      return created.uid;
    }
    throw err;
  }
}

(async () => {
  try {
    for (const u of seedUsers) {
      try {
        await ensureUser(u);
      } catch (e) {
        console.error("Failed to ensure user", u.email, e);
      }
    }
    console.log("Seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("Unexpected error", err);
    process.exit(1);
  }
})();
