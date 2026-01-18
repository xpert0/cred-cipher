import http from "node:http";
import fs from "fs";
import { randomUUID } from "node:crypto";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import db from "./db.mjs";
import { default as wc } from "./credit_js/witness_calculator.js";

const PORT = 5001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getWalletProfile(address) {
  // For prototype: mainnet deployment will use the api with valid keys ~@xpert0
  return {
    ageScore: Math.min(730 / 365, 5) * 20,
    txScore: Math.min(200 / 100, 5) * 20,
    defaultPenalty: Math.min(0 * 10, 50)
  };
  const API_KEY = "APIKEY";
  const txRes = await fetch(`https://api.etherscan.io/api?module=account&action=txlist&address=${address}&apikey=${API_KEY}`);
  const txData = await txRes.json();
  const txs = txData.result;
  const firstTxTime = Number(txs[0].timeStamp);
  const now = Math.floor(Date.now() / 1000);
  const walletAgeDays = Math.floor((now - firstTxTime) / 86400);
  const txCount = txs.length;
  const defaults = txs.filter(tx => tx.isError === "1").length;
  return {
    ageScore: Math.min(walletAgeDays / 365, 5) * 20,
    txScore: Math.min(txCount / 100, 5) * 20,
    defaultPenalty: Math.min(defaults * 10, 50)
  };
}

async function computeCreditTier(input) {
  const wasmPath = path.join(__dirname, "credit_js", "credit.wasm");
  const buffer = fs.readFileSync(wasmPath);
  const wasm = await WebAssembly.instantiate(buffer, {});
  const witnessCalculator = await wc(wasm.instance.exports);
  const witness = await witnessCalculator.calculateWitness(input, 0);
  const finalScore = Number(witness[1]);
  let tier;
  if (finalScore > 400) tier = 3;
  else if (finalScore > 250) tier = 2;
  else if (finalScore > 150) tier = 1;
  else tier = 0;
  return {
    score: finalScore,
    tier
  };
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", c => (data += c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}"));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

function respond(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

function lenderProvide(wallet, amount) {
  return {
    action: "liquidity_provided",
    wallet,
    amount,
    proof: randomUUID()
  };
}

function lenderWithdraw(addr, amount) {
  return {
    action: "liquidity_withdrawn",
    addr,
    amount,
    proof: randomUUID()
  };
}

function userExecute(aadhar, merchant, amount, limit) {
  return {
    action: "credit_executed",
    aadhar,
    merchant,
    amount,
    limit,
    receipt_id: randomUUID(),
    timestamp: Date.now()
  };
}

function merchantVerify(merchant, receiptId) {
  return {
    action: "receipt_verified",
    merchant,
    receipt_id: receiptId,
    valid: true
  };
}

function merchantClaim(addr) {
  return {
    action: "settlement_claimed",
    merchant: addr,
    settlement_id: randomUUID()
  };
}

function userRepay(addr, amount) {
  return {
    action: "repayment_acknowledged",
    user: addr,
    amount,
    tx_id: randomUUID()
  };
}

async function auth(aadhar) {
	if(await db.getByAadhar(aadhar)) return {first:false};
    await db.addUser({ aadhar });
	return {first:true};
}

async function listAddr(aadhar,addr) {
	return await db.getByAadhar(aadhar).address;
}

async function remAddress(aadhar,addr) {
	await db.remAddr(aadhar, addr);
	return {};
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  try {
    if (req.method === "OPTIONS") {
    	res.writeHead(204);
   	    res.end();
   	    return;
    }
    if (req.method !== "POST")
      return respond(res, 405, { error: "POST only" });
    const body = await parseBody(req);
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === "/lender/provide")
      return respond(res, 200, lenderProvide(body.wallet, +body.amount));
    if (url.pathname === "/lender/withdraw")
      return respond(res, 200, lenderWithdraw(body.addr, +body.amount));
    if (url.pathname === "/user/execute")
      return respond(
        res,
        200,
        userExecute(
          body.aadhar,
          body.merchant_addr,
          +body.amount,
          +body.limit
        )
      );
    if (url.pathname === "/merchant/verify")
      return respond(
        res,
        200,
        merchantVerify(body.merchant_addr, body.receipt_id)
      );
    if (url.pathname === "/merchant/claim")
      return respond(res, 200, merchantClaim(body.addr));
    if (url.pathname === "/user/repay")
      return respond(res, 200, userRepay(body.addr, +body.amount));
    if (url.pathname === "/auth")
      return respond(res,200,await auth(body.aadhar));
    if (url.pathname === "/address/add") {
      await db.addAddr(body.aadhar,body.addr);
      return respond(res,200,{message:"Address added"});
    }
    if (url.pathname === "/address/rem")
      return respond(res,200,await remAddress(body.aadhar,body.addr));
    if (url.pathname === "/address/list")
      return respond(res,200,await listAddr(body.aadhar));
    if (url.pathname === "/score") {
      const user = await db.getByAadhar(body.aadhar);
      const {score,tier} = computeCreditTier(getWalletProfile(user.addr));
      const aadharHash = crypto.createHash("256").update(aadhar.toString()).digest("hex");
      return respond(res,200,{aadharHash,score,tier});
    }
    respond(res, 404, { error: "Route not found" });
  } catch (err) {
    respond(res, 400, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`Stateless BNPL API running on port ${PORT}`);
});
