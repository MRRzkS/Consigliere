export const formatCurrency = (amount: number, compact: boolean = false): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        notation: compact ? 'compact' : 'standard',
    }).format(amount)
}
