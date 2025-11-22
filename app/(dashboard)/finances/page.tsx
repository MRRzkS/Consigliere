"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useStore, Transaction } from "@/store/useStore"
import { ArrowUpRight, ArrowDownRight, Wallet, Pencil, Trash2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { NewTransactionModal } from "@/components/finances/NewTransactionModal"
import { EditTransactionModal } from "@/components/finances/EditTransactionModal"
import { FinancialChart } from "@/components/finances/FinancialChart"
import { format } from "date-fns"

export default function FinancesPage() {
    const { transactions, setTransactions } = useStore()
    const [loading, setLoading] = useState(true)
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const fetchTransactions = async () => {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false })

            if (data) {
                const mappedTransactions = data.map((t: any) => ({
                    id: t.id,
                    description: t.description,
                    amount: t.amount,
                    type: t.type as 'Income' | 'Expense',
                    category: t.category as 'Business' | 'Personal',
                    date: t.date,
                }))
                setTransactions(mappedTransactions)
            }
            setLoading(false)
        }

        fetchTransactions()
    }, [setTransactions])

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this transaction?")) return

        try {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id)

            if (error) throw error

            setTransactions(transactions.filter((t: Transaction) => t.id !== id))
        } catch (error) {
            console.error('Error deleting transaction:', error)
            alert('Failed to delete transaction')
        }
    }

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction)
        setIsEditOpen(true)
    }

    const totalIncome = transactions
        .filter((t: Transaction) => t.type === 'Income')
        .reduce((acc: number, curr: Transaction) => acc + Number(curr.amount), 0)

    const totalExpense = transactions
        .filter((t: Transaction) => t.type === 'Expense')
        .reduce((acc: number, curr: Transaction) => acc + Number(curr.amount), 0)

    const netProfit = totalIncome - totalExpense

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const thisMonthTransactions = transactions.filter((t: Transaction) => {
        const d = new Date(t.date)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })

    const incomeThisMonth = thisMonthTransactions
        .filter((t: Transaction) => t.type === 'Income')
        .reduce((acc: number, curr: Transaction) => acc + Number(curr.amount), 0)

    const expenseThisMonth = thisMonthTransactions
        .filter((t: Transaction) => t.type === 'Expense')
        .reduce((acc: number, curr: Transaction) => acc + Number(curr.amount), 0)

    const chartData = [
        {
            name: 'This Month',
            income: incomeThisMonth,
            expense: expenseThisMonth,
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">The Books</h1>
                <div className="flex items-center gap-2">
                    <NewTransactionModal />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                        <Wallet className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(netProfit)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            All time
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Income (This Month)</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(incomeThisMonth)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expenses (This Month)</CardTitle>
                        <ArrowDownRight className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(expenseThisMonth)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <FinancialChart data={chartData} />

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {transactions.slice(0, 5).map((transaction) => (
                                <div key={transaction.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${transaction.type === 'Income' ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                                            {transaction.type === 'Income' ? (
                                                <ArrowUpRight className={`h-4 w-4 ${transaction.type === 'Income' ? 'text-primary' : 'text-destructive'}`} />
                                            ) : (
                                                <ArrowDownRight className="h-4 w-4 text-destructive" />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">{transaction.description}</p>
                                            <p className="text-xs text-muted-foreground">{format(new Date(transaction.date), 'dd MMM yyyy')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className={`font-medium ${transaction.type === 'Income' ? 'text-primary' : 'text-destructive'}`}>
                                            {transaction.type === 'Income' ? '+' : '-'}
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(transaction.amount)}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                                                setEditingTransaction(transaction)
                                                setIsEditOpen(true)
                                            }}>
                                                <Pencil className="h-3 w-3" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={async () => {
                                                if (confirm("Delete transaction?")) {
                                                    const { error } = await supabase.from('transactions').delete().eq('id', transaction.id)
                                                    if (!error) {
                                                        const newTransactions = transactions.filter(t => t.id !== transaction.id)
                                                        setTransactions(newTransactions)
                                                    }
                                                }
                                            }}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <EditTransactionModal
                transaction={editingTransaction}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
            />
        </div>
    )
}


