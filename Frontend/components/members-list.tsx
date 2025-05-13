"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { Member } from "@/types/member"
import SettleUpDialog from "@/components/settle-up-dialog"
import { userApi } from "@/services/api-client"

interface MembersListProps {
  members: Member[]
  onSettleUp: (memberId: number, amount: number) => void
  onRemoveMember: (memberId: number) => void
}


export default function MembersList({ members, onSettleUp, onRemoveMember }: MembersListProps) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isSettleUpOpen, setIsSettleUpOpen] = useState(false)
  const [userName, setUserName] = useState("")

  // Get the user's name when the component mounts
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const name = await userApi.getUserName()
        setUserName(name)
      } catch (error) {
        console.error("Failed to fetch user name:", error)
      }
    }

    fetchUserName()
  }, [])

  const handleSettleUpClick = (member: Member) => {
    setSelectedMember(member)
    setIsSettleUpOpen(true)
  }

  return (
    <div className="space-y-3">
      {members.map((member) => {
        const isCurrentUser = member.name === userName
        const canSettle = isCurrentUser && member.balance < 0

        return (
          <div key={member.id} className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <p className="font-medium">{isCurrentUser ? "You" : member.name}</p>
              {member.balance !== 0 && (
                <p className="text-sm text-muted-foreground">
                  {member.balance > 0
                    ? `${member.name === userName ? "You are owed" : "Owes you"} ${formatCurrency(member.balance)}`
                    : member.balance < 0
                    ? `${member.name === userName ? "You owe" : "Owes"} ${formatCurrency(Math.abs(member.balance))}`
                    : member.name === userName
                    ? "You owe nothing"
                    : "Settled up"}
                </p>
              )}
              {member.balance === 0 && <p className="text-sm text-muted-foreground">Settled up</p>}
            </div>

            <div className="flex items-center gap-2">
              {member.balance !== 0 && (
                <Button
                  onClick={() => handleSettleUpClick(member)}
                  disabled={!canSettle}
                  title={
                    !isCurrentUser
                      ? "Only the person who owes can settle"
                      : member.balance >= 0
                      ? "You don’t owe anything"
                      : ""
                  }
                >
                  Settle Up
                </Button>
              )}
                <Button
                  variant="destructive"
                  onClick={() => onRemoveMember(member.id)}
                  disabled={member.balance !== 0}
                  title={member.balance !== 0 ? "Cannot remove member with unsettled balance" : ""}
                >
                  Remove
                </Button>
            </div>
          </div>
        )
      })}
      <SettleUpDialog
        open={isSettleUpOpen}
        onOpenChange={setIsSettleUpOpen}
        member={selectedMember}
        onSettleUp={onSettleUp}
      />
    </div>
  )
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}
