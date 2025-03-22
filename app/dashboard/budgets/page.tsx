"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { FiPlus, FiHome, FiShoppingBag, FiCoffee, FiTruck, FiWifi, FiDollarSign } from "react-icons/fi"
import { getBudgets } from "@/lib/firebase/firestore"
import { BudgetProgress } from "@/components/dashboard/budget-progress"
import { AddBudgetForm } from "@/components/dashboard/add-budget-form"
import { Loading } from "@/components/ui/loading"
import styles from "../dashboard.module.scss"
import formStyles from "@/components/dashboard/forms.module.scss"

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  // Helper to get icon component from string name
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      home: <FiHome size={16} />,
      shopping: <FiShoppingBag size={16} />,
      coffee: <FiCoffee size={16} />,
      car: <FiTruck size={16} />,
      wifi: <FiWifi size={16} />,
      dollar: <FiDollarSign size={16} />,
    }

    return icons[iconName] || <FiHome size={16} />
  }

  const loadBudgets = async () => {
    try {
      setLoading(true)
      const data = await getBudgets()
      // Transform the data to include the icon component
      const budgetsWithIcons = data.map((budget) => ({
        ...budget,
        icon: getIconComponent(budget.icon || "home"),
      }))
      setBudgets(budgetsWithIcons)
      setError(null)
    } catch (error) {
      console.error("Failed to load budgets:", error)
      setError("Failed to load budgets. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBudgets()
  }, [])

  const handleAddSuccess = () => {
    setShowAddForm(false)
    loadBudgets()
  }

  if (loading && !showAddForm) {
    return <Loading />
  }

  if (error && !showAddForm) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
        <button className={styles.retryButton} onClick={() => loadBudgets()}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Budget Management</h1>
        {!showAddForm && (
          <button className={formStyles.submitButton} onClick={() => setShowAddForm(true)}>
            <FiPlus size={16} style={{ marginRight: "0.5rem" }} />
            Add Budget
          </button>
        )}
      </div>

      {showAddForm ? (
        <AddBudgetForm onSuccess={handleAddSuccess} onCancel={() => setShowAddForm(false)} />
      ) : (
        <div className={styles.budgetSection}>
          {budgets.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No budgets found. Add your first budget to get started.</p>
              <button
                className={formStyles.submitButton}
                onClick={() => setShowAddForm(true)}
                style={{ marginTop: "1rem" }}
              >
                <FiPlus size={16} style={{ marginRight: "0.5rem" }} />
                Add Budget
              </button>
            </div>
          ) : (
            <div className={styles.budgetGrid}>
              {budgets.map((budget) => (
                <BudgetProgress
                  key={budget.id}
                  category={budget.category}
                  spent={budget.spent}
                  total={budget.total}
                  icon={budget.icon}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}