const { StellarSdk, server, networkPassphrase, isTestnet } = require("../config/stellar");

/**
 * Fund a new testnet account using Friendbot
 */
const fundTestnetAccount = async (publicKey) => {
  if (!isTestnet) throw new Error("Friendbot only available on testnet");
  const response = await fetch(
    `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
  );
  if (!response.ok) throw new Error("Failed to fund testnet account");
  return response.json();
};

/**
 * Generate a new Stellar keypair
 */
const generateKeypair = () => {
  const keypair = StellarSdk.Keypair.random();
  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
  };
};

/**
 * Get account details from Stellar network
 */
const getAccountDetails = async (publicKey) => {
  try {
    const account = await server.loadAccount(publicKey);
    return account;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error("Account not found on Stellar network");
    }
    throw error;
  }
};

/**
 * Get account balance
 */
const getAccountBalance = async (publicKey) => {
  const account = await getAccountDetails(publicKey);
  return account.balances.map((b) => ({
    asset: b.asset_type === "native" ? "XLM" : b.asset_code,
    balance: b.balance,
    assetIssuer: b.asset_issuer || null,
  }));
};

/**
 * Build an UNSIGNED payment transaction and return its XDR.
 * The frontend passes this to Freighter for signing — secret key never leaves the browser.
 */
const buildPaymentXdr = async ({
  senderPublicKey,
  recipientPublicKey,
  amount,
  assetCode = "XLM",
  assetIssuer = null,
  memo = "",
}) => {
  const senderAccount = await server.loadAccount(senderPublicKey);

  const asset =
    assetCode === "XLM"
      ? StellarSdk.Asset.native()
      : new StellarSdk.Asset(assetCode, assetIssuer);

  const txBuilder = new StellarSdk.TransactionBuilder(senderAccount, {
    fee: await server.fetchBaseFee(),
    networkPassphrase,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: recipientPublicKey,
        asset,
        amount: String(amount),
      })
    )
    .setTimeout(30);

  if (memo) {
    txBuilder.addMemo(StellarSdk.Memo.text(memo));
  }

  const transaction = txBuilder.build();
  return transaction.toXDR();
};

/**
 * Submit a pre-signed transaction XDR to the Stellar network.
 * Signed by Freighter on the client — secret key never touches the server.
 */
const submitSignedTransaction = async (signedXdr) => {
  const transaction = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    networkPassphrase
  );
  const result = await server.submitTransaction(transaction);
  return {
    hash: result.hash,
    ledger: result.ledger,
    envelopeXdr: result.envelope_xdr,
  };
};

/**
 * Get transaction history for an account
 */
const getTransactionHistory = async (publicKey, limit = 10) => {
  const transactions = await server
    .transactions()
    .forAccount(publicKey)
    .limit(limit)
    .order("desc")
    .call();

  return transactions.records.map((tx) => ({
    hash: tx.hash,
    createdAt: tx.created_at,
    fee: tx.fee_charged,
    memo: tx.memo || null,
    successful: tx.successful,
  }));
};

module.exports = {
  generateKeypair,
  fundTestnetAccount,
  getAccountDetails,
  getAccountBalance,
  buildPaymentXdr,
  submitSignedTransaction,
  getTransactionHistory,
};
