"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { Member } from "@/types/member"
import SettleUpDialog from "@/components/settle-up-dialog"

interface MembersListProps {
  members: Member[]
  onSettleUp: (memberId: number, amount: number) => void
  onRemoveMember: (memberId: number) => void
}


export default function MembersList({ members, onSettleUp, onRemoveMember }: MembersListProps) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isSettleUpOpen, setIsSettleUpOpen] = useState(false)

  const handleSettleUpClick = (member: Member) => {
    setSelectedMember(member)
    setIsSettleUpOpen(true)
  }

  return (
    <div className="space-y-3">
      {members.map((member) => (
        <div key={member.id} className="flex items-center justify-between py-3 border-b last:border-0">
          <div>
            <p className="font-medium">{member.name}</p>
            {member.balance !== 0 && (
              <p className="text-sm text-muted-foreground">
                {member.balance > 0
                  ? `Owes you ${formatCurrency(member.balance)}`
                  : `You owe ${formatCurrency(Math.abs(member.balance))}`}
              </p>
            )}
            {member.balance === 0 && <p className="text-sm text-muted-foreground">Settled up</p>}
            </div>

            <div className="flex items-center gap-2">
            {member.balance !== 0 && (
              <Button
              onClick={() => handleSettleUpClick(member)}
              disabled={member.balance >= 0}
              title={member.balance > 0 ? "You are owed money — nothing to settle" : ""}
              >
                Settle Up
              </Button>
            )}

            {member.name !== "You" && (
              <Button
                variant="destructive"
                onClick={() => onRemoveMember(member.id)}
                disabled={member.balance !== 0}
                title={member.balance !== 0 ? "Cannot remove member with unsettled balance" : ""}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      ))}
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
