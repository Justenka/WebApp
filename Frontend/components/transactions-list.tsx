import { Card, CardContent } from "@/components/ui/card"
import type { Transaction } from "@/types/transaction"

interface TransactionsListProps {
  transactions: Transaction[]
}

export default function TransactionsList({ transactions }: TransactionsListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No transactions yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <Card key={transaction.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{transaction.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(transaction.date).toISOString().slice(0, 10)} • Paid by {transaction.paidBy}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Split: {transaction.splitType}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(transaction.amount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}
