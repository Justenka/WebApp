import type { Member } from "./member"

export interface Group {
  id: number
  title: string
  balance: number
  members: Member[]
}