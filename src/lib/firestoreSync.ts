import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  limit,
  getDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from './googleAuth';
import { ClassSession, AttendanceRecord, ChatMessage, UserProfile } from '../types';
import { INITIAL_CLASSES, INITIAL_ATTENDANCE_RECORDS } from '../data';

/**
 * Sync classes: pulls classes from Firestore.
 * If collection is empty, seeds it with initial mock classes.
 */
export async function syncClassesFromFirestore(
  isOffline: boolean,
  onSync: (classes: ClassSession[]) => void
): Promise<void> {
  if (isOffline) return;
  const colPath = 'classes';

  try {
    const colRef = collection(db, colPath);
    const snap = await getDocs(colRef);

    if (snap.empty) {
      console.log('No classes found in Firestore. Seeding initial classes...');
      // Seed default classes
      for (const cls of INITIAL_CLASSES) {
        const docRef = doc(db, colPath, cls.id);
        await setDoc(docRef, cls);
      }
      onSync(INITIAL_CLASSES);
    } else {
      const classesList: ClassSession[] = [];
      snap.forEach((doc) => {
        classesList.push(doc.data() as ClassSession);
      });
      // Sort by name or code if needed
      onSync(classesList);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, colPath);
  }
}

/**
 * Saves or updates a ClassSession document in Firestore.
 */
export async function saveClassToFirestore(
  isOffline: boolean,
  classObj: ClassSession
): Promise<void> {
  if (isOffline) return;
  const colPath = 'classes';

  try {
    const docRef = doc(db, colPath, classObj.id);
    await setDoc(docRef, classObj);
    console.log(`Class ${classObj.code} saved to Firestore successfully.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${colPath}/${classObj.id}`);
  }
}

/**
 * Deletes a ClassSession document from Firestore.
 */
export async function deleteClassFromFirestore(
  isOffline: boolean,
  classId: string
): Promise<void> {
  if (isOffline) return;
  const colPath = 'classes';

  try {
    const docRef = doc(db, colPath, classId);
    await deleteDoc(docRef);
    console.log(`Class ${classId} deleted from Firestore successfully.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${colPath}/${classId}`);
  }
}

/**
 * Sync attendance records: pulls records from Firestore.
 * If collection is empty, seeds it with initial records.
 */
export async function syncAttendanceFromFirestore(
  isOffline: boolean,
  onSync: (records: AttendanceRecord[]) => void
): Promise<void> {
  if (isOffline) return;
  const colPath = 'records';

  try {
    const colRef = collection(db, colPath);
    const snap = await getDocs(colRef);

    if (snap.empty) {
      console.log('No attendance records found in Firestore. Seeding defaults...');
      for (const rec of INITIAL_ATTENDANCE_RECORDS) {
        const docRef = doc(db, colPath, rec.id);
        await setDoc(docRef, rec);
      }
      onSync(INITIAL_ATTENDANCE_RECORDS);
    } else {
      const recordsList: AttendanceRecord[] = [];
      snap.forEach((doc) => {
        recordsList.push(doc.data() as AttendanceRecord);
      });
      onSync(recordsList);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, colPath);
  }
}

/**
 * Saves or updates an AttendanceRecord in Firestore.
 */
export async function saveAttendanceToFirestore(
  isOffline: boolean,
  recordObj: AttendanceRecord
): Promise<void> {
  if (isOffline) return;
  const colPath = 'records';

  try {
    const docRef = doc(db, colPath, recordObj.id);
    await setDoc(docRef, recordObj);
    console.log(`Attendance record ${recordObj.id} saved to Firestore successfully.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${colPath}/${recordObj.id}`);
  }
}

/**
 * Listen to real-time chat messages from Firestore.
 */
export function listenToMessages(
  isOffline: boolean,
  onMessagesUpdate: (messages: ChatMessage[]) => void,
  onError?: (err: any) => void
): () => void {
  if (isOffline) return () => {};
  const colPath = 'messages';

  try {
    const colRef = collection(db, colPath);
    // Sort by timestamp if desired, or let client handle sorting
    const q = query(colRef, orderBy('id', 'asc'), limit(200));

    return onSnapshot(q, (snap) => {
      const msgList: ChatMessage[] = [];
      snap.forEach((doc) => {
        msgList.push(doc.data() as ChatMessage);
      });
      onMessagesUpdate(msgList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, colPath);
      if (onError) onError(error);
    });
  } catch (error) {
    console.error('Error setting up messages listener:', error);
    return () => {};
  }
}

/**
 * Saves a ChatMessage to Firestore.
 */
export async function saveMessageToFirestore(
  isOffline: boolean,
  messageObj: ChatMessage
): Promise<void> {
  if (isOffline) return;
  const colPath = 'messages';

  try {
    // We only save the fields required by the Firestore rules ChatMessage schema
    const cleanMsg = {
      id: messageObj.id,
      senderId: messageObj.senderId,
      senderName: messageObj.senderName,
      senderRole: messageObj.senderRole,
      receiverId: messageObj.receiverId,
      receiverName: messageObj.receiverName,
      message: messageObj.message,
      timestamp: messageObj.timestamp
    };

    const docRef = doc(db, colPath, messageObj.id);
    await setDoc(docRef, cleanMsg);
    console.log(`Message ${messageObj.id} sent and committed to Firestore.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${colPath}/${messageObj.id}`);
  }
}

/**
 * Saves or updates a user profile in Firestore.
 */
export async function saveUserProfileToFirestore(
  isOffline: boolean,
  profile: UserProfile
): Promise<void> {
  if (isOffline) return;
  const colPath = 'users';

  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log("No authenticated Firebase user. Skipping profile sync.");
      return;
    }

    if (currentUser.isAnonymous) {
      console.log("Anonymous Firebase user. Skipping profile sync.");
      return;
    }

    if (currentUser.uid !== profile.id) {
      console.warn(`Authenticated UID (${currentUser.uid}) does not match profile ID (${profile.id}). Skipping profile sync to avoid permission errors.`);
      return;
    }

    // Ensure standard user properties required by rules are set
    const cleanProfile = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      avatar: profile.avatar || '',
      studentId: profile.studentId || '',
      facultyId: profile.facultyId || '',
      department: profile.department || '',
      bio: profile.bio || '',
      phone: profile.phone || '',
      joinedAt: profile.joinedAt || new Date().toISOString()
    };

    const docRef = doc(db, colPath, profile.id);
    await setDoc(docRef, cleanProfile);
    console.log(`User profile for ${profile.name} updated in Firestore.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${colPath}/${profile.id}`);
  }
}
