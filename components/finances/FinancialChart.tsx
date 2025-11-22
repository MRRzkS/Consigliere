"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FinancialChartProps {
    data: {
        name: string
        income: number
        expense: number
    }[]
}

export function FinancialChart({ data }: FinancialChartProps) {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `Rp${value}`}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)}
                        />
                        <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                        <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expense" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
