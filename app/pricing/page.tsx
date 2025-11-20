"use client"

import { Navigation } from "@/components/landing/navigation"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useState, useEffect } from "react"

// Stripe Price IDs
const STRIPE_PRICES = {
  pro: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_PLAN_PRICE_ID || '',
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || ''
  },
  team: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_TEAM_PLAN_PRICE_ID || '',
    yearly: process.env.NEXT_PUBLIC_STRIPE_TEAM_YEARLY_PRICE_ID || ''
  }
}

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<'pro' | 'team' | null>(null)
  const [userPlan, setUserPlan] = useState<string | null>(null)
  const [userBillingCycle, setUserBillingCycle] = useState<string | null>(null)
  const [userStatus, setUserStatus] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  useEffect(() => {
    checkUserSubscription()
  }, [])

  const checkUserSubscription = async () => {
    try {
      const response = await api.verifyAuth()
      if (response.user) {
        setIsLoggedIn(true)
        const status = response.user.subscription?.status
        setUserStatus(status || null)
        // Only show current plan if status is Active
        if (status === 'Active') {
          setUserPlan(response.user.subscription?.plan || null)
          setUserBillingCycle(response.user.subscription?.billingCycle || null)
        } else {
          setUserPlan(null)
          setUserBillingCycle(null)
        }
      }
    } catch (error) {
      // User not logged in
    } finally {
      setIsCheckingAuth(false)
    }
  }

  const handleSubscribe = async (planType: 'pro' | 'team') => {
    try {
      setLoadingPlan(planType)
      const priceId = STRIPE_PRICES[planType][billingCycle]
      
      const response = await api.createPaymentSession(priceId)
      
      if (response.success && response.url) {
        window.location.href = response.url
      } else {
        toast.error('Failed to create payment session')
      }
    } catch (error) {
      toast.error('Please login first to subscribe')
    } finally {
      setLoadingPlan(null)
    }
  }

  const isCurrentPlan = (planName: string) => {
    if (!userPlan || !userBillingCycle) return false
    const currentCycle = billingCycle === 'monthly' ? 'Monthly' : 'Yearly'
    if (planName === 'Pro Plan' && userPlan === 'Pro' && userBillingCycle === currentCycle) return true
    if (planName === 'Team Plan' && (userPlan === 'Enterprise' || userPlan === 'Team') && userBillingCycle === currentCycle) return true
    return false
  }
  const plans = [
    {
      name: "Free Trial",
      price: "$0",
      period: "7 days",
      description: "Perfect for trying out the platform",
      features: ["2 role play sessions", "Basic feedback", "Limited script generator", "Email support"],
      cta: "Start Free Trial",
      href: "/signup",
      popular: false,
      delay: "0s",
    },
    {
      name: "Pro Plan",
      price: billingCycle === 'monthly' ? "$49" : "$490",
      period: billingCycle === 'monthly' ? "per user/month" : "per user/year",
      description: "For individual sales professionals",
      features: [
        "Unlimited role plays",
        "Full AI feedback",
        "Script & email generator",
        "Save & edit scripts",
        "Access to video snippets",
        "Priority support",
      ],
      cta: "Subscribe",
      href: "/signup",
      popular: true,
      isPaid: true,
      planType: 'pro' as const,
      delay: "0.1s",
    },
    {
      name: "Team Plan",
      price: billingCycle === 'monthly' ? "$199" : "$1,990",
      period: billingCycle === 'monthly' ? "per month (up to 5 users)" : "per year (up to 5 users)",
      description: "For sales teams and leaders",
      features: [
        "Team dashboard & analytics",
        "Coach account access",
        "Unlimited role plays",
        "Performance reports",
        "Custom integrations",
        "Dedicated support",
      ],
      cta: "Subscribe",
      href: "/signup",
      popular: false,
      isPaid: true,
      planType: 'team' as const,
      delay: "0.2s",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl lg:text-6xl font-bold mb-4 text-gray-900">Simple Plans for Every Sales Team</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose a plan that fits your needs. Cancel anytime.
            </p>
            
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-[#1E63F3] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-[#1E63F3] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative flex flex-col animate-scale-in bg-white ${
                  plan.popular ? "border-[#1E63F3] shadow-lg shadow-[#1E63F3]/20" : ""
                }`}
                style={{ animationDelay: plan.delay, animationFillMode: "both" }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#1E63F3] text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2">/ {plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-[#1E63F3] shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {plan.isPaid ? (
                    isCurrentPlan(plan.name) ? (
                      <Button
                        disabled
                        className="w-full bg-green-500 hover:bg-green-500 text-white cursor-not-allowed"
                      >
                        ✓ Current Plan
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleSubscribe(plan.planType!)}
                        disabled={loadingPlan !== null}
                        className="w-full bg-[#1E63F3] hover:bg-[#1E63F3]/90 text-white"
                      >
                        {loadingPlan === plan.planType ? 'Processing...' : plan.cta}
                      </Button>
                    )
                  ) : (
                    // Free Trial button logic
                    isLoggedIn && (userStatus === 'Trial' || userStatus === 'Inactive') ? (
                      <Button
                        disabled
                        className="w-full bg-gray-400 text-white cursor-not-allowed"
                      >
                        {userStatus === 'Trial' ? '✓ Trial Active' : 'Trial Used'}
                      </Button>
                    ) : (
                      <Button
                        asChild
                        className={`w-full ${plan.popular ? "bg-[#1E63F3] hover:bg-[#1E63F3]/90 text-white" : ""}`}
                        variant={plan.popular ? "default" : "outline"}
                      >
                        <Link href={plan.href}>{plan.cta}</Link>
                      </Button>
                    )
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          <div
            className="mt-16 text-center animate-fade-in"
            style={{ animationDelay: "0.3s", animationFillMode: "both" }}
          >
            <Card className="max-w-2xl mx-auto bg-gray-50">
              <CardContent className="p-8">
                <p className="text-gray-600">
                  <strong className="text-gray-900">Note for Partners:</strong> Existing partners can receive manually
                  issued accounts — contact us for setup.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
