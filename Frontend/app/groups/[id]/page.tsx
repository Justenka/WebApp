"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, ArrowLeftCircle, UserPlus } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { Group } from "@/types/group"
import type { Member } from "@/types/member"
import type { Transaction } from "@/types/transaction"
import MembersList from "@/components/members-list"
import TransactionsList from "@/components/transactions-list"
import AddMemberDialog from "@/components/add-member-dialog"
import { userApi } from "@/services/api-client"


export default function GroupPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params?.id ? parseInt(params.id as string) : NaN;

  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [userName, setUserName] = useState("")

  useEffect(() => {
  const fetchData = async () => {
    try {
      const name = await userApi.getUserName()
      setUserName(name)

      if (!name) {
        alert("Please set your name first")
        router.push("/")
        return
      }

      const groupRes = await fetch(`http://localhost:5000/api/group/${groupId}`);
      if (!groupRes.ok) throw new Error("Failed to fetch group");

      const groupData = await groupRes.json();
      setGroup(groupData);
      setMembers(groupData.members || []);
      setTransactions(groupData.transactions || []);
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (groupId) {
      fetchData()
    }
  }, [groupId])

  const handleAddMember = async (name: string): Promise<boolean> => {
    try {
      const normalizedName = name.toLowerCase()
      const isDuplicate = members.some((member) => member.name.toLowerCase() === normalizedName)

      if (isDuplicate) {
        return false
      }

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
      return false
    }
      return true
    } catch (error) {
      console.error("Failed to add member:", error)
      return false
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
    });

    try {
      const groupRes = await fetch(`http://localhost:5000/api/group/${groupId}`);
      if (!groupRes.ok) throw new Error("Failed to refresh group data");
      const groupData = await groupRes.json();
      setGroup(groupData);
      setMembers(groupData.members || []);
      setTransactions(groupData.transactions || []);
    } catch (err) {
      console.error("Failed to refresh group after settle:", err);
    }
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
          {members.length === 0 ? (
            <Button disabled title="Add at least one member first">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
            ) : (
              <Link href={`/groups/${groupId}/transactions/new`}>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </Link>
            )}
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

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionsList transactions={transactions} />
        </CardContent>
      </Card>

      <AddMemberDialog
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
        onAddMember={handleAddMember}
        existingMembers={members}
      />
    </div>
  )
}
