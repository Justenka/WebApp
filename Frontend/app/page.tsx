import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import GroupsList from "@/components/groups-list"

export default function HomePage() {
  return (
    <div className="container max-w-4xl py-10 mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Groups</h1>
        <Link href="/groups/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </Link>
      </div>
      <GroupsList />
    </div>
  )
}
