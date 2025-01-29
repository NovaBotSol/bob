import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const db = getFirestore();

/**
 * Function to vote on a token
 * @param {string} walletAddress - The user's wallet address
 * @param {string} tokenId - The ID of the token being voted on
 * @param {string} voteType - "buy" or "bye"
 */
export async function voteOnToken(walletAddress, tokenId, voteType) {
  try {
    // Validate input data
    if (!walletAddress) {
      throw new Error("Wallet not connected. Please connect your wallet.");
    }
    if (!tokenId) {
      throw new Error("Token ID is missing. Please select a token to vote on.");
    }
    if (voteType !== "buy" && voteType !== "bye") {
      throw new Error('Invalid vote type. Use "buy" or "bye".');
    }

    // Create a unique document ID: Combine wallet address and token ID
    const voteDocId = `${walletAddress}_${tokenId}`;
    const voteDocRef = doc(db, "votes", voteDocId);

    // Check if the user already voted for this token
    const existingVote = await getDoc(voteDocRef);
    if (existingVote.exists()) {
      throw new Error("You have already voted for this token.");
    }

    // Log the data being saved for debugging purposes
    console.log("Saving vote data:", {
      walletAddress,
      tokenId,
      voteType,
      timestamp: Date.now(),
    });

    // Save the vote to Firestore
    await setDoc(voteDocRef, {
      walletAddress,
      tokenId,
      voteType,
      timestamp: Date.now(),
    });

    console.log("Vote successfully recorded!");
  } catch (error) {
    console.error("Error voting:", error.message);
    throw error; // Re-throw the error so the calling function can handle it
  }
}

