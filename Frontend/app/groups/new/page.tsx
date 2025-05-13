"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeftCircle } from "lucide-react"
import { userApi } from "@/services/api-client"

export default function NewGroupPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!title.trim()) return;

  // Check if user has set their name
    if (!userName) {
      alert("Please set your name before creating a group")
      router.push("/")
      return
    }

  setIsSubmitting(true);

  try {
    const response = await fetch("http://localhost:5000/api/group", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      throw new Error("Failed to create group");
    }

    // Redirect to group list after success
    router.push("/")
  } catch (error) {
    console.error("Failed to create group:", error);
    setIsSubmitting(false);
  }
};


  return (
    <div className="container max-w-md py-10 mx-auto px-4">
      <Link href="/" className="text-muted-foreground hover:text-foreground inline-flex items-center mb-6">
        <ArrowLeftCircle className="mr-2 h-4 w-4" />
        Back to Groups
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create a New Group</CardTitle>
          <CardDescription>
            Create a group to start tracking expenses with friends, roommates, or colleagues.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="title">Group Name</Label>
                <Input
                  id="title"
                  placeholder="e.g., Roommates, Trip to Paris, Office Lunch"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push("/")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim() || isLoadingUser || !userName}>
              {isSubmitting ? "Creating..." : "Create Group"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
