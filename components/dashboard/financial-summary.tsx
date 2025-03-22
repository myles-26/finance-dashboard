import type React from "react"
import { FiArrowUp, FiArrowDown } from "react-icons/fi"
import styles from "./financial-summary.module.scss"

interface FinancialSummaryProps {
  title: string
  amount: number
  icon: React.ReactNode
  trend: "up" | "down" | "neutral"
  trendPercentage: number
  color?: "green" | "red" | "blue"
}

export function FinancialSummary({ title, amount, icon, trend, trendPercentage, color }: FinancialSummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <div className={`${styles.cardIcon} ${color ? styles[color] : ""}`}>{icon}</div>
      </div>

      <div className={styles.cardAmount}>{formatCurrency(amount)}</div>

      <div className={styles.cardTrend}>
        <div className={`${styles.trendIndicator} ${styles[trend]}`}>
          {trend === "up" && <FiArrowUp size={14} />}
          {trend === "down" && <FiArrowDown size={14} />}
          <span>{trendPercentage}%</span>
        </div>
        <span className={styles.trendPeriod}>vs last month</span>
      </div>
    </div>
  )
}

