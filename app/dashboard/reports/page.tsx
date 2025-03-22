"use client"

import { useState, useEffect } from "react"
import { fetchDashboardData } from "@/lib/firebase/firestore"
import { ExpenseChart } from "@/components/dashboard/expense-chart"
import { IncomeChart } from "@/components/dashboard/income-chart"
import { Loading } from "@/components/ui/loading"
import styles from "../dashboard.module.scss"

export default function ReportsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const dashboardData = await fetchDashboardData()
        setData(dashboardData)
      } catch (error) {
        console.error("Failed to load report data:", error)
        setError("Failed to load report data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
        <button className={styles.retryButton} onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.dashboardTitle}>Financial Reports</h1>

      <div className={styles.chartsContainer}>
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Income Breakdown</h2>
          <IncomeChart data={data.incomeData} />
        </div>
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Expense Categories</h2>
          <ExpenseChart data={data.expenseData} />
        </div>
      </div>
    </div>
  )
}
