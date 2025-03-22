"use client"

import type React from "react"

import { useState } from "react"
import { FiDollarSign, FiTag, FiClock } from "react-icons/fi"
import { addBudget } from "@/lib/firebase/firestore"
import styles from "./forms.module.scss"

interface AddBudgetFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function AddBudgetForm({ onSuccess, onCancel }: AddBudgetFormProps) {
  const [category, setCategory] = useState("Food")
  const [total, setTotal] = useState("")
  const [period, setPeriod] = useState<"monthly" | "weekly" | "yearly">("monthly")
  const [icon, setIcon] = useState("coffee")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const categories = [
    "Food",
    "Housing",
    "Transportation",
    "Utilities",
    "Shopping",
    "Entertainment",
    "Healthcare",
    "Education",
  ]

  const icons = [
    { name: "coffee", label: "Food & Dining" },
    { name: "home", label: "Housing" },
    { name: "car", label: "Transportation" },
    { name: "wifi", label: "Utilities" },
    { name: "shopping", label: "Shopping" },
    { name: "dollar", label: "General" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Validate amount
      const totalValue = Number.parseFloat(total)
      if (isNaN(totalValue) || totalValue <= 0) {
        throw new Error("Please enter a valid amount")
      }

      await addBudget({
        category,
        total: totalValue,
        period,
        icon,
      })

      // Reset form
      setCategory("Food")
      setTotal("")
      setPeriod("monthly")
      setIcon("coffee")

      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      console.error("Failed to add budget:", err)
      setError(err.message || "Failed to add budget")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Add New Budget</h2>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="category" className={styles.label}>
            Category
          </label>
          <div className={styles.inputWrapper}>
            <FiTag className={styles.inputIcon} />
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={styles.select}
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="total" className={styles.label}>
            Budget Amount
          </label>
          <div className={styles.inputWrapper}>
            <FiDollarSign className={styles.inputIcon} />
            <input
              id="total"
              type="number"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              className={styles.input}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="period" className={styles.label}>
              Period
            </label>
            <div className={styles.inputWrapper}>
              <FiClock className={styles.inputIcon} />
              <select
                id="period"
                value={period}
                onChange={(e) => setPeriod(e.target.value as "monthly" | "weekly" | "yearly")}
                className={styles.select}
                required
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="icon" className={styles.label}>
              Icon
            </label>
            <div className={styles.inputWrapper}>
              <select
                id="icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className={styles.select}
                required
              >
                {icons.map((icon) => (
                  <option key={icon.name} value={icon.name}>
                    {icon.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="button" onClick={onCancel} className={styles.cancelButton} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? "Adding..." : "Add Budget"}
          </button>
        </div>
      </form>
    </div>
  )
}
