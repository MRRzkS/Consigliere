"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore } from "@/store/useStore"
import { createClient } from "@/utils/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function NewTransactionModal() {
    const { addTransaction } = useStore()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()
    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        type: "Expense",
        category: "Business",
        date: new Date().toISOString().split('T')[0],
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data, error } = await supabase
                .from('transactions')
                .insert([
                    {
                        description: formData.description,
                        amount: parseFloat(formData.amount),
                        type: formData.type,
                        category: formData.category,
                        date: formData.date,
                    },
                ])
                .select()

            if (error) throw error

            if (data) {
                const newTransaction = {
                    id: data[0].id,
                    description: data[0].description,
                    amount: data[0].amount,
                    type: data[0].type as 'Income' | 'Expense',
                    category: data[0].category as 'Business' | 'Personal',
                    date: data[0].date,
                }
                addTransaction(newTransaction)
                setOpen(false)
                setFormData({
                    description: "",
                    amount: "",
                    type: "Expense",
                    category: "Business",
                    date: new Date().toISOString().split('T')[0],
                })
            }
        } catch (error) {
            console.error('Error adding transaction:', error)
            alert('Failed to add transaction')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Add Transaction</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Transaction</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                            Description
                        </Label>
                        <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                            Amount
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
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
                        <Label htmlFor="category" className="text-right">
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
                                <SelectItem value="Tools">Tools</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                            Date
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Transaction"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
