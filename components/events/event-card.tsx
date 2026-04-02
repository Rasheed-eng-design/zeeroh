import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatPrice } from "@/lib/utils"
import { Calendar, MapPin } from "lucide-react"

interface EventCardProps {
  event: {
    id: string
    title: string
    description: string
    date: Date
    venue: string
    city?: string | null
    category: string
    featured: boolean
    bannerUrl?: string | null
    organizer: { name: string }
    ticketTypes: { price: number }[]
  }
}

export function EventCard({ event }: EventCardProps) {
  const lowestPrice = event.ticketTypes.length > 0 
    ? Math.min(...event.ticketTypes.map(t => parseFloat(t.price.toString())))
    : 0

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
        {event.bannerUrl && (
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={event.bannerUrl}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              {event.category}
            </Badge>
            {event.featured && (
              <Badge variant="default" className="text-xs">
                Featured
              </Badge>
            )}
          </div>
          <h3 className="text-lg font-semibold line-clamp-2">{event.title}</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{event.venue}{event.city ? `, ${event.city}` : ""}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-lg font-bold text-primary">
              {lowestPrice > 0 ? `From ${formatPrice(lowestPrice)}` : "Free"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              by {event.organizer.name}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
