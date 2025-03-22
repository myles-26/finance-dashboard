"use client"

import { useState, useEffect } from "react"
import { FiPlus } from "react-icons/fi"
import { getTransactions } from "@/lib/firebase/firestore"
import { TransactionList } from "@/components/dashboard/transaction-list"
import { AddTransactionForm } from "@/components/dashboard/add-transaction-form"
import { Loading } from "@/components/ui/loading"
import styles from "../dashboard.module.scss"
import formStyles from "@/components/dashboard/forms.module.scss"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const data = await getTransactions(1, 50) // Get up to 50 transactions
      setTransactions(data)
      setError(null)
    } catch (error) {
      console.error("Failed to load transactions:", error)
      setError("Failed to load transactions. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  const handleAddSuccess = () => {
    setShowAddForm(false)
    loadTransactions()
  }

  if (loading && !showAddForm) {
    return <Loading />
  }

  if (error && !showAddForm) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
        <button className={styles.retryButton} onClick={() => loadTransactions()}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Transactions</h1>
        {!showAddForm && (
          <button className={formStyles.submitButton} onClick={() => setShowAddForm(true)}>
            <FiPlus size={16} style={{ marginRight: "0.5rem" }} />
            Add Transaction
          </button>
        )}
      </div>

      {showAddForm ? (
        <AddTransactionForm onSuccess={handleAddSuccess} onCancel={() => setShowAddForm(false)} />
      ) : (
        <div className={styles.transactionSection}>
          {transactions.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No transactions found. Add your first transaction to get started.</p>
              <button
                className={formStyles.submitButton}
                onClick={() => setShowAddForm(true)}
                style={{ marginTop: "1rem" }}
              >
                <FiPlus size={16} style={{ marginRight: "0.5rem" }} />
                Add Transaction
              </button>
            </div>
          ) : (
            <TransactionList transactions={transactions} />
          )}
        </div>
      )}
    </div>
  )
}