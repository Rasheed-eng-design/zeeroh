"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Search, Filter } from "lucide-react"

export function EventFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [category, setCategory] = useState(searchParams.get("category") || "")
  const [city, setCity] = useState(searchParams.get("city") || "")
  const [date, setDate] = useState(searchParams.get("date") || "")

  const handleFilter = () => {
    const params = new URLSearchParams()
    if (category) params.set("category", category)
    if (city) params.set("city", city)
    if (date) params.set("date", date)

    router.push(`/events?${params.toString()}`)
  }

  const handleClear = () => {
    setCategory("")
    setCity("")
    setDate("")
    router.push("/events")
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5" />
        <h3 className="font-medium">Filter Events</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Category (e.g., Music, Sports)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <Input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <div className="flex gap-2">
          <Button onClick={handleFilter} className="flex-1">
            <Search className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
        </div>
      </div>
    </div>
  )
}
