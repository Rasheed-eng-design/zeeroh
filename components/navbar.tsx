"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Ticket, Menu, X } from "lucide-react"
import { useState } from "react"

export function Navbar() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isOrganizer = session?.user?.role === "ORGANIZER"
  const isAdmin = session?.user?.role === "ADMIN"

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <Link href="/" className="flex items-center gap-2">
              <Ticket className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Zeeroh</span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link
                href="/events"
                className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-900 hover:border-primary"
              >
                Events
              </Link>
              {isOrganizer && (
                <Link
                  href="/organizer"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-900 hover:border-primary"
                >
                  Organizer Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-900 hover:border-primary"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {status === "loading" ? (
              <div className="h-9 w-20 animate-pulse rounded bg-gray-200" />
            ) : session ? (
              <>
                <span className="text-sm text-gray-700">
                  {session.user?.name}
                </span>
                <Button
                  variant="outline"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="space-y-1 pb-3 pt-2">
            <Link
              href="/events"
              className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-900 hover:border-primary hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Events
            </Link>
            {isOrganizer && (
              <Link
                href="/organizer"
                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-900 hover:border-primary hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Organizer Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-900 hover:border-primary hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}
          </div>
          <div className="border-t border-gray-200 pb-3 pt-4">
            {session ? (
              <div className="space-y-1 px-4">
                <p className="text-base font-medium text-gray-900">
                  {session.user?.name}
                </p>
                <button
                  onClick={() => {
                    signOut({ callbackUrl: "/" })
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left py-2 text-base font-medium text-gray-500 hover:text-gray-900"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2 px-4">
                <Link
                  href="/login"
                  className="block text-center rounded-md border border-gray-300 px-4 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block text-center rounded-md bg-primary px-4 py-2 text-base font-medium text-white hover:bg-primary/90"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
