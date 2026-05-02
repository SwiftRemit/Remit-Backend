const StellarSdk = require("@stellar/stellar-sdk");

const isTestnet = process.env.STELLAR_NETWORK !== "mainnet";

const server = new StellarSdk.Horizon.Server(
  process.env.STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org"
);

const networkPassphrase = isTestnet
  ? StellarSdk.Networks.TESTNET
  : StellarSdk.Networks.PUBLIC;

module.exports = { StellarSdk, server, networkPassphrase, isTestnet };
