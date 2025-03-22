"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "@/lib/firebase/auth"
import styles from "./settings.module.scss"

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark")
    }
    return false
  })
  const router = useRouter()

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)

    if (typeof window !== "undefined") {
      if (newMode) {
        document.documentElement.classList.add("dark")
        localStorage.setItem("theme", "dark")
      } else {
        document.documentElement.classList.remove("dark")
        localStorage.setItem("theme", "light")
      }
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/login")
    } catch (error) {
      console.error("Sign out failed:", error)
    }
  }

  return (
    <div className={styles.settingsPage}>
      <h1 className={styles.settingsTitle}>Settings</h1>

      <div className={styles.settingsCard}>
        <h2 className={styles.settingsSection}>Appearance</h2>

        <div className={styles.settingItem}>
          <div className={styles.settingInfo}>
            <h3 className={styles.settingTitle}>Dark Mode</h3>
            <p className={styles.settingDescription}>Toggle between light and dark theme</p>
          </div>
          <label className={styles.switch}>
            <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
            <span className={styles.slider}></span>
          </label>
        </div>
      </div>

      <div className={styles.settingsCard}>
        <h2 className={styles.settingsSection}>Account</h2>

        <div className={styles.settingItem}>
          <div className={styles.settingInfo}>
            <h3 className={styles.settingTitle}>Sign Out</h3>
            <p className={styles.settingDescription}>Sign out of your account</p>
          </div>
          <button className={styles.signOutButton} onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
