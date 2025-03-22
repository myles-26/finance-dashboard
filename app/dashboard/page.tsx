"use client"

import { useState, useEffect } from "react"
import { FiArrowUp, FiArrowDown, FiDollarSign, FiCreditCard } from "react-icons/fi"
import { FinancialSummary } from "@/components/dashboard/financial-summary"
import { ExpenseChart } from "@/components/dashboard/expense-chart"
import { IncomeChart } from "@/components/dashboard/income-chart"
import { TransactionList } from "@/components/dashboard/transaction-list"
import { BudgetProgress } from "@/components/dashboard/budget-progress"
import { fetchDashboardData } from "@/lib/firebase/firestore"
import { Loading } from "@/components/ui/loading"
import styles from "./dashboard.module.scss"

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const dashboardData = await fetchDashboardData()
        setData(dashboardData)
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
        setError("Failed to load dashboard data. Please try again later.")
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
      <h1 className={styles.dashboardTitle}>Financial Overview</h1>

      <div className={styles.summaryCards}>
        <FinancialSummary
          title="Total Balance"
          amount={data.totalBalance}
          icon={<FiDollarSign />}
          trend={data.balanceTrend}
          trendPercentage={data.balanceTrendPercentage}
        />
        <FinancialSummary
          title="Income"
          amount={data.totalIncome}
          icon={<FiArrowUp />}
          trend="up"
          trendPercentage={data.incomeTrendPercentage}
          color="green"
        />
        <FinancialSummary
          title="Expenses"
          amount={data.totalExpenses}
          icon={<FiArrowDown />}
          trend="down"
          trendPercentage={data.expenseTrendPercentage}
          color="red"
        />
        <FinancialSummary
          title="Savings"
          amount={data.totalSavings}
          icon={<FiCreditCard />}
          trend={data.savingsTrend}
          trendPercentage={data.savingsTrendPercentage}
          color="blue"
        />
      </div>

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

      <div className={styles.budgetSection}>
        <h2 className={styles.sectionTitle}>Budget Progress</h2>
        <div className={styles.budgetGrid}>
          {data.budgets.map((budget: any) => (
            <BudgetProgress
              key={budget.id}
              category={budget.category}
              spent={budget.spent}
              total={budget.total}
              icon={budget.icon}
            />
          ))}
        </div>
      </div>

      <div className={styles.transactionSection}>
        <h2 className={styles.sectionTitle}>Recent Transactions</h2>
        <TransactionList transactions={data.recentTransactions} />
      </div>
    </div>
  )
}
