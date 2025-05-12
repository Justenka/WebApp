"use client"

import { Button } from "@/components/ui/button"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { Group } from "@/types/group"

export default function GroupsList() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch from your ASP.NET Core API
    const fetchGroups = async () => {
      try {
        // Replace with actual API call
        // const response = await fetch('/api/groups')
        // const data = await response.json()

        // Mock data for demonstration
        const mockData: Group[] = [
          { id: 1, title: "Roommates", balance: 120.5 },
          { id: 2, title: "Trip to Barcelona", balance: -45.75 },
          { id: 3, title: "Office Lunch", balance: 0 },
        ]

        setTimeout(() => {
          setGroups(mockData)
          setLoading(false)
        }, 500)
      } catch (error) {
        console.error("Failed to fetch groups:", error)
        setLoading(false)
      }
    }

    fetchGroups()
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-[150px]" />
                <Skeleton className="h-6 w-[100px]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">You don&apos;t have any groups yet</p>
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
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">{group.title}</h3>
                {group.balance !== 0 && (
                  <Badge variant={group.balance > 0 ? "success" : "destructive"}>
                    {group.balance > 0
                      ? `You are owed ${formatCurrency(group.balance)}`
                      : `You owe ${formatCurrency(Math.abs(group.balance))}`}
                  </Badge>
                )}
                {group.balance === 0 && <Badge variant="outline">Settled</Badge>}
              </div>
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
