"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { XCircle, ShoppingCart, ArrowLeft } from "lucide-react"

export default function CheckoutCancelPage() {
  return (
    <>
      <div className="bg-white">
        <div className="container mx-auto px-4 py-8 md:py-20">
          <div className="max-w-3xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-6 md:mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gray-100 border-2 border-gray-200 rounded-full mb-4 md:mb-6 relative">
                <XCircle className="w-8 h-8 md:w-10 md:h-10 text-gray-600" />
                <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full"></div>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-black mb-3 md:mb-4 tracking-tight">Payment Cancelled</h1>
              <p className="text-lg md:text-xl text-gray-600 font-light max-w-lg mx-auto leading-relaxed">
                No worries, your items are still waiting for you
              </p>
            </div>

            {/* Main Content Card */}
            <div className="bg-gray-50 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 mb-6 md:mb-8">
              <div className="text-center space-y-4 md:space-y-6">
                <div className="space-y-3 md:space-y-4">
                  <h2 className="text-xl md:text-2xl font-light text-gray-900">Your cart is safe</h2>
                  <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto text-sm md:text-base">
                    Your payment was not processed and your selected items remain in your cart. Take your time to review
                    your choices or continue browsing our collection.
                  </p>
                </div>

                {/* Info Card */}
                <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 text-left">
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1 md:mb-2 text-sm md:text-base">Your Items Are Saved</h3>
                      <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                        All your selected pieces are still in your cart and ready for checkout whenever you're ready.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Section */}
            <div className="text-center space-y-4 md:space-y-6">
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-black text-black hover:bg-black hover:text-white px-8 md:px-12 py-3 md:py-4 rounded-full text-sm md:text-base font-light tracking-wide transition-all duration-300 hover:scale-[1.02]"
                >
                  <Link href="/cart">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Return to Cart
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  className="bg-black hover:bg-gray-900 text-white px-8 md:px-12 py-3 md:py-4 rounded-full text-sm md:text-base font-light tracking-wide transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  <Link
                    href="/"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        localStorage.removeItem("homeScrollPos")
                      }
                    }}
                  >
                    Continue Shopping
                  </Link>
                </Button>
              </div>

              <div className="space-y-1 md:space-y-2">
                <p className="text-xs md:text-sm text-gray-500 font-light">Explore more pieces that speak to you</p>
                <p className="text-xs text-gray-400">From everyday comfort to evening allure</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 