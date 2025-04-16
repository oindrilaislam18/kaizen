"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, CheckCircle, Star, Users, Clock, BarChart, Shield, Zap, Menu, X } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    await signOut({ redirect: false })
    toast({
      title: "Success",
      description: "Logged out successfully",
    })
    router.push("/")
  }

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Product Manager",
      company: "TechCorp",
      content:
        "Kaizen has transformed how our team manages tasks. The intuitive interface and powerful features have boosted our productivity by 30%.",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "Michael Chen",
      role: "Team Lead",
      company: "InnovateLabs",
      content:
        "I've tried many task management tools, but Kaizen stands out with its seamless collaboration features and insightful analytics.",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "Emily Rodriguez",
      role: "Freelancer",
      company: "Self-employed",
      content:
        "As a freelancer juggling multiple projects, Kaizen helps me stay organized and never miss a deadline. It's become essential to my workflow.",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for individuals getting started",
      features: ["Up to 10 tasks", "Basic task management", "1 user", "7-day task history"],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "per month",
      description: "Ideal for professionals and small teams",
      features: [
        "Unlimited tasks",
        "Advanced task management",
        "Up to 5 team members",
        "30-day task history",
        "Priority support",
        "Custom categories",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$29.99",
      period: "per month",
      description: "For organizations with advanced needs",
      features: [
        "Everything in Pro",
        "Unlimited team members",
        "Advanced analytics",
        "API access",
        "SSO integration",
        "Dedicated support",
        "Custom branding",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className={`sticky top-0 z-50 w-full border-b backdrop-blur transition-all ${scrolled ? "bg-background/95 supports-[backdrop-filter]:bg-background/60" : "bg-background"
          }`}
      >
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Kaizen</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-foreground hover:text-primary">
              Features
            </Link>
            <Link href="#testimonials" className="text-sm font-medium text-foreground hover:text-primary">
              Testimonials
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-foreground hover:text-primary">
              Pricing
            </Link>
            <Link href="#faq" className="text-sm font-medium text-foreground hover:text-primary">
              FAQ
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:block">
            {status === "loading" ? (
              <div className="h-9 w-16 animate-pulse rounded bg-muted"></div>
            ) : session?.user ? (
              <div className="relative z-50">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="default"
                      className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt={session?.user?.name} />
                        <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline-block text-primary-foreground">
                        {session?.user?.name}
                      </span>
                    </Button>

                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/dashboard/tasks")}>Dashboard</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>Profile</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

            ) : (
              <div className="flex gap-4">
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t p-4 bg-background">
            <nav className="flex flex-col space-y-4">
              <Link
                href="#features"
                className="text-sm font-medium hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#testimonials"
                className="text-sm font-medium hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimonials
              </Link>
              <Link
                href="#pricing"
                className="text-sm font-medium hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="#faq"
                className="text-sm font-medium hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </Link>

              <div className="pt-4 border-t">
                {session ? (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt={session.user.name} />
                        <AvatarFallback>{session.user.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <span>{session.user.name}</span>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          router.push("/dashboard/tasks")
                          setMobileMenuOpen(false)
                        }}
                      >
                        Dashboard
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          router.push("/dashboard/profile")
                          setMobileMenuOpen(false)
                        }}
                      >
                        Profile
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          router.push("/dashboard/settings")
                          setMobileMenuOpen(false)
                        }}
                      >
                        Settings
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          handleLogout()
                          setMobileMenuOpen(false)
                        }}
                      >
                        Logout
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full">Sign Up</Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-muted/50 to-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                    Manage Tasks Efficiently with Kaizen
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Organize, track, and collaborate on tasks with our intuitive task management platform. Boost
                    productivity and never miss a deadline again.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  {session ? (
                    <Link href="/signup">
                      <Button size="lg" className="gap-1.5">
                        Sign Up
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/signup">
                        <Button size="lg" className="gap-1.5">
                          Get Started
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href="/login">
                        <Button size="lg" variant="outline">
                          Login
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <img
                  src="/Kaizen.png"
                  alt="Kaizen Dashboard Preview"
                  className="rounded-lg object-cover shadow-lg"
                  width={800}
                  height={900}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to stay organized and productive
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Task Management",
                  description: "Create, edit, and organize tasks with ease. Set priorities, deadlines, and categories.",
                  icon: CheckCircle,
                },
                {
                  title: "Team Collaboration",
                  description:
                    "Assign tasks and work together with your team. Share progress and updates in real-time.",
                  icon: Users,
                },
                {
                  title: "Time Tracking",
                  description: "Track time spent on tasks and projects. Set deadlines and receive timely reminders.",
                  icon: Clock,
                },
                {
                  title: "Advanced Analytics",
                  description: "Gain insights into productivity patterns with detailed charts and reports.",
                  icon: BarChart,
                },
                {
                  title: "Secure & Reliable",
                  description:
                    "Your data is protected with enterprise-grade security. Access your tasks from anywhere.",
                  icon: Shield,
                },
                {
                  title: "Integrations",
                  description: "Connect with your favorite tools and services for a seamless workflow.",
                  icon: Zap,
                },
              ].map((feature, index) => (
                <Card key={index} className="border-0 shadow-md">
                  <CardContent className="flex flex-col items-center space-y-2 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-center text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Our Users Say</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Trusted by professionals and teams worldwide
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar>
                        <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}, {testimonial.company}
                        </p>
                      </div>
                    </div>
                    <div className="mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="inline h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground">{testimonial.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        {/* <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Simple, Transparent Pricing
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Choose the plan that works best for you and your team
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              {pricingPlans.map((plan, index) => (
                <Card key={index} className={`border-0 shadow-md ${plan.popular ? "ring-2 ring-primary" : ""}`}>
                  {plan.popular && (
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
                      <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                        Popular
                      </span>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold">{plan.name}</h3>
                      <div className="mt-2">
                        <span className="text-3xl font-bold">{plan.price}</span>
                        {plan.period && <span className="text-muted-foreground">/{plan.period}</span>}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    <div className="space-y-2 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center">
                          <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      className={`w-full ${plan.popular ? "" : "bg-muted-foreground hover:bg-muted-foreground/90"}`}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section> */}

        {/* FAQ Section */}
        <section id="faq" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Frequently Asked Questions
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Find answers to common questions about Kaizen
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl space-y-4 py-12">
              {[
                {
                  question: "How do I get started with Kaizen?",
                  answer:
                    "Getting started is easy! Simply sign up for a free account, and you'll be guided through the setup process. You can create your first task in minutes.",
                },
                {
                  question: "Can I use Kaizen with my team?",
                  answer:
                    "Yes! Kaizen is designed for both individual users and teams. You can invite team members, assign tasks, and collaborate seamlessly.",
                },
                {
                  question: "Is my data secure?",
                  answer:
                    "Absolutely. We use industry-standard encryption and security practices to ensure your data is protected. Your privacy is our priority.",
                },
                {
                  question: "Can I integrate Kaizen with other tools?",
                  answer:
                    "Yes, Kaizen integrates with popular tools like Google Calendar, Slack, and more. Check our integrations page for the full list.",
                },
                {
                  question: "What if I need help?",
                  answer:
                    "Our support team is available 24/7 to assist you. You can reach us via email, chat, or phone, and we're always happy to help.",
                },
              ].map((faq, index) => (
                <Card key={index} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Get Started?</h2>
                <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of users who are already boosting their productivity with Kaizen
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="gap-1.5">
                    Sign Up for Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary-foreground text-secondary-foreground hover:bg-primary-foreground hover:text-primary"
                  >
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t py-6 md:py-12">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">Kaizen</span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground">
              Testimonials
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="#faq" className="text-sm text-muted-foreground hover:text-foreground">
              FAQ
            </Link>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Kaizen. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
