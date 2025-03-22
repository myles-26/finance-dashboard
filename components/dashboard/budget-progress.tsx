import type { ReactNode } from "react"
import styles from "./budget-progress.module.scss"

interface BudgetProgressProps {
  category: string
  spent: number
  total: number
  icon: ReactNode
}

export function BudgetProgress({ category, spent, total, icon }: BudgetProgressProps) {
  const percentage = Math.min(Math.round((spent / total) * 100), 100)
  const remaining = total - spent

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getProgressColor = () => {
    if (percentage < 50) return styles.good
    if (percentage < 80) return styles.warning
    return styles.danger
  }

  return (
    <div className={styles.budgetCard}>
      <div className={styles.budgetHeader}>
        <div className={styles.budgetIcon}>{icon}</div>
        <div className={styles.budgetInfo}>
          <h3 className={styles.budgetCategory}>{category}</h3>
          <div className={styles.budgetAmount}>
            <span className={styles.spent}>{formatCurrency(spent)}</span>
            <span className={styles.total}> / {formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <div className={styles.progressContainer}>
        <div className={`${styles.progressBar} ${getProgressColor()}`} style={{ width: `${percentage}%` }} />
      </div>

      <div className={styles.budgetFooter}>
        <div className={styles.remaining}>
          <span className={styles.remainingLabel}>Remaining</span>
          <span className={styles.remainingAmount}>{formatCurrency(remaining)}</span>
        </div>
        <div className={styles.percentage}>{percentage}%</div>
      </div>
    </div>
  )
}

