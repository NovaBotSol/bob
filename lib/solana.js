import { Connection, PublicKey } from "@solana/web3.js";

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC;
const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;

const FULL_RPC_URL = HELIUS_API_KEY
  ? `${RPC_URL}/?api-key=${HELIUS_API_KEY}`
  : RPC_URL;

const connection = new Connection(FULL_RPC_URL, "confirmed");

export async function getSolanaTokenMetadata(mintAddress) {
  try {
    console.log(`Fetching metadata for: ${mintAddress}`);

    const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "1",
        method: "getAsset",
        params: { id: mintAddress },
      }),
    });

    const result = await response.json();

    if (!result || !result.result) {
      console.warn(`No metadata found for ${mintAddress} on Helius.`);
      return null;
    }

    console.log("Fetched Metadata:", result.result);

    return {
      name: result.result.content?.metadata?.name || `Token ${mintAddress.slice(0, 4)}`,
      symbol: result.result.content?.metadata?.symbol || "???",
      image: result.result.content?.links?.image || "/placeholder.png",
    };
  } catch (error) {
    console.error("Error fetching Solana metadata:", error);
    return null;
  }
}

export async function getTokenData(mintAddress) {
  try {
    if (!mintAddress || mintAddress.length !== 44) {
      throw new Error("Invalid Solana address format");
    }

    const solanaMetadata = await getSolanaTokenMetadata(mintAddress);

    return {
      address: mintAddress,
      name: solanaMetadata?.name || `Unknown Token (${mintAddress.slice(0, 4)}...)`,
      symbol: solanaMetadata?.symbol || "???",
      image: solanaMetadata?.image || "/placeholder.png",
    };
  } catch (error) {
    console.error("Token Data Error:", error);
    return {
      address: mintAddress,
      name: `Unknown Token (${mintAddress.slice(0, 4)}...)`,
      symbol: "???",
      image: "/placeholder.png",
    };
  }
}

export { connection };