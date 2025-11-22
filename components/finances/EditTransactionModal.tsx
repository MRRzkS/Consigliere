"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore, Transaction } from "@/store/useStore"
import { createClient } from "@/utils/supabase/client"

interface EditTransactionModalProps {
    transaction: Transaction | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditTransactionModal({ transaction, open, onOpenChange }: EditTransactionModalProps) {
    const { setTransactions, transactions } = useStore()
    const [loading, setLoading] = useState(false)
    const supabase = createClient()
    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        type: "Expense",
        category: "Business",
        date: "",
    })

    useEffect(() => {
        if (transaction) {
            setFormData({
                description: transaction.description,
                amount: transaction.amount.toString(),
                type: transaction.type,
                category: transaction.category,
                date: new Date(transaction.date).toISOString().split('T')[0],
            })
        }
    }, [transaction])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!transaction) return
        setLoading(true)

        try {
            const { error } = await supabase
                .from('transactions')
                .update({
                    description: formData.description,
                    amount: parseFloat(formData.amount),
                    type: formData.type,
                    category: formData.category,
                    date: formData.date,
                })
                .eq('id', transaction.id)

            if (error) throw error

            const updatedTransactions = transactions.map(t =>
                t.id === transaction.id
                    ? { ...t, ...formData, amount: parseFloat(formData.amount), type: formData.type as "Income" | "Expense", category: formData.category as "Business" | "Personal" }
                    : t
            )
            setTransactions(updatedTransactions)
            onOpenChange(false)
        } catch (error) {
            console.error('Error updating transaction:', error)
            alert('Failed to update transaction')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Transaction</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-desc" className="text-right">
                            Description
                        </Label>
                        <Input
                            id="edit-desc"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-amount" className="text-right">
                            Amount
                        </Label>
                        <Input
                            id="edit-amount"
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-type" className="text-right">
                            Type
                        </Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData({ ...formData, type: value })}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Income">Income</SelectItem>
                                <SelectItem value="Expense">Expense</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-category" className="text-right">
                            Category
                        </Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Business">Business</SelectItem>
                                <SelectItem value="Personal">Personal</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-date" className="text-right">
                            Date
                        </Label>
                        <Input
                            id="edit-date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
