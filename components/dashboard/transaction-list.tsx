"use client"

import { useState } from "react"
import { FiArrowUp, FiArrowDown, FiChevronDown, FiChevronUp } from "react-icons/fi"
import styles from "./transaction-list.module.scss"

interface Transaction {
  id: string
  title: string
  amount: number
  date: string | Date
  category: string
  type: "income" | "expense"
  notes?: string
}

interface TransactionListProps {
  transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className={styles.transactionList}>
      {transactions.length === 0 ? (
        <div className={styles.emptyState}>No transactions found.</div>
      ) : (
        transactions.map((transaction) => (
          <div
            key={transaction.id}
            className={`${styles.transactionItem} ${expandedId === transaction.id ? styles.expanded : ""}`}
            onClick={() => toggleExpand(transaction.id)}
          >
            <div className={styles.transactionMain}>
              <div className={styles.transactionIcon}>
                {transaction.type === "income" ? (
                  <div className={`${styles.iconWrapper} ${styles.income}`}>
                    <FiArrowUp size={16} />
                  </div>
                ) : (
                  <div className={`${styles.iconWrapper} ${styles.expense}`}>
                    <FiArrowDown size={16} />
                  </div>
                )}
              </div>

              <div className={styles.transactionInfo}>
                <div className={styles.transactionTitle}>{transaction.title}</div>
                <div className={styles.transactionMeta}>
                  {transaction.category} • {formatDate(transaction.date)}
                </div>
              </div>

              <div className={`${styles.transactionAmount} ${styles[transaction.type]}`}>
                {transaction.type === "income" ? "+" : "-"} {formatCurrency(Math.abs(transaction.amount))}
              </div>

              <div className={styles.expandIcon}>
                {expandedId === transaction.id ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
              </div>
            </div>

            {expandedId === transaction.id && transaction.notes && (
              <div className={styles.transactionDetails}>
                <div className={styles.transactionNotes}>
                  <div className={styles.notesLabel}>Notes:</div>
                  <div className={styles.notesContent}>{transaction.notes}</div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}