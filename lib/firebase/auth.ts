import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth"
import { auth } from "./config"

export interface User {
  uid: string
  email: string | null
  displayName: string | null
}

export async function signUp(email: string, password: string, name: string): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)

  // Update the user profile with the display name
  if (userCredential.user) {
    await updateProfile(userCredential.user, {
      displayName: name,
    })
  }

  return {
    uid: userCredential.user.uid,
    email: userCredential.user.email,
    displayName: name,
  }
}

export async function signIn(email: string, password: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)

  return {
    uid: userCredential.user.uid,
    email: userCredential.user.email,
    displayName: userCredential.user.displayName,
  }
}

export async function signOut(): Promise<void> {
  return firebaseSignOut(auth)
}

export function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe()
        if (user) {
          resolve({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          })
        } else {
          resolve(null)
        }
      },
      reject,
    )
  })
}