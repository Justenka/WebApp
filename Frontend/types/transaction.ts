export interface Transaction {
  id: number
  title: string
  amount: number
  paidBy: string
  date: Date
  splitType: string
}
