
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/context/user-context";
import { ArrowRight, CheckCircle, Cpu, ShieldCheck, Wifi, Server, AlertTriangle, BarChartBig, MessageSquare, Users, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  const { currentUser } = useUser();

  const testimonials = [
    {
      quote: "IoT Guardian has revolutionized how we monitor our remote sensors. The AI troubleshooter is a game-changer!",
      name: "Sarah L.",
      company: "GreenTech Solutions",
      avatar: "https://placehold.co/100x100.png?text=SL"
    },
    {
      quote: "The ability to manage device subscriptions and get real-time alerts has saved us countless hours and potential damage.",
      name: "Mike P.",
      company: "AquaFarms Inc.",
      avatar: "https://placehold.co/100x100.png?text=MP"
    },
    {
      quote: "As an admin, the centralized dashboard for users and devices is incredibly intuitive. Highly recommended!",
      name: "David K.",
      company: "SmartHome Pro",
      avatar: "https://placehold.co/100x100.png?text=DK"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-background via-primary/5 to-accent/5 animate-in fade-in duration-1000">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6 animate-in fade-in slide-in-from-top-8 duration-700">
            Welcome to IoT Guardian
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto animate-in fade-in slide-in-from-top-10 duration-700 delay-200">
            Secure, Monitor, and Manage your Internet of Things devices with unparalleled ease and intelligence.
            IoT Guardian provides robust solutions for real-time tracking, AI-powered troubleshooting, and comprehensive device management, ensuring your IoT ecosystem is always protected and optimized.
          </p>
          <Button 
            size="lg" 
            asChild 
            className="shadow-lg hover:scale-105 transition-transform animate-in fade-in zoom-in-95 duration-700 delay-400 group"
          >
            <Link href={currentUser?.isLoggedIn ? "/dashboard" : "/auth/register"}>
              Get Started Now <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-primary mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">How IoT Guardian Works</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center p-6 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-100">
              <div className="p-4 bg-accent/10 rounded-full mb-6">
                <Server className="h-12 w-12 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">1. Connect Your Devices</h3>
              <p className="text-muted-foreground text-sm">Easily integrate your Arduino, ESP32, or other IoT sensors with our platform using simple API endpoints.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
              <div className="p-4 bg-accent/10 rounded-full mb-6">
                <BarChartBig className="h-12 w-12 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">2. Monitor Real-Time Data</h3>
              <p className="text-muted-foreground text-sm">View live sensor readings (temperature, humidity, leaks) and device status on your personalized dashboard.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
              <div className="p-4 bg-accent/10 rounded-full mb-6">
                <MessageSquare className="h-12 w-12 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">3. Troubleshoot with AI</h3>
              <p className="text-muted-foreground text-sm">Get intelligent insights and step-by-step solutions for any issues, powered by our advanced AI assistant.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-primary mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">Our Core Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-100">
              <CardHeader>
                <div className="flex justify-center mb-4 text-accent">
                  <Cpu className="h-16 w-16" />
                </div>
                <CardTitle className="text-center text-xl">Real-Time Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center text-sm">
                  Keep a constant eye on your device status, sensor data (temperature, humidity, water leaks), and operational health with our intuitive dashboard.
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
              <CardHeader>
                <div className="flex justify-center mb-4 text-accent">
                  <ShieldCheck className="h-16 w-16" />
                </div>
                <CardTitle className="text-center text-xl">AI-Powered Troubleshooting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center text-sm">
                  Leverage advanced AI to diagnose issues, predict potential failures, and get actionable, step-by-step solutions instantly.
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
              <CardHeader>
                <div className="flex justify-center mb-4 text-accent">
                  <Wifi className="h-16 w-16" />
                </div>
                <CardTitle className="text-center text-xl">Remote Device Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center text-sm">
                  Control your devices (ON/OFF commands), manage configurations, and receive critical alerts from anywhere in the world.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-primary mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">Why Choose IoT Guardian?</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-video animate-in fade-in zoom-in-95 duration-700 delay-100">
              <Image 
                src="https://placehold.co/600x338.png" 
                alt="IoT Security and Management Dashboard" 
                layout="fill" 
                objectFit="cover" 
                className="rounded-lg shadow-xl"
                data-ai-hint="iot dashboard security" 
              />
            </div>
            <ul className="space-y-6">
              {[
                { icon: Server, title: "Seamless Integration", text: "Easily connect your Arduino, ESP32, and other IoT devices." },
                { icon: Users, title: "Flexible Subscriptions", text: "Scalable architecture from personal projects to enterprise-level deployments." },
                { icon: ShieldCheck, title: "Advanced Security", text: "Robust protocols to protect your data and devices, with admin-controlled access." },
                { icon: AlertTriangle, title: "Customizable Alerts", text: "Get notified via in-app notifications for critical events like water leaks or high temperatures." },
                { icon: Settings, title: "Intelligent Device Control", text: "Premium features include remote ON/OFF and automated shutdown capabilities." }
              ].map((feature, index) => (
                <li key={feature.title} className="flex items-start animate-in fade-in slide-in-from-left-12 duration-700" style={{ animationDelay: `${150 * (index + 1)}ms` }}>
                  <feature.icon className="h-7 w-7 text-green-500 mr-4 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-primary mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">Loved by Innovators Worldwide</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1 animate-in fade-in zoom-in-90 duration-700" style={{animationDelay: `${100 * index}ms`}}>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground italic mb-4">&quot;{testimonial.quote}&quot;</p>
                  <div className="flex items-center">
                    <Image src={testimonial.avatar} alt={testimonial.name} width={40} height={40} className="rounded-full mr-3" data-ai-hint="person face"/>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-tr from-primary to-accent animate-in fade-in duration-1000">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-primary-foreground animate-in fade-in slide-in-from-bottom-8 duration-700">Ready to Secure Your IoT Ecosystem?</h2>
          <p className="text-lg text-primary-foreground/90 mb-10 max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
            Join IoT Guardian today and experience the future of device management. Protect, monitor, and control with confidence.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            asChild 
            className="text-primary hover:bg-background/90 hover:text-primary shadow-lg hover:scale-105 transition-transform animate-in fade-in zoom-in-95 duration-700 delay-400 group"
          >
             <Link href={currentUser?.isLoggedIn ? "/dashboard" : "/auth/register"}>
              Sign Up Now <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
