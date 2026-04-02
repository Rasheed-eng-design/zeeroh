import { getOrganizerEvents } from "@/lib/actions/events"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatPrice } from "@/lib/utils"
import { Calendar, Plus, Ticket, TrendingUp } from "lucide-react"

export default async function OrganizerDashboardPage() {
  const { events, error } = await getOrganizerEvents()

  // Calculate stats
  const totalEvents = events?.length || 0
  const totalTickets = events?.reduce((acc, event) => 
    acc + event.ticketTypes.reduce((sum, tt) => sum + tt.sold, 0), 0
  ) || 0
  const totalRevenue = events?.reduce((acc, event) => 
    acc + event.ticketTypes.reduce((sum, tt) => sum + (parseFloat(tt.price.toString()) * tt.sold), 0), 0
  ) || 0

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your events and track sales</p>
        </div>
        <Link href="/organizer/events/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTickets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <h2 className="text-xl font-semibold mb-4">Your Events</h2>

      {error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      ) : events?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">You haven&apos;t created any events yet.</p>
            <Link href="/organizer/events/create">
              <Button>Create Your First Event</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{event.title}</h3>
                      <Badge variant={event.status === "APPROVED" ? "success" : "warning"}>
                        {event.status}
                      </Badge>
                      {event.featured && (
                        <Badge variant="default">Featured</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {formatDate(event.date)} • {event.venue}
                    </p>
                    <div className="flex gap-4 text-sm">
                      <span>
                        <strong>{event._count.tickets}</strong> tickets sold
                      </span>
                      <span>
                        <strong>
                          {formatPrice(
                            event.ticketTypes.reduce(
                              (sum, tt) => sum + parseFloat(tt.price.toString()) * tt.sold,
                              0
                            )
                          )}
                        </strong>{" "}
                        revenue
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/events/${event.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
