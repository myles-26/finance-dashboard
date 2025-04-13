"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import styles from "./charts.module.scss"

interface ExpenseChartProps {
  data: {
    name: string
    value: number
    color: string
  }[]
}

export function ExpenseChart({ data }: ExpenseChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{payload[0].name}</p>
          <p className={styles.tooltipValue}>{formatCurrency(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }
  if (!data || data.length === 0) {
    return <p>No data available for this month.</p>
  }

  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend layout="vertical" verticalAlign="middle" align="right" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}