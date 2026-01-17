import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "database.json");

async function initDB() {
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify([], null, 2));
  }
}

async function readDB() {
  await initDB();
  const data = await fs.readFile(DB_FILE, "utf-8");
  return JSON.parse(data);
}

async function writeDB(data) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

async function getAll() {
  return await readDB();
}

async function getByAadhar(aadhar) {
  const db = await readDB();
  return db.find(u => u.aadhar === aadhar) || false;
}

async function addUser({ aadhar, address = [], default: isDefault = false, due = 0 }) {
  const db = await readDB();
  if (db.some(u => u.aadhar === aadhar)) throw new Error("Aadhar already exists");
  const record = {
    aadhar,
    address,
    default: isDefault,
    due
  };
  db.push(record);
  await writeDB(db);
  return record;
}

async function updateUser(aadhar, updates) {
  const db = await readDB();
  const index = db.findIndex(u => u.aadhar === aadhar);
  if (index === -1) throw new Error("User not found");
  db[index] = { ...db[index], ...updates };
  await writeDB(db);
  return db[index];
}

async function deleteUser(aadhar) {
  const db = await readDB();
  const filtered = db.filter(u => u.aadhar !== aadhar);
  if (filtered.length === db.length) throw new Error("User not found");
  await writeDB(filtered);
  return true;
}

async function markDefault(aadhar) {
  const db = await readDB();
  const user = db.find(u => u.aadhar === aadhar);
  if (!user) throw new Error("User not found");
  if(!user.default) user.default = true;
  else user.default = false;
  await writeDB(db);
  return true;
}

async function updateDue(aadhar, amount) {
  if (typeof amount !== "number") throw new Error("Amount must be numeric");
  const db = await readDB();
  const user = db.find(u => u.aadhar === aadhar);
  if (!user) throw new Error("User not found");
  user.due = amount;
  await writeDB(db);
  return user;
}

async function addAddr(aadhar, wallet) {
  if (!validateWallet(wallet)) throw new Error("Invalid wallet address format");
  const db = await readDB();
  const user = db.find(u => u.aadhar === aadhar);
  if (!user) throw new Error("User not found");
  if (!user.address.includes(wallet)) user.address.push(wallet);
  await writeDB(db);
  return user;
}

async function remAddr(aadhar, wallet) {
  const db = await readDB();
  const user = db.find(u => u.aadhar === aadhar);
  if (!user) throw new Error("User not found");
  user.address = user.address.filter(a => a !== wallet);
  await writeDB(db);
  return user;
}

export default {
	getByAadhar,
	addUser,
	updateUser,
	deleteUser,
	markDefault,
	updateDue,
	addAddr,
	remAddr
};
