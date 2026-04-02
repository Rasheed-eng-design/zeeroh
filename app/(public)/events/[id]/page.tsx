import { getEventById } from "@/lib/actions/events"
import { notFound } from "next/navigation"
import { EventDetails } from "@/components/events/event-details"
import { formatDate, formatPrice } from "@/lib/utils"
import { Calendar, MapPin, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EventPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: EventPageProps) {
  const { event } = await getEventById(params.id)

  if (!event) {
    return {
      title: "Event Not Found | Zeeroh",
    }
  }

  return {
    title: `${event.title} | Zeeroh`,
    description: event.description.slice(0, 160),
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const { event, error } = await getEventById(params.id)

  if (error || !event) {
    notFound()
  }

  const lowestPrice = event.ticketTypes.length > 0 
    ? Math.min(...event.ticketTypes.map(t => parseFloat(t.price.toString())))
    : 0

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Event Header */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary">{event.category}</Badge>
          {event.featured && (
            <Badge variant="default">Featured</Badge>
          )}
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
        <div className="flex flex-wrap gap-6 text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <span>{event.venue}{event.city ? `, ${event.city}` : ""}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <span>Organized by {event.organizer.name}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {event.bannerUrl && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={event.bannerUrl}
                alt={event.title}
                className="w-full h-64 md:h-96 object-cover"
              />
            </div>
          )}

          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold mb-4">About This Event</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
          </div>

          {event.isVirtual && (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Virtual Event</h3>
              <p className="text-blue-700">
                This is a virtual event. Access details will be sent to your email after registration.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar - Ticket Purchase */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Get Tickets</h2>

            {event.ticketTypes.length === 0 ? (
              <p className="text-gray-500">No tickets available for this event.</p>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">Starting from</p>
                  <p className="text-3xl font-bold text-primary">
                    {formatPrice(lowestPrice)}
                  </p>
                </div>

                <EventDetails event={event} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
