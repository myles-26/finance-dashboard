"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FiHome,
  FiPieChart,
  FiDollarSign,
  FiCreditCard,
  FiSettings,
  FiTarget,
  FiTrendingUp,
} from "react-icons/fi"
import styles from "./sidebar.module.scss"

interface DashboardSidebarProps {
  open: boolean
}

export function DashboardSidebar({ open }: DashboardSidebarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : ""}`}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>MJTrack</h2>
      </div>

      <nav className={styles.sidebarNav}>
        <ul className={styles.navList}>
          <li>
            <Link href="/dashboard" className={`${styles.navLink} ${isActive("/dashboard") ? styles.active : ""}`}>
              <FiHome size={20} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/transactions"
              className={`${styles.navLink} ${isActive("/dashboard/transactions") ? styles.active : ""}`}
            >
              <FiDollarSign size={20} />
              <span>Transactions</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/budgets"
              className={`${styles.navLink} ${isActive("/dashboard/budgets") ? styles.active : ""}`}
            >
              <FiTarget size={20} />
              <span>Budgets</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/reports"
              className={`${styles.navLink} ${isActive("/dashboard/reports") ? styles.active : ""}`}
            >
              <FiPieChart size={20} />
              <span>Reports</span>
            </Link>
          </li>
          <li>
            <Link
              href="#"
              className={styles.navLink}
              onClick={(e) => {
                e.preventDefault()
                alert("Investments feature coming soon!")
              }}
            >
              <FiTrendingUp size={20} />
              <span>Investments</span>
            </Link>
          </li>
          <li>
            <Link
              href="#"
              className={styles.navLink}
              onClick={(e) => {
                e.preventDefault()
                alert("Accounts feature coming soon!")
              }}
            >
              <FiCreditCard size={20} />
              <span>Accounts</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className={styles.sidebarFooter}>
        <Link
          href="/dashboard/settings"
          className={`${styles.navLink} ${isActive("/dashboard/settings") ? styles.active : ""}`}
        >
          <FiSettings size={20} />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  )
}
