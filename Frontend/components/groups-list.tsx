"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Group } from "@/types/group"

interface GroupsListProps {
  yourName: string
}

export default function GroupsList({ yourName }: GroupsListProps) {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/group")
        if (!res.ok) throw new Error("Failed to fetch groups")
        const data = await res.json()
        setGroups(data)
      } catch (err) {
        console.error("Failed to load groups:", err)
      } finally {
        setLoading(false)
      }
    }

    if (yourName) {
      fetchGroups()
    } else {
      setLoading(false)
    }
  }, [yourName])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">Loading...</CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!yourName) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">Please set your name to view your groups</p>
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">You don't have any groups yet</p>
        <Link href="/groups/new">
          <Button>Create your first group</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <Link href={`/groups/${group.id}`} key={group.id}>
          <Card className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-4 flex justify-between items-center">
              <h3 className="font-medium">{group.title}</h3>
              <Badge variant={group.balance === 0 ? "outline" : group.balance > 0 ? "success" : "destructive"}>
                {group.balance > 0
                  ? `You are owed ${formatCurrency(group.balance)}`
                  : group.balance < 0
                  ? `You owe ${formatCurrency(Math.abs(group.balance))}`
                  : `Settled`}
              </Badge>
            </CardContent>
          </Card>
        </Link>
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
