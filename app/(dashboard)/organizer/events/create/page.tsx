"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createEvent } from "@/lib/actions/events"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

interface TicketType {
  name: string
  price: string
  quantity: string
  description: string
}

export default function CreateEventPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    { name: "", price: "", quantity: "", description: "" }
  ])

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { name: "", price: "", quantity: "", description: "" }])
  }

  const removeTicketType = (index: number) => {
    setTicketTypes(ticketTypes.filter((_, i) => i !== index))
  }

  const updateTicketType = (index: number, field: keyof TicketType, value: string) => {
    const updated = [...ticketTypes]
    updated[index][field] = value
    setTicketTypes(updated)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)

    ticketTypes.forEach((ticket, index) => {
      formData.append(`ticketTypes[${index}][name]`, ticket.name)
      formData.append(`ticketTypes[${index}][price]`, ticket.price)
      formData.append(`ticketTypes[${index}][quantity]`, ticket.quantity)
      formData.append(`ticketTypes[${index}][description]`, ticket.description)
    })

    try {
      const result = await createEvent(formData)
      if (result.error) {
        setError(result.error)
      } else {
        router.push("/organizer")
        router.refresh()
      }
    } catch (err) {
      setError("Failed to create event")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Event</h1>

      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input id="title" name="title" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" name="description" rows={4} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Event Date *</Label>
                  <Input id="date" name="date" type="datetime-local" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input id="endDate" name="endDate" type="datetime-local" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue">Venue *</Label>
                <Input id="venue" name="venue" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input id="category" name="category" placeholder="e.g., Music, Conference, Sports" required />
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="isVirtual" name="isVirtual" className="rounded border-gray-300" />
                <Label htmlFor="isVirtual">This is a virtual event</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bannerUrl">Banner Image URL</Label>
                <Input id="bannerUrl" name="bannerUrl" type="url" placeholder="https://example.com/image.jpg" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Ticket Types</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addTicketType}>
                <Plus className="h-4 w-4 mr-2" />
                Add Ticket Type
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticketTypes.map((ticket, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Ticket Type {index + 1}</h4>
                    {ticketTypes.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTicketType(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input
                        value={ticket.name}
                        onChange={(e) => updateTicketType(index, "name", e.target.value)}
                        placeholder="e.g., VIP, Regular"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price (₦) *</Label>
                      <Input
                        type="number"
                        value={ticket.price}
                        onChange={(e) => updateTicketType(index, "price", e.target.value)}
                        placeholder="0"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        value={ticket.quantity}
                        onChange={(e) => updateTicketType(index, "quantity", e.target.value)}
                        placeholder="100"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={ticket.description}
                      onChange={(e) => updateTicketType(index, "description", e.target.value)}
                      placeholder="What's included in this ticket?"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Event"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
