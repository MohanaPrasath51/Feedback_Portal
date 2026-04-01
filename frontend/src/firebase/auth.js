import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import app from './firebaseConfig';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const signUp = async (name, email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (name) {
    await updateProfile(userCredential.user, { displayName: name });
  }
  return userCredential;
};

export const signIn = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const signInWithCustomAuthToken = (token) =>
  signInWithCustomToken(auth, token);

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const logOut = () => signOut(auth);

export const onAuthChange = (callback) =>
  onAuthStateChanged(auth, callback);

export default auth;
