import { initializeApp, getApps, getApp } from "firebase/app";
import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    increment, 
    serverTimestamp,
    onSnapshot,
    query,
    orderBy,
    limit,
    startAfter
} from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

export async function addToken(tokenData, walletAddress) {
    if (!walletAddress) {
        throw new Error("Wallet must be connected to add token");
    }

    // Check if user has already submitted a token
    const userRef = doc(db, "users", walletAddress);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists() && userSnap.data().tokenSubmitted) {
        throw new Error("You have already submitted a token");
    }

    // Check if token already exists
    const tokenRef = doc(db, "tokens", tokenData.address);
    const tokenSnap = await getDoc(tokenRef);
    
    if (tokenSnap.exists()) {
        throw new Error("This token has already been submitted");
    }

    // Add the token with server timestamp
    await setDoc(tokenRef, {
        ...tokenData,
        submittedBy: walletAddress,
        timestamp: serverTimestamp(),
        buyVotes: 0,
        byeVotes: 0
    });

    // Update user document
    await setDoc(userRef, {
        tokenSubmitted: true,
        submissions: {
            [tokenData.address]: serverTimestamp()
        }
    }, { merge: true });

    return { success: true };
}

export async function recordVote(tokenAddress, voteType, walletAddress) {
    if (!walletAddress) {
        throw new Error("Wallet must be connected to vote");
    }

    const voteId = `${tokenAddress}_${walletAddress}`;
    const voteRef = doc(db, "votes", voteId);
    const voteDoc = await getDoc(voteRef);

    if (voteDoc.exists()) {
        throw new Error("You have already voted on this token");
    }

    // Update token vote count
    const tokenRef = doc(db, "tokens", tokenAddress);
    await updateDoc(tokenRef, {
        [voteType === "buy" ? "buyVotes" : "byeVotes"]: increment(1)
    });

    // Record the vote
    await setDoc(voteRef, {
        tokenAddress,
        walletAddress,
        voteType,
        timestamp: serverTimestamp()
    });

    return { success: true };
}

export function setupTokenListener(callback) {
    const q = query(
        collection(db, "tokens"),
        orderBy("timestamp", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const tokens = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(tokens);
    });
}