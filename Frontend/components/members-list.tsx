"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
        <div key={member.id} className="flex items-center justify-between py-2 border-b last:border-0">
          <div>
            <p className="font-medium">{member.name}</p>
          </div>

          <div className="flex items-center gap-2">
            {member.balance !== 0 && (
              <Badge variant={member.balance > 0 ? "success" : "destructive"}>
                {member.balance > 0
                  ? `Owes you ${formatCurrency(member.balance)}`
                  : `You owe ${formatCurrency(Math.abs(member.balance))}`}
              </Badge>
            )}
            {member.balance === 0 && <Badge variant="outline">Settled</Badge>}

            {member.balance !== 0 && (
              <Button variant="outline" size="sm" onClick={() => handleSettleUpClick(member)}>
                Settle Up
              </Button>
            )}

            {member.name !== "You" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveMember(member.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}

      {/* Import the SettleUpDialog at the top of the file */}
      {/* @ts-ignore - This will be fixed when we import the component */}
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
