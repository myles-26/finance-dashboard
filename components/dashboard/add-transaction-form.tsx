"use client"

import type React from "react"

import { useState } from "react"
import { FiDollarSign, FiCalendar, FiTag, FiFileText } from "react-icons/fi"
import { addTransaction } from "@/lib/firebase/firestore"
import styles from "./forms.module.scss"

interface AddTransactionFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function AddTransactionForm({ onSuccess, onCancel }: AddTransactionFormProps) {
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [category, setCategory] = useState("Food")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [notes, setNotes] = useState("")
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
    "Income",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Validate amount
      const amountValue = Number.parseFloat(amount)
      if (isNaN(amountValue) || amountValue <= 0) {
        throw new Error("Please enter a valid amount")
      }

      await addTransaction({
        title,
        amount: amountValue,
        date: new Date(date),
        category,
        type,
        notes,
      })

      // Reset form
      setTitle("")
      setAmount("")
      setDate(new Date().toISOString().split("T")[0])
      setCategory("Food")
      setType("expense")
      setNotes("")

      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      console.error("Failed to add transaction:", err)
      setError(err.message || "Failed to add transaction")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Add New Transaction</h2>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            Title
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
              placeholder="Grocery shopping"
              required
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="amount" className={styles.label}>
              Amount
            </label>
            <div className={styles.inputWrapper}>
              <FiDollarSign className={styles.inputIcon} />
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={styles.input}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="date" className={styles.label}>
              Date
            </label>
            <div className={styles.inputWrapper}>
              <FiCalendar className={styles.inputIcon} />
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={styles.input}
                required
              />
            </div>
          </div>
        </div>

        <div className={styles.formRow}>
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
            <label className={styles.label}>Type</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={type === "expense"}
                  onChange={() => setType("expense")}
                  className={styles.radioInput}
                />
                <span>Expense</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={type === "income"}
                  onChange={() => setType("income")}
                  className={styles.radioInput}
                />
                <span>Income</span>
              </label>
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="notes" className={styles.label}>
            Notes (Optional)
          </label>
          <div className={styles.inputWrapper}>
            <FiFileText className={styles.inputIcon} />
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={styles.textarea}
              placeholder="Add any additional details..."
              rows={3}
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="button" onClick={onCancel} className={styles.cancelButton} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? "Adding..." : "Add Transaction"}
          </button>
        </div>
      </form>
    </div>
  )
}