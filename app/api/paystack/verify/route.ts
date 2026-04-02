import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { reference, transactionId } = body

    // Verify transaction with Paystack
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    )

    const data = await response.json()

    if (!data.status || data.data.status !== "success") {
      // Update transaction as failed
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: "FAILED" },
      })
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }

    // Verify amount matches
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    })

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    const paystackAmount = data.data.amount / 100 // Convert from kobo
    if (paystackAmount !== parseFloat(transaction.amount.toString())) {
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: data.data })
  } catch (error) {
    console.error("Paystack verify error:", error)
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    )
  }
}
