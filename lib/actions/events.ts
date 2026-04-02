"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { z } from "zod"

const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  endDate: z.string().optional(),
  venue: z.string().min(3, "Venue is required"),
  isVirtual: z.boolean().default(false),
  category: z.string().min(1, "Category is required"),
  city: z.string().optional(),
  state: z.string().optional(),
  bannerUrl: z.string().optional(),
})

export async function createEvent(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ORGANIZER") {
      return { error: "Unauthorized" }
    }

    const rawData = Object.fromEntries(formData.entries())

    // Parse ticket types from form data
    const ticketTypes: any[] = []
    let i = 0
    while (formData.get(`ticketTypes[${i}][name]`)) {
      ticketTypes.push({
        name: formData.get(`ticketTypes[${i}][name]`),
        price: formData.get(`ticketTypes[${i}][price]`),
        quantity: formData.get(`ticketTypes[${i}][quantity]`),
        description: formData.get(`ticketTypes[${i}][description]`),
      })
      i++
    }

    const validatedData = eventSchema.parse({
      ...rawData,
      isVirtual: rawData.isVirtual === "on",
    })

    const event = await prisma.event.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        date: new Date(validatedData.date),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        venue: validatedData.venue,
        isVirtual: validatedData.isVirtual,
        category: validatedData.category,
        city: validatedData.city,
        state: validatedData.state,
        bannerUrl: validatedData.bannerUrl,
        status: "PENDING",
        organizerId: session.user.id,
        ticketTypes: {
          create: ticketTypes.map((tt) => ({
            name: tt.name as string,
            price: parseFloat(tt.price as string),
            quantity: parseInt(tt.quantity as string),
            description: (tt.description as string) || null,
          })),
        },
      },
      include: {
        ticketTypes: true,
      },
    })

    revalidatePath("/events")
    revalidatePath("/organizer/events")
    return { success: true, event }
  } catch (error) {
    console.error("Create event error:", error)
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Failed to create event" }
  }
}

export async function getEvents(filters?: { category?: string; city?: string; date?: string }) {
  try {
    const where: any = { status: "APPROVED" }

    if (filters?.category) {
      where.category = filters.category
    }

    if (filters?.city) {
      where.city = { contains: filters.city, mode: "insensitive" }
    }

    if (filters?.date) {
      const date = new Date(filters.date)
      where.date = {
        gte: date,
        lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
      }
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        organizer: {
          select: { name: true },
        },
        ticketTypes: {
          select: { price: true },
          orderBy: { price: "asc" },
          take: 1,
        },
      },
      orderBy: { date: "asc" },
    })

    return { events }
  } catch (error) {
    console.error("Get events error:", error)
    return { error: "Failed to fetch events" }
  }
}

export async function getEventById(id: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: { name: true, email: true },
        },
        ticketTypes: {
          where: { quantity: { gt: 0 } },
        },
      },
    })

    if (!event) {
      return { error: "Event not found" }
    }

    return { event }
  } catch (error) {
    console.error("Get event error:", error)
    return { error: "Failed to fetch event" }
  }
}

export async function getOrganizerEvents() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ORGANIZER") {
      return { error: "Unauthorized" }
    }

    const events = await prisma.event.findMany({
      where: { organizerId: session.user.id },
      include: {
        ticketTypes: {
          select: {
            sold: true,
            quantity: true,
            price: true,
          },
        },
        _count: {
          select: { tickets: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return { events }
  } catch (error) {
    console.error("Get organizer events error:", error)
    return { error: "Failed to fetch events" }
  }
}

export async function approveEvent(eventId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { error: "Unauthorized" }
    }

    const event = await prisma.event.update({
      where: { id: eventId },
      data: { status: "APPROVED" },
    })

    revalidatePath("/admin/events")
    revalidatePath("/events")
    return { success: true, event }
  } catch (error) {
    console.error("Approve event error:", error)
    return { error: "Failed to approve event" }
  }
}

export async function rejectEvent(eventId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { error: "Unauthorized" }
    }

    const event = await prisma.event.update({
      where: { id: eventId },
      data: { status: "REJECTED" },
    })

    revalidatePath("/admin/events")
    return { success: true, event }
  } catch (error) {
    console.error("Reject event error:", error)
    return { error: "Failed to reject event" }
  }
}
