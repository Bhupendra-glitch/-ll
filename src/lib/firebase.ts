import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  getDocs,
  orderBy,
  onSnapshot,
  getDocFromServer,
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { WorkerProfile, SimulationResult, SimulationParams, LendingProduct } from '../types';

// Initialize Firebase App singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with configured custom database ID if available
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Test Firestore Connection
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    // Attempt getDocFromServer to verify live connection
    await getDocFromServer(doc(db, '_connection_check_', 'ping'));
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline status:', error.message);
      return false;
    }
    // Document not existing is still a successful connection
    return true;
  }
}

// Auto sign-in or retrieve authenticated user
export function initAuthListener(onUserReady: (user: User) => void): () => void {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      onUserReady(user);
    } else {
      try {
        const cred = await signInAnonymously(auth);
        onUserReady(cred.user);
      } catch (err) {
        console.error('Anonymous auth error:', err);
      }
    }
  });
  return unsubscribe;
}

// Sync Worker Profile to Firestore
export async function syncWorkerToDatabase(userId: string, profile: WorkerProfile): Promise<void> {
  try {
    const workerRef = doc(db, 'workers', userId);
    await setDoc(
      workerRef,
      {
        uid: userId,
        name: profile.name,
        occupation: profile.occupation,
        city: profile.city,
        monthlyAvgInflow: profile.monthlyAvgInflow,
        monthlyNetSurplus: profile.monthlyNetSurplus,
        dailyActiveDays: profile.dailyActiveDays,
        cashflowScore: profile.cashflowScore,
        confidenceScore: profile.confidenceScore,
        riskTier: profile.riskTier,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Error syncing worker to Firestore:', err);
    throw err;
  }
}

// Save Ingested Statement Metadata to Firestore
export async function saveStatementToDatabase(
  userId: string,
  statementData: {
    fileName: string;
    fileSize: string;
    txCount: number;
    ocrConfidence: number;
    status: 'PROCESSING' | 'VERIFIED' | 'FAILED';
  }
): Promise<string> {
  try {
    const stmtsCol = collection(db, 'workers', userId, 'statements');
    const docRef = await addDoc(stmtsCol, {
      ...statementData,
      id: '',
      userId,
      uploadedAt: new Date().toISOString(),
    });
    // Update with ID
    await setDoc(docRef, { id: docRef.id }, { merge: true });
    return docRef.id;
  } catch (err) {
    console.error('Error saving statement to Firestore:', err);
    throw err;
  }
}

// Save Monte Carlo Simulation to Firestore
export async function saveSimulationToDatabase(
  userId: string,
  params: SimulationParams,
  result: SimulationResult
): Promise<string> {
  try {
    const simsCol = collection(db, 'workers', userId, 'simulations');
    const docRef = await addDoc(simsCol, {
      id: '',
      userId,
      principal: params.principal,
      tenureMonths: params.tenureMonths,
      dailyEmi: result.emiAmount,
      interestSaved: result.interestSaved,
      defaultProbability: result.defaultProbability,
      safeZone: result.safeZone,
      scenario: params.stressScenario,
      createdAt: new Date().toISOString(),
    });
    await setDoc(docRef, { id: docRef.id }, { merge: true });
    return docRef.id;
  } catch (err) {
    console.error('Error saving simulation to Firestore:', err);
    throw err;
  }
}

// Submit Formal Loan Application to Firestore
export async function submitLoanApplicationToDatabase(
  userId: string,
  product: LendingProduct,
  amount: number,
  tenureMonths: number
): Promise<string> {
  try {
    const loansCol = collection(db, 'workers', userId, 'loanApplications');
    const docRef = await addDoc(loansCol, {
      id: '',
      userId,
      lenderName: product.lenderName,
      amount,
      tenureMonths,
      repaymentMode: product.repaymentMode,
      status: 'PRE_APPROVED',
      appliedAt: new Date().toISOString(),
    });
    await setDoc(docRef, { id: docRef.id }, { merge: true });
    return docRef.id;
  } catch (err) {
    console.error('Error submitting loan application to Firestore:', err);
    throw err;
  }
}

// Subscribe to worker loan applications in real-time
export function subscribeToLoanApplications(
  userId: string,
  onUpdate: (apps: any[]) => void
): () => void {
  const loansCol = collection(db, 'workers', userId, 'loanApplications');
  const q = query(loansCol, orderBy('appliedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const apps = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    onUpdate(apps);
  });
}
