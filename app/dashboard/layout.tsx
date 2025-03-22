"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { getCurrentUser } from "@/lib/firebase/auth"
import styles from "./dashboard.module.scss"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement

      // Check if we're on mobile and sidebar is open
      if (window.innerWidth <= 768 && sidebarOpen) {
        // Check if the click is outside the sidebar
        if (!target.closest(`.${styles.dashboardSidebar}`)) {
          setSidebarOpen(false)
        }
      }
    }

    document.addEventListener("click", handleClickOutside)

    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [sidebarOpen, styles.dashboardSidebar])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.push("/login")
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <div className={`${styles.dashboardLayout} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
      <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      <DashboardSidebar open={sidebarOpen} />
      <main className={styles.dashboardMain}>{children}</main>
    </div>
  )
}
