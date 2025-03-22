"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FiMenu, FiX, FiBell, FiUser, FiLogOut } from "react-icons/fi"
import { signOut, getCurrentUser } from "@/lib/firebase/auth"
import { ThemeToggle } from "../theme-toggle"
import styles from "./header.module.scss"

interface DashboardHeaderProps {
  onMenuClick: () => void
  sidebarOpen: boolean
}

export function DashboardHeader({ onMenuClick, sidebarOpen }: DashboardHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [userName, setUserName] = useState("User")
  const router = useRouter()

  useEffect(() => {
    // Fetch the current user's name when the component mounts
    const fetchUserName = async () => {
      try {
        const user = await getCurrentUser()
        if (user && user.displayName) {
          setUserName(user.displayName)
        } else if (user && user.email) {
          // If no display name, use the part of the email before @
          setUserName(user.email.split("@")[0])
        }
      } catch (error) {
        console.error("Failed to fetch user:", error)
      }
    }

    fetchUserName()
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/login")
    } catch (error) {
      console.error("Sign out failed:", error)
    }
  }

  const handleNotificationClick = () => {
    alert("Notifications feature coming soon!")
  }

  return (
    <header className={styles.header}>
      <div className={styles.menuButton} onClick={onMenuClick}>
        {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </div>

      <div className={styles.headerTitle}>
        <h1>Finance Dashboard</h1>
      </div>

      <div className={styles.headerActions}>
        <ThemeToggle />
        <button className={styles.iconButton} aria-label="Notifications" onClick={handleNotificationClick}>
          <FiBell size={20} />
        </button>

        <div className={styles.userMenu}>
          <button
            className={styles.userButton}
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
          >
            <div className={styles.userAvatar}>
              <FiUser size={20} />
            </div>
            <span className={styles.userName}>{userName}</span>
          </button>

          {userMenuOpen && (
            <div className={styles.userDropdown}>
              <button className={styles.userDropdownItem} onClick={handleSignOut}>
                <FiLogOut size={16} />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

