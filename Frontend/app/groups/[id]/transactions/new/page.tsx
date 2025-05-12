"use client"

import type React from "react"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeftCircle } from "lucide-react"
import type { Member } from "@/types/member"

export default function NewTransactionPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = Number(params.id)

  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [paidBy, setPaidBy] = useState("")
  const [splitType, setSplitType] = useState("equal")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock members data - in a real app, fetch this from your API
  const members: Member[] = [
    { id: 1, name: "You", balance: 0 },
    { id: 2, name: "John", balance: 0 },
    { id: 3, name: "Sarah", balance: 0 },
    { id: 4, name: "Mike", balance: 0 },
  ]

  // Mock state for split values
  const [percentages, setPercentages] = useState<Record<number, string>>({})
  const [amounts, setAmounts] = useState<Record<number, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !amount || !paidBy) return

    setIsSubmitting(true)

    try {
      // In a real app, this would call your ASP.NET Core API with the appropriate split data
      // const response = await fetch(`/api/groups/${groupId}/transactions`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     title,
      //     amount: parseFloat(amount),
      //     paidBy,
      //     splitType,
      //     splitDetails: splitType === 'percentage' ? percentages :
      //                   splitType === 'dynamic' ? amounts : null
      //   })
      // })

      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Redirect to the group page
      router.push(`/groups/${groupId}`)
    } catch (error) {
      console.error("Failed to create transaction:", error)
      setIsSubmitting(false)
    }
  }

  const handlePercentageChange = (memberId: number, value: string) => {
    setPercentages({
      ...percentages,
      [memberId]: value,
    })
  }

  const handleAmountChange = (memberId: number, value: string) => {
    setAmounts({
      ...amounts,
      [memberId]: value,
    })
  }

  return (
    <div className="container max-w-2xl py-10 mx-auto px-4">
      <Link
        href={`/groups/${groupId}`}
        className="text-muted-foreground hover:text-foreground inline-flex items-center mb-6"
      >
        <ArrowLeftCircle className="mr-2 h-4 w-4" />
        Back to Group
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Add New Expense</CardTitle>
          <CardDescription>Record a new expense for your group.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Expense Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Dinner, Groceries, Movie tickets"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Total Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paidBy">Paid By</Label>
                <Select value={paidBy} onValueChange={setPaidBy} required>
                  <SelectTrigger id="paidBy">
                    <SelectValue placeholder="Select who paid" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.name}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <Label>How to Split</Label>
              <Tabs value={splitType} onValueChange={setSplitType} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="equal">Equal</TabsTrigger>
                  <TabsTrigger value="percentage">Percentage</TabsTrigger>
                  <TabsTrigger value="dynamic">Dynamic</TabsTrigger>
                </TabsList>

                <TabsContent value="equal" className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    The total amount will be split equally among all members.
                  </p>
                  {amount && (
                    <div className="mt-4 p-4 bg-muted rounded-md">
                      <p className="font-medium">
                        Each person pays: {formatCurrency(Number.parseFloat(amount) / members.length)}
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="percentage" className="pt-4">
                  <p className="text-sm text-muted-foreground mb-4">Specify what percentage each person should pay.</p>
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center gap-4">
                        <Label className="w-24">{member.name}</Label>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="0"
                              value={percentages[member.id] || ""}
                              onChange={(e) => handlePercentageChange(member.id, e.target.value)}
                            />
                            <span className="ml-2">%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="dynamic" className="pt-4">
                  <p className="text-sm text-muted-foreground mb-4">Specify the exact amount each person should pay.</p>
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center gap-4">
                        <Label className="w-24">{member.name}</Label>
                        <div className="flex-1">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={amounts[member.id] || ""}
                            onChange={(e) => handleAmountChange(member.id, e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push(`/groups/${groupId}`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim() || !amount || !paidBy}>
              {isSubmitting ? "Adding..." : "Add Expense"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}
