"use client"

import Link from "next/link"
import { useEffect, Suspense } from "react"
import { useAppStore } from "@/components/providers/StoreProvider"
import { Button } from "@/components/ui/button"
import { CheckCircle, Star, ShoppingBag } from "lucide-react"
import { useSearchParams } from "next/navigation"

function CheckoutSuccessContent() {
  const clearCart = useAppStore((state) => state.clearCart)
  const searchParams = useSearchParams()
  const userEmail = searchParams.get("email")

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8 md:py-20">
        <div className="max-w-3xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-6 md:mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-black rounded-full mb-4 md:mb-6 relative">
              <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
              <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-white border-2 border-black rounded-full flex items-center justify-center">
                <Star className="w-2.5 h-2.5 md:w-3 md:h-3 text-black fill-black" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-black mb-3 md:mb-4 tracking-tight">Order Complete</h1>
            <p className="text-lg md:text-xl text-gray-600 font-light max-w-lg mx-auto leading-relaxed">
              Your intimate essentials are on their way to you
            </p>
          </div>

          {/* Main Content Card */}
          <div className="bg-gray-50 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 mb-6 md:mb-8">
            <div className="text-center space-y-4 md:space-y-6">
              <div className="space-y-3 md:space-y-4">
                <h2 className="text-xl md:text-2xl font-light text-gray-900">Thank you for choosing us</h2>
                <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto text-sm md:text-base">
                    Your order has been received and is being carefully prepared with the attention you deserve.                  </p>
                <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto text-sm md:text-base">
                    A confirmation email will be sent to your email account shortly.
                </p>
              </div>

              {userEmail && (
                <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 text-left">
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1 md:mb-2 text-sm md:text-base">Order Confirmation Sent</h3>
                      <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                        We've sent your order details and tracking information to{" "}
                        <span className="font-medium text-black">{userEmail}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1 md:mt-2">
                        Check your inbox for shipping updates and care instructions
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Features Grid */}
            </div>
          </div>

          {/* Action Section */}
          <div className="text-center space-y-4 md:space-y-6">
            <Button
              asChild
              size="lg"
              className="bg-black hover:bg-gray-900 text-white px-12 md:px-16 py-3 md:py-4 rounded-full text-sm md:text-base font-light tracking-wide transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              <Link
                href="/"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("homeScrollPos")
                  }
                  setTimeout(() => window.scrollTo(0, 0), 0)
                }}
              >
                Continue Shopping
              </Link>
            </Button>

            <div className="space-y-1 md:space-y-2">
              <p className="text-xs md:text-sm text-gray-500 font-light">Discover more pieces for every moment of your day</p>
              <p className="text-xs text-gray-400">From everyday comfort to evening allure</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <>
      <Suspense
        fallback={
          <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-8 md:py-20">
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-black rounded-full mb-4 md:mb-6">
                  <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-white animate-pulse" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extralight text-black mb-3 md:mb-4 tracking-tight">Order Complete</h1>
                <p className="text-lg md:text-xl text-gray-600 font-light mb-6 md:mb-8">Processing your order...</p>
                <Button
                  asChild
                  size="lg"
                  className="bg-black hover:bg-gray-900 text-white px-12 md:px-16 py-3 md:py-4 rounded-full text-sm md:text-base font-light"
                >
                  <Link href="/">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          </div>
        }
      >
        <CheckoutSuccessContent />
      </Suspense>
    </>
  )
} 