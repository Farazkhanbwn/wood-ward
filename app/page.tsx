"use client"

import { Navigation } from "@/components/landing/navigation"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic2, TrendingUp, Brain, Mail, Users, BarChart3, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string>('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await api.verifyAuth()
      if (response.user) {
        setIsLoggedIn(true)
        setUserRole(response.user.role)
      }
    } catch (error) {
      // User not logged in
    }
  }

  const handleDashboardClick = () => {
    const dashboardRoutes: Record<string, string> = {
      admin: '/admin/company-management',
      coach: '/coach/team-management',
      sales: '/sales'
    }
    router.push(dashboardRoutes[userRole] || '/sales')
  }
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1E63F3]/5 via-transparent to-transparent" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#1E63F3]/5 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-20 left-10 w-96 h-96 bg-[#1E63F3]/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />

        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <Badge
              variant="secondary"
              className="text-[#1E63F3] border-[#1E63F3]/20 bg-[#1E63F3]/10 hover:bg-[#1E63F3]/15 transition-colors"
            >
              Powered by Woodward Sales Methodology
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-balance text-gray-900 leading-tight">
              Master Every Sales Conversation with{" "}
              <span className="text-[#1E63F3] bg-gradient-to-r from-[#1E63F3] to-[#60A5FA] bg-clip-text text-transparent">
                AI-Powered Coaching
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-2xl mx-auto text-pretty leading-relaxed">
              Real-time voice role play, instant feedback, and custom scripts — all built on the Woodward Sales
              Methodology.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {isLoggedIn ? (
                <Button
                  onClick={handleDashboardClick}
                  size="lg"
                  className="bg-[#1E63F3] hover:bg-[#1E63F3]/90 text-white text-lg px-10 py-6 shadow-lg shadow-[#1E63F3]/30 hover:shadow-xl hover:shadow-[#1E63F3]/40 transition-all duration-300 hover:scale-105"
                >
                  Go to Dashboard →
                </Button>
              ) : (
                <Button
                  asChild
                  size="lg"
                  className="bg-[#1E63F3] hover:bg-[#1E63F3]/90 text-white text-lg px-10 py-6 shadow-lg shadow-[#1E63F3]/30 hover:shadow-xl hover:shadow-[#1E63F3]/40 transition-all duration-300 hover:scale-105"
                >
                  <Link href="/signup">Start Free Trial →</Link>
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-500">No credit card required • 14-day free trial</p>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <Badge variant="outline" className="mb-4 text-[#1E63F3] border-[#1E63F3]/30">
              Features
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
              Powerful Features for Sales Excellence
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to transform your sales team's performance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                icon: Mic2,
                title: "AI Voice Role Play",
                description:
                  "Practice live calls with an AI prospect that responds instantly and sounds like your coach.",
                delay: "0s",
              },
              {
                icon: TrendingUp,
                title: "Real-Time Feedback",
                description: "Receive in-call coaching and detailed post-call analysis.",
                delay: "0.1s",
              },
              {
                icon: Brain,
                title: "Woodward Methodology",
                description: "Every script, objection, and question aligns with your training.",
                delay: "0.2s",
              },
              {
                icon: Mail,
                title: "Smart Script Generator",
                description: "Generate and edit custom scripts and email templates.",
                delay: "0.3s",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group hover-lift gradient-border border-2 border-gray-100 animate-scale-in bg-white relative overflow-hidden"
                style={{ animationDelay: feature.delay, animationFillMode: "both" }}
              >
                <CardContent className="p-8 space-y-4 relative z-10">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#1E63F3] to-[#60A5FA] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#1E63F3]/30">
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-[#1E63F3] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#1E63F3]/20 to-transparent" />

        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-20 animate-fade-in">
            <Badge variant="outline" className="mb-4 text-[#1E63F3] border-[#1E63F3]/30">
              Process
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Get started in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto relative">
            {[
              {
                step: "01",
                title: "Set Up Your Profile",
                description: "Add your product, persona, and sales data in minutes.",
                delay: "0s",
              },
              {
                step: "02",
                title: "Start Role Play",
                description: "Talk to the AI prospect in real time with instant responses.",
                delay: "0.1s",
              },
              {
                step: "03",
                title: "Review Feedback",
                description: "Get instant insights and replay your recordings for improvement.",
                delay: "0.2s",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="text-center space-y-6 animate-slide-up relative"
                style={{ animationDelay: item.delay, animationFillMode: "both" }}
              >
                <div className="relative inline-block">
                  <div className="text-7xl font-bold bg-gradient-to-br from-[#1E63F3] to-[#60A5FA] bg-clip-text text-transparent">
                    {item.step}
                  </div>
                  <div className="absolute -inset-4 bg-[#1E63F3]/5 rounded-full blur-xl -z-10" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <Badge variant="outline" className="mb-4 text-[#1E63F3] border-[#1E63F3]/30">
              For Teams
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900">Built for Teams and Sales Leaders</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools to manage and elevate your entire sales organization
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Users,
                title: "Team Management",
                description: "Manage multiple reps under one account with ease",
                delay: "0s",
              },
              {
                icon: BarChart3,
                title: "Analytics & Insights",
                description: "Track progress and session analytics in real-time",
                delay: "0.1s",
              },
              {
                icon: CheckCircle2,
                title: "Goal Setting",
                description: "Assign practice goals and review recordings together",
                delay: "0.2s",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="hover-lift gradient-border border-2 border-gray-100 animate-scale-in bg-white"
                style={{ animationDelay: feature.delay, animationFillMode: "both" }}
              >
                <CardContent className="p-10 text-center space-y-6">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#1E63F3] to-[#60A5FA] flex items-center justify-center mx-auto shadow-xl shadow-[#1E63F3]/30">
                    <feature.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <Badge variant="outline" className="mb-4 text-[#1E63F3] border-[#1E63F3]/30">
              Testimonials
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900">Trusted by Sales Leaders</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">See what our customers have to say</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote:
                  "Wood Ward has transformed how our team practices and prepares for calls. The AI feedback is incredibly accurate.",
                author: "Sarah Johnson",
                role: "Sales Director",
                delay: "0s",
              },
              {
                quote:
                  "The Woodward methodology integration is seamless. Our reps are closing deals faster than ever before.",
                author: "Michael Chen",
                role: "VP of Sales",
                delay: "0.1s",
              },
              {
                quote:
                  "Finally, a tool that actually helps our team improve. The analytics dashboard is a game-changer.",
                author: "Emily Rodriguez",
                role: "Sales Manager",
                delay: "0.2s",
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="animate-scale-in bg-white border-2 border-gray-100 hover-lift"
                style={{ animationDelay: testimonial.delay, animationFillMode: "both" }}
              >
                <CardContent className="p-8 space-y-6">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-[#1E63F3]" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#1E63F3] to-[#60A5FA]" />
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.author}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1E63F3]/5 via-transparent to-transparent" />

        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">Start Your Free Trial Today</h2>
            <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed">
              Join thousands of sales professionals mastering their craft with AI-powered coaching
            </p>
            <div className="pt-4">
              {isLoggedIn ? (
                <Button
                  onClick={handleDashboardClick}
                  size="lg"
                  className="bg-[#1E63F3] hover:bg-[#1E63F3]/90 text-white text-lg px-12 py-7 shadow-xl shadow-[#1E63F3]/30 hover:shadow-2xl hover:shadow-[#1E63F3]/40 transition-all duration-300 hover:scale-105"
                >
                  Go to Dashboard →
                </Button>
              ) : (
                <Button
                  asChild
                  size="lg"
                  className="bg-[#1E63F3] hover:bg-[#1E63F3]/90 text-white text-lg px-12 py-7 shadow-xl shadow-[#1E63F3]/30 hover:shadow-2xl hover:shadow-[#1E63F3]/40 transition-all duration-300 hover:scale-105"
                >
                  <Link href="/signup">Get Started Free →</Link>
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-500">No credit card required • Cancel anytime</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
