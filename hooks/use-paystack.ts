"use client"

import { useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { initiateTicketPurchase, verifyPaymentAndCreateTickets } from "@/lib/actions/tickets"

interface PaystackConfig {
  amount: number
  email: string
  metadata?: {
    ticketTypeId: string
    quantity: number
    eventTitle: string
  }
}

interface UsePaystackReturn {
  isLoading: boolean
  error: string | null
  initializePayment: (config: PaystackConfig) => Promise<void>
}

export function usePaystack(): UsePaystackReturn {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initializePayment = useCallback(async (config: PaystackConfig) => {
    if (!session?.user) {
      setError("Please sign in to purchase tickets")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // First, initiate the ticket purchase on our backend
      const result = await initiateTicketPurchase(
        config.metadata!.ticketTypeId,
        config.metadata!.quantity
      )

      if (result.error) {
        setError(result.error)
        return
      }

      const { transaction } = result

      // Initialize Paystack popup
      const paystack = (window as any).PaystackPop
      if (!paystack) {
        setError("Payment system not loaded. Please refresh the page.")
        return
      }

      const handler = paystack.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: config.email,
        amount: config.amount * 100, // Convert to kobo
        ref: transaction.id,
        metadata: {
          ...config.metadata,
          transactionId: transaction.id,
        },
        callback: async (response: any) => {
          // Verify payment and create tickets
          const verifyResult = await verifyPaymentAndCreateTickets(
            transaction.id,
            response.reference,
            config.metadata!.ticketTypeId,
            config.metadata!.quantity
          )

          if (verifyResult.error) {
            setError(verifyResult.error)
          } else {
            // Redirect to success page
            window.location.href = "/tickets/success"
          }
        },
        onClose: () => {
          setIsLoading(false)
        },
      })

      handler.openIframe()
    } catch (err) {
      console.error("Payment error:", err)
      setError("Failed to initialize payment. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [session])

  return {
    isLoading,
    error,
    initializePayment,
  }
}
