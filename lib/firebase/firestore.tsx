import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  doc,
  updateDoc,
  orderBy,
  limit,
  type Timestamp,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./config"
import { getCurrentUser } from "./auth"
import { FiHome, FiShoppingBag, FiCoffee, FiTruck, FiWifi, FiDollarSign } from "react-icons/fi"
import type { ReactNode } from "react"

// Define types for our data
export interface Transaction {
  id: string
  title: string
  amount: number
  date: Timestamp | Date
  category: string
  type: "income" | "expense"
  notes?: string
  userId: string
  createdAt: Timestamp | Date
}

export interface Budget {
  id: string
  category: string
  total: number
  spent: number
  period: "monthly" | "weekly" | "yearly"
  userId: string
  createdAt: Timestamp | Date
  icon?: string // Store icon name as string
}

export interface DashboardData {
  totalBalance: number
  balanceTrend: "up" | "down" | "neutral"
  balanceTrendPercentage: number
  totalIncome: number
  incomeTrendPercentage: number
  totalExpenses: number
  expenseTrendPercentage: number
  totalSavings: number
  savingsTrend: "up" | "down" | "neutral"
  savingsTrendPercentage: number
  incomeData: { name: string; value: number }[]
  expenseData: { name: string; value: number; color: string }[]
  budgets: {
    id: string
    category: string
    spent: number
    total: number
    icon: ReactNode
  }[]
  recentTransactions: Transaction[]
}

// Helper to get icon component from string name
const getIconComponent = (iconName: string): ReactNode => {
  const icons: Record<string, ReactNode> = {
    home: <FiHome size={16} />,
    shopping: <FiShoppingBag size={16} />,
    coffee: <FiCoffee size={16} />,
    car: <FiTruck size={16} />,
    wifi: <FiWifi size={16} />,
    dollar: <FiDollarSign size={16} />,
  }

  return icons[iconName] || <FiDollarSign size={16} />
}

// Fetch dashboard data from Firestore
export async function fetchDashboardData(): Promise<DashboardData> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    // Get recent transactions
    const transactionsRef = collection(db, "transactions")
    const transactionsQuery = query(
      transactionsRef,
      where("userId", "==", user.uid),
      orderBy("date", "desc"),
      limit(10),
    )

    const transactionsSnapshot = await getDocs(transactionsQuery)
    const transactions: Transaction[] = transactionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Transaction, "id">),
    }))

    // Get budgets
    const budgetsRef = collection(db, "budgets")
    const budgetsQuery = query(budgetsRef, where("userId", "==", user.uid), where("period", "==", "monthly"))

    const budgetsSnapshot = await getDocs(budgetsQuery)
    const budgets = budgetsSnapshot.docs.map((doc) => {
      const data = doc.data() as Budget
      return {
        id: doc.id,
        category: data.category,
        spent: data.spent,
        total: data.total,
        icon: getIconComponent(data.icon || "dollar"),
      }
    })

    // Calculate totals
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfPrevMonth = new Date(firstDayOfMonth)
    lastDayOfPrevMonth.setDate(lastDayOfPrevMonth.getDate() - 1)
    const firstDayOfPrevMonth = new Date(lastDayOfPrevMonth.getFullYear(), lastDayOfPrevMonth.getMonth(), 1)

    // Current month transactions
    const currentMonthQuery = query(
      transactionsRef,
      where("userId", "==", user.uid),
      where("date", ">=", firstDayOfMonth),
    )

    const currentMonthSnapshot = await getDocs(currentMonthQuery)
    const currentMonthTransactions = currentMonthSnapshot.docs.map((doc) => ({
      ...(doc.data() as Transaction),
    }))

    // Previous month transactions
    const prevMonthQuery = query(
      transactionsRef,
      where("userId", "==", user.uid),
      where("date", ">=", firstDayOfPrevMonth),
      where("date", "<", firstDayOfMonth),
    )

    const prevMonthSnapshot = await getDocs(prevMonthQuery)
    const prevMonthTransactions = prevMonthSnapshot.docs.map((doc) => ({
      ...(doc.data() as Transaction),
    }))

    // Calculate totals
    const currentIncome = currentMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)

    const currentExpenses = currentMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)

    const prevIncome = prevMonthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const prevExpenses = prevMonthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    const totalBalance = currentIncome - currentExpenses
    const prevBalance = prevIncome - prevExpenses

    // Calculate trends
    const incomeTrendPercentage = prevIncome === 0 ? 100 : Math.round(((currentIncome - prevIncome) / prevIncome) * 100)

    const expenseTrendPercentage =
      prevExpenses === 0 ? 0 : Math.round(((currentExpenses - prevExpenses) / prevExpenses) * 100)

    const balanceTrendPercentage =
      prevBalance === 0 ? 100 : Math.round(((totalBalance - prevBalance) / Math.abs(prevBalance)) * 100)

    // Get income data for chart (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const incomeData = []

    for (let i = 0; i < 6; i++) {
      const month = new Date()
      month.setMonth(month.getMonth() - i)

      const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
      const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0)

      const monthlyIncomeQuery = query(
        transactionsRef,
        where("userId", "==", user.uid),
        where("type", "==", "income"),
        where("date", ">=", firstDay),
        where("date", "<=", lastDay),
      )

      const monthlyIncomeSnapshot = await getDocs(monthlyIncomeQuery)
      const monthlyIncome = monthlyIncomeSnapshot.docs.reduce((sum, doc) => sum + (doc.data() as Transaction).amount, 0)

      incomeData.unshift({
        name: monthNames[month.getMonth()],
        value: monthlyIncome,
      })
    }

    // Get expense categories for pie chart
    const expenseCategoriesMap = new Map<string, number>()

    currentMonthTransactions
      .filter((t) => t.type === "expense")
      .forEach((transaction) => {
        const current = expenseCategoriesMap.get(transaction.category) || 0
        expenseCategoriesMap.set(transaction.category, current + transaction.amount)
      })

    const colors = ["#0ea5e9", "#22c55e", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899"]

    const expenseData = Array.from(expenseCategoriesMap.entries()).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }))

    // Calculate savings (this would typically come from a separate collection)
    // For demo, we'll use a simple formula
    const totalSavings = totalBalance > 0 ? totalBalance * 0.8 : 0
    const prevSavings = prevBalance > 0 ? prevBalance * 0.8 : 0
    const savingsTrendPercentage =
      prevSavings === 0 ? 100 : Math.round(((totalSavings - prevSavings) / prevSavings) * 100)

    return {
      totalBalance,
      balanceTrend: balanceTrendPercentage >= 0 ? "up" : "down",
      balanceTrendPercentage: Math.abs(balanceTrendPercentage),

      totalIncome: currentIncome,
      incomeTrendPercentage: Math.abs(incomeTrendPercentage),

      totalExpenses: currentExpenses,
      expenseTrendPercentage: Math.abs(expenseTrendPercentage),

      totalSavings,
      savingsTrend: savingsTrendPercentage >= 0 ? "up" : "down",
      savingsTrendPercentage: Math.abs(savingsTrendPercentage),

      incomeData,
      expenseData,
      budgets,
      recentTransactions: transactions,
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    throw error
  }
}

// Add a new transaction
export async function addTransaction(transactionData: Omit<Transaction, "id" | "userId" | "createdAt">) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const transactionsRef = collection(db, "transactions")
    const newTransaction = {
      ...transactionData,
      userId: user.uid,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(transactionsRef, newTransaction)

    // If this is an expense, update the corresponding budget
    if (transactionData.type === "expense") {
      await updateBudgetSpent(transactionData.category, transactionData.amount)
    }

    return { id: docRef.id, ...newTransaction }
  } catch (error) {
    console.error("Error adding transaction:", error)
    throw error
  }
}

// Update budget spent amount
async function updateBudgetSpent(category: string, amount: number) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    // Find the budget for this category
    const budgetsRef = collection(db, "budgets")
    const budgetQuery = query(
      budgetsRef,
      where("userId", "==", user.uid),
      where("category", "==", category),
      where("period", "==", "monthly"),
    )

    const budgetSnapshot = await getDocs(budgetQuery)

    if (!budgetSnapshot.empty) {
      const budgetDoc = budgetSnapshot.docs[0]
      const budget = budgetDoc.data() as Budget

      // Update the spent amount
      await updateDoc(doc(db, "budgets", budgetDoc.id), {
        spent: budget.spent + amount,
      })
    }
  } catch (error) {
    console.error("Error updating budget spent:", error)
    throw error
  }
}

// Add a new budget
export async function addBudget(budgetData: Omit<Budget, "id" | "userId" | "createdAt" | "spent">) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const budgetsRef = collection(db, "budgets")
    const newBudget = {
      ...budgetData,
      spent: 0, // Initialize spent to 0
      userId: user.uid,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(budgetsRef, newBudget)
    return { id: docRef.id, ...newBudget }
  } catch (error) {
    console.error("Error adding budget:", error)
    throw error
  }
}

// Get all transactions with pagination
export async function getTransactions(page = 1, pageSize = 20) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const transactionsRef = collection(db, "transactions")
    const transactionsQuery = query(
      transactionsRef,
      where("userId", "==", user.uid),
      orderBy("date", "desc"),
      limit(pageSize),
    )

    const transactionsSnapshot = await getDocs(transactionsQuery)
    const transactions = transactionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Transaction, "id">),
    }))

    return transactions
  } catch (error) {
    console.error("Error getting transactions:", error)
    throw error
  }
}

// Get all budgets
export async function getBudgets() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const budgetsRef = collection(db, "budgets")
    const budgetsQuery = query(budgetsRef, where("userId", "==", user.uid), orderBy("category"))

    const budgetsSnapshot = await getDocs(budgetsQuery)
    const budgets = budgetsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Budget, "id">),
    }))

    return budgets
  } catch (error) {
    console.error("Error getting budgets:", error)
    throw error
  }
}

// Initialize default data for new users
export async function initializeUserData() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    // Check if user already has data
    const transactionsRef = collection(db, "transactions")
    const transactionsQuery = query(transactionsRef, where("userId", "==", user.uid), limit(1))

    const transactionsSnapshot = await getDocs(transactionsQuery)

    // If user already has transactions, don't initialize
    if (!transactionsSnapshot.empty) {
      return
    }

    // Create default budgets
    // const defaultBudgets = [
    //   { category: "Housing", total: 1500, period: "monthly", icon: "home" },
    //   { category: "Food", total: 500, period: "monthly", icon: "coffee" },
    //   { category: "Transportation", total: 350, period: "monthly", icon: "car" },
    //   { category: "Utilities", total: 200, period: "monthly", icon: "wifi" },
    //   { category: "Shopping", total: 300, period: "monthly", icon: "shopping" },
    // ]

    // for (const budget of defaultBudgets) {
    //   await addBudget(budget as Omit<Budget, "id" | "userId" | "createdAt" | "spent">)
    // }

    // // Create sample transactions
    // const today = new Date()
    // const lastMonth = new Date(today)
    // lastMonth.setMonth(lastMonth.getMonth() - 1)

    // const sampleTransactions = [
    //   {
    //     title: "Salary",
    //     amount: 5000,
    //     date: today,
    //     category: "Income",
    //     type: "income" as const,
    //     notes: "Monthly salary",
    //   },
    //   {
    //     title: "Rent",
    //     amount: 1200,
    //     date: today,
    //     category: "Housing",
    //     type: "expense" as const,
    //   },
    //   {
    //     title: "Grocery Shopping",
    //     amount: 150,
    //     date: today,
    //     category: "Food",
    //     type: "expense" as const,
    //   },
    //   {
    //     title: "Gas",
    //     amount: 45,
    //     date: today,
    //     category: "Transportation",
    //     type: "expense" as const,
    //   },
    //   {
    //     title: "Internet Bill",
    //     amount: 80,
    //     date: today,
    //     category: "Utilities",
    //     type: "expense" as const,
    //   },
    //   {
    //     title: "Previous Salary",
    //     amount: 4800,
    //     date: lastMonth,
    //     category: "Income",
    //     type: "income" as const,
    //   },
    // ]

    // for (const transaction of sampleTransactions) {
    //   await addTransaction(transaction as Omit<Transaction, "id" | "userId" | "createdAt">)
    // }
  } catch (error) {
    console.error("Error initializing user data:", error)
    throw error
  }
}