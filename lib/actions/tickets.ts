"use server"

import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import QRCode from "qrcode"
import { generateTicketCode } from "@/lib/utils"
import { Resend } from "resend"
import Twilio from "twilio"

const resend = new Resend(process.env.RESEND_API_KEY)
const twilio = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export async function initiateTicketPurchase(ticketTypeId: string, quantity: number = 1) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { error: "Please login to purchase tickets" }
    }

    const ticketType = await prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
      include: { event: true },
    })

    if (!ticketType) {
      return { error: "Ticket type not found" }
    }

    if (ticketType.sold + quantity > ticketType.quantity) {
      return { error: "Not enough tickets available" }
    }

    // Get platform settings
    const settings = await prisma.settings.findFirst()
    const serviceFee = settings?.serviceFee || 100
    const commissionRate = settings?.commissionRate || 0.05

    const ticketPrice = parseFloat(ticketType.price.toString())
    const subtotal = ticketPrice * quantity
    const platformFee = parseFloat(serviceFee.toString()) * quantity
    const commission = subtotal * parseFloat(commissionRate.toString())
    const totalAmount = subtotal + platformFee

    // Create pending transaction
    const transaction = await prisma.transaction.create({
      data: {
        amount: totalAmount,
        platformFee,
        commission,
        status: "PENDING",
        userId: session.user.id,
      },
    })

    return {
      success: true,
      transaction: {
        id: transaction.id,
        amount: totalAmount,
        email: session.user.email,
        metadata: {
          ticketTypeId,
          quantity,
          eventTitle: ticketType.event.title,
        },
      },
    }
  } catch (error) {
    console.error("Initiate purchase error:", error)
    return { error: "Failed to initiate purchase" }
  }
}

export async function verifyPaymentAndCreateTickets(
  transactionId: string,
  paystackRef: string,
  ticketTypeId: string,
  quantity: number
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { error: "Unauthorized" }
    }

    // Update transaction
    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: "SUCCESS",
        paystackRef,
        paidAt: new Date(),
      },
    })

    // Get ticket type info
    const ticketType = await prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
      include: { event: true },
    })

    if (!ticketType) {
      return { error: "Ticket type not found" }
    }

    // Create tickets
    const tickets = []
    for (let i = 0; i < quantity; i++) {
      const qrCode = generateTicketCode()
      const ticket = await prisma.ticket.create({
        data: {
          qrCode,
          ticketTypeId,
          userId: session.user.id,
          transactionId: transaction.id,
        },
        include: {
          ticketType: {
            include: { event: true },
          },
        },
      })
      tickets.push(ticket)
    }

    // Update sold count
    await prisma.ticketType.update({
      where: { id: ticketTypeId },
      data: { sold: { increment: quantity } },
    })

    // Send tickets via email and WhatsApp
    await sendTicketNotifications(tickets, session.user)

    return { success: true, tickets }
  } catch (error) {
    console.error("Verify payment error:", error)
    return { error: "Failed to verify payment" }
  }
}

async function sendTicketNotifications(tickets: any[], user: any) {
  try {
    // Generate QR code images
    const qrCodes = await Promise.all(
      tickets.map(async (ticket) => {
        const qrDataUrl = await QRCode.toDataURL(ticket.qrCode)
        return {
          code: ticket.qrCode,
          eventTitle: ticket.ticketType.event.title,
          date: ticket.ticketType.event.date,
          venue: ticket.ticketType.event.venue,
          qrDataUrl,
        }
      })
    )

    // Send email
    if (user.email) {
      await resend.emails.send({
        from: "Zeeroh <tickets@zeeroh.ng>",
        to: user.email,
        subject: `Your Tickets for ${qrCodes[0].eventTitle}`,
        html: generateTicketEmail(qrCodes),
      })
    }

    // Send WhatsApp message
    if (user.phone) {
      const message = generateWhatsAppMessage(qrCodes)
      await twilio.messages.create({
        body: message,
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${user.phone}`,
      })
    }
  } catch (error) {
    console.error("Notification error:", error)
  }
}

function generateTicketEmail(qrCodes: any[]) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Your Event Tickets</h1>
      <p>Thank you for your purchase! Here are your tickets:</p>
      ${qrCodes.map((qr, i) => `
        <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h2>${qr.eventTitle}</h2>
          <p><strong>Ticket ${i + 1}:</strong> ${qr.code}</p>
          <p><strong>Date:</strong> ${new Date(qr.date).toLocaleString()}</p>
          <p><strong>Venue:</strong> ${qr.venue}</p>
          <img src="${qr.qrDataUrl}" alt="QR Code" style="width: 200px; height: 200px;" />
        </div>
      `).join('')}
      <p>Present this QR code at the event entrance.</p>
    </div>
  `
}

function generateWhatsAppMessage(qrCodes: any[]) {
  return `
🎫 *Your Zeeroh Tickets* 🎫

Event: ${qrCodes[0].eventTitle}
Date: ${new Date(qrCodes[0].date).toLocaleString()}
Venue: ${qrCodes[0].venue}

${qrCodes.map((qr, i) => `Ticket ${i + 1}: ${qr.code}`).join('\n')}

Present your QR code at the entrance. Download your tickets from the email sent to you.
  `.trim()
}

export async function getUserTickets() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { error: "Unauthorized" }
    }

    const tickets = await prisma.ticket.findMany({
      where: { userId: session.user.id },
      include: {
        ticketType: {
          include: {
            event: true,
          },
        },
      },
      orderBy: { purchasedAt: "desc" },
    })

    return { tickets }
  } catch (error) {
    console.error("Get user tickets error:", error)
    return { error: "Failed to fetch tickets" }
  }
}
