import { getEvents } from "@/lib/actions/events"
import { EventCard } from "@/components/events/event-card"
import { EventFilters } from "@/components/events/event-filters"

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { category?: string; city?: string; date?: string }
}) {
  const { events, error } = await getEvents(searchParams)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Discover Events</h1>
        <p className="mt-2 text-gray-600">
          Find the best events happening near you
        </p>
      </div>

      <EventFilters />

      {error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      ) : events?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No events found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {events?.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
