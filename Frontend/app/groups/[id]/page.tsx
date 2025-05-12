"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, ArrowLeftCircle, UserPlus } from "lucide-react"
import type { Group } from "@/types/group"
import type { Member } from "@/types/member"
import type { Transaction } from "@/types/transaction"
import MembersList from "@/components/members-list"
import TransactionsList from "@/components/transactions-list"
import AddMemberDialog from "@/components/add-member-dialog"

export default function GroupPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = Number(params.id)

  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)

  useEffect(() => {
    // In a real app, this would fetch from your ASP.NET Core API
    const fetchGroupData = async () => {
      try {
        const groupRes = await fetch(`http://localhost:5000/api/group/${groupId}`);
        if (!groupRes.ok) throw new Error("Failed to fetch group");

        const groupData = await groupRes.json();
        setGroup(groupData);

        // Optional: If members and transactions are returned together
        setMembers(groupData.members || []);
        setTransactions(groupData.transactions || []);

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch group data:", error);
        setLoading(false);
      }
    };

    if (groupId) {
      fetchGroupData()
    }
  }, [groupId])

  const handleAddMember = async (name: string) => {
    const response = await fetch(`http://localhost:5000/api/group/${groupId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })

    if (response.ok) {
      const updatedGroup = await response.json()
      setMembers(updatedGroup.members)
      setIsAddMemberOpen(false)
    } else {
      console.error("Failed to add member")
    }
  }

  const handleRemoveMember = async (memberId: number) => {
    await fetch(`http://localhost:5000/api/group/${groupId}/members/${memberId}`, {
      method: "DELETE",
    })

    setMembers((prev) => prev.filter((m) => m.id !== memberId))
  }

  const handleSettleUp = async (memberId: number, amount: number) => {
    await fetch(`http://localhost:5000/api/group/${groupId}/settle/${memberId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(amount),
    })

    setMembers(members.map(m =>
      m.id === memberId
        ? { ...m, balance: m.balance > 0 ? Math.max(0, m.balance - amount) : Math.min(0, m.balance + amount) }
        : m
    ))
  }

  if (loading) {
    return (
      <div className="container max-w-4xl py-10">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-muted rounded mb-8"></div>
          <div className="h-32 bg-muted rounded mb-6"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="container max-w-4xl py-10 text-center">
        <h2 className="text-2xl font-bold mb-4">Group not found</h2>
        <Link href="/">
          <Button>
            <ArrowLeftCircle className="mr-2 h-4 w-4" />
            Back to Groups
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <Link href="/" className="text-muted-foreground hover:text-foreground inline-flex items-center mb-4">
          <ArrowLeftCircle className="mr-2 h-4 w-4" />
          Back to Groups
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{group.title}</h1>
          <Link href={`/groups/${groupId}/transactions/new`}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Members</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setIsAddMemberOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <MembersList members={members} onSettleUp={handleSettleUp} onRemoveMember={handleRemoveMember} />
        </CardContent>
      </Card>

      <Tabs defaultValue="transactions">
        <TabsList className="mb-4">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <TransactionsList transactions={transactions} />
        </TabsContent>

        <TabsContent value="balances">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Group Balances</h3>
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex justify-between items-center pb-2 border-b">
                    <span>{member.name}</span>
                    {member.balance !== 0 && (
                      <Badge variant={member.balance > 0 ? "success" : "destructive"}>
                        {member.balance > 0
                          ? `Owes you ${formatCurrency(member.balance)}`
                          : `You owe ${formatCurrency(Math.abs(member.balance))}`}
                      </Badge>
                    )}
                    {member.balance === 0 && <Badge variant="outline">Settled</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddMemberDialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen} onAddMember={handleAddMember} />
    </div>
  )
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}
