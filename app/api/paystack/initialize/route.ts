import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { amount, email, metadata } = body

    // Initialize transaction with Paystack
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to kobo
        email,
        metadata,
        callback_url: `${process.env.NEXTAUTH_URL}/payment/verify`,
      }),
    })

    const data = await response.json()

    if (!data.status) {
      return NextResponse.json({ error: data.message }, { status: 400 })
    }

    return NextResponse.json({
      access_code: data.data.access_code,
      reference: data.data.reference,
    })
  } catch (error) {
    console.error("Paystack init error:", error)
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    )
  }
}
