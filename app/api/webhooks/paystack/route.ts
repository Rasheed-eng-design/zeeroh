import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get("x-paystack-signature")

    // Verify webhook signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest("hex")

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)

    if (event.event === "charge.success") {
      const { reference } = event.data

      // Update transaction status
      await prisma.transaction.updateMany({
        where: { paystackRef: reference },
        data: {
          status: "SUCCESS",
          paidAt: new Date(),
        },
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 })
  }
}
