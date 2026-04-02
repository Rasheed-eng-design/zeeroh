import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Ticket, Calendar, Shield, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/10 to-background pb-16 pt-20 lg:pb-24 lg:pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Discover & Book
              <span className="text-primary"> Amazing Events</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              The easiest way to find and book tickets for events in Nigeria. 
              From concerts to conferences, we&apos;ve got you covered.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/events">
                <Button size="lg" className="text-lg px-8">
                  Browse Events
                </Button>
              </Link>
              <Link href="/register?role=ORGANIZER">
                <Button variant="outline" size="lg" className="text-lg px-8">
                  Create Event
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Why Choose Zeeroh?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              The most trusted event ticketing platform in Nigeria
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Ticket className="h-8 w-8 text-primary" />}
              title="Easy Ticketing"
              description="Book tickets in seconds with our streamlined checkout process"
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-primary" />}
              title="Secure Payments"
              description="Pay with confidence using Paystack's secure payment gateway"
            />
            <FeatureCard
              icon={<Calendar className="h-8 w-8 text-primary" />}
              title="Digital Tickets"
              description="Receive QR code tickets instantly via email and WhatsApp"
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8 text-primary" />}
              title="Instant Delivery"
              description="Get your tickets delivered instantly after payment confirmation"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to host your own event?
          </h2>
          <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of event organizers using Zeeroh to sell tickets and manage their events
          </p>
          <Link href="/register?role=ORGANIZER">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Become an Organizer
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-lg border border-gray-200 hover:border-primary/50 transition-colors">
      <div className="mb-4 p-3 bg-primary/10 rounded-full">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
