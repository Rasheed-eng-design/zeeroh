import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { approveEvent, rejectEvent } from "@/lib/actions/events"
import { formatDate, formatPrice } from "@/lib/utils"
import { Users, Calendar, Ticket, TrendingUp, CheckCircle, XCircle } from "lucide-react"

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/")
  }

  // Get stats
  const totalUsers = await prisma.user.count()
  const totalEvents = await prisma.event.count()
  const totalTickets = await prisma.ticket.count()
  const pendingEvents = await prisma.event.count({ where: { status: "PENDING" } })

  const totalRevenue = await prisma.transaction.aggregate({
    where: { status: "SUCCESS" },
    _sum: { amount: true }
  })

  // Get recent events
  const recentEvents = await prisma.event.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      organizer: { select: { name: true, email: true } },
      ticketTypes: { select: { price: true } }
    }
  })

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage platform settings and monitor activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
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
            <div className="text-2xl font-bold">
              {formatPrice(totalRevenue._sum.amount || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingEvents}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Events */}
      <h2 className="text-xl font-semibold mb-4">Events Pending Approval</h2>

      {recentEvents.filter(e => e.status === "PENDING").length === 0 ? (
        <Card className="mb-8">
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No events pending approval.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 mb-8">
          {recentEvents.filter(e => e.status === "PENDING").map((event) => (
            <Card key={event.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{event.title}</h3>
                      <Badge variant="warning">{event.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {formatDate(event.date)} • {event.venue}
                    </p>
                    <p className="text-sm text-gray-600">
                      Organized by {event.organizer.name} ({event.organizer.email})
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <form action={async () => {
                      "use server"
                      await approveEvent(event.id)
                    }}>
                      <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </form>
                    <form action={async () => {
                      "use server"
                      await rejectEvent(event.id)
                    }}>
                      <Button type="submit" variant="destructive" size="sm">
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* All Events */}
      <h2 className="text-xl font-semibold mb-4">Recent Events</h2>
      <div className="space-y-4">
        {recentEvents.map((event) => (
          <Card key={event.id}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    <Badge variant={event.status === "APPROVED" ? "success" : event.status === "REJECTED" ? "destructive" : "warning"}>
                      {event.status}
                    </Badge>
                    {event.featured && (
                      <Badge variant="default">Featured</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatDate(event.date)} • {event.venue} • {event.organizer.name}
                  </p>
                </div>
                <Link href={`/events/${event.id}`}>
                  <Button variant="outline" size="sm">View</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
