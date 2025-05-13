"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { userApi } from "@/services/api-client"

export default function NewTransactionPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = Number(params.id)

  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [paidBy, setPaidBy] = useState("")
  const [splitType, setSplitType] = useState("equal")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [userName, setUserName] = useState("")
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  // Fetch the user's name when the component mounts
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const name = await userApi.getUserName()
        setUserName(name)
      } catch (error) {
        console.error("Failed to fetch user name:", error)
      } finally {
        setIsLoadingUser(false)
      }
    }

    fetchUserName()
  }, [])

  useEffect(() => {
  const fetchMembers = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/group/${groupId}`);
      if (!response.ok) throw new Error("Failed to fetch group");

      const data = await response.json();
      setMembers(data.members || []);
    } catch (error) {
      console.error("Error loading members:", error);
    }
  };

  if (groupId) fetchMembers();
}, [groupId]);

  // Mock state for split values
  const [percentages, setPercentages] = useState<Record<number, string>>({})
  const [amounts, setAmounts] = useState<Record<number, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!title.trim() || !amount || !paidBy) return

  // Check if user has set their name
    if (!userName) {
      alert("Please set your name before creating a transaction")
      router.push("/")
      return
    }

  setIsSubmitting(true)

  try {
    const payload = {
      title,
      amount: parseFloat(amount),
      paidBy,
      splitType,
      splitDetails:
        splitType === "percentage"
          ? Object.fromEntries(Object.entries(percentages).map(([id, val]) => [parseInt(id), parseFloat(val)]))
          : splitType === "dynamic"
          ? Object.fromEntries(Object.entries(amounts).map(([id, val]) => [parseInt(id), parseFloat(val)]))
          : null
    }

    const response = await fetch(`http://localhost:5000/api/group/${groupId}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) throw new Error("Failed to create transaction")

    router.push(`/groups/${groupId}`)
    } catch (error) {
      console.error("Failed to create transaction:", error)
      alert("Failed to add expense.")
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

  const isPercentageValid = () => {
  if (splitType !== "percentage") return true
  const total = Object.values(percentages).reduce((sum, val) => sum + parseFloat(val || "0"), 0)
  return Math.abs(total - 100) < 0.01
  }

const isDynamicValid = () => {
  if (splitType !== "dynamic") return true
  const totalSplit = Object.values(amounts).reduce((sum, val) => sum + parseFloat(val || "0"), 0)
  return Math.abs(totalSplit - parseFloat(amount || "0")) < 0.01
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
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !title.trim() ||
                !amount ||
                !paidBy ||
                isLoadingUser ||
                !userName ||
                !isPercentageValid() ||
                !isDynamicValid()
                }
              >
              {isSubmitting ? "Adding..." : "Add Expense"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}


function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("lt-LT", {
    style: "currency",
    currency: "EUR",
  }).format(amount)
}
