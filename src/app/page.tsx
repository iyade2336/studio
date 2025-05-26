
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/context/user-context";
import { ArrowRight, CheckCircle, Cpu, ShieldCheck, Wifi, Server, AlertTriangle, BarChartBig } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  const { currentUser } = useUser();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
            Welcome to IoT Guardian
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            Secure, Monitor, and Manage your Internet of Things devices with unparalleled ease and intelligence.
            IoT Guardian provides robust solutions for real-time tracking, AI-powered troubleshooting, and comprehensive device management, ensuring your IoT ecosystem is always protected and optimized.
          </p>
          <Button size="lg" asChild className="shadow-lg hover:scale-105 transition-transform">
            <Link href={currentUser?.isLoggedIn ? "/dashboard" : "/auth/register"}>
              Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-primary mb-16">Our Core Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1">
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
            <Card className="shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1">
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
            <Card className="shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1">
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
      <section id="features" className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-primary mb-16">Why Choose IoT Guardian?</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-video">
              <Image 
                src="https://placehold.co/600x338.png" 
                alt="IoT Security and Management" 
                layout="fill" 
                objectFit="cover" 
                className="rounded-lg shadow-xl"
                data-ai-hint="iot dashboard security" 
              />
            </div>
            <ul className="space-y-6">
              {[
                { icon: Server, text: "Seamless Integration: Easily connect your Arduino, ESP32, and other IoT devices." },
                { icon: BarChartBig, text: "Scalable Architecture: From personal projects to enterprise-level deployments with flexible subscription plans." },
                { icon: ShieldCheck, text: "Advanced Security: Robust protocols to protect your data and devices, with admin-controlled access." },
                { icon: AlertTriangle, text: "Customizable Alerts: Get notified via in-app notifications for critical events like water leaks or high temperatures." },
                { icon: Cpu, text: "Intelligent Device Control: Premium features include remote ON/OFF and automated shutdown capabilities." }
              ].map(feature => (
                <li key={feature.text} className="flex items-start">
                  <feature.icon className="h-7 w-7 text-green-500 mr-4 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">{feature.text.split(':')[0]}</h3>
                    <p className="text-muted-foreground text-sm">{feature.text.split(':')[1]}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-tr from-primary to-accent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-primary-foreground">Ready to Secure Your IoT Ecosystem?</h2>
          <p className="text-lg text-primary-foreground/90 mb-10 max-w-xl mx-auto">
            Join IoT Guardian today and experience the future of device management. Protect, monitor, and control with confidence.
          </p>
          <Button size="lg" variant="secondary" asChild className="text-primary hover:bg-background/90 hover:text-primary shadow-lg hover:scale-105 transition-transform">
             <Link href={currentUser?.isLoggedIn ? "/dashboard" : "/auth/register"}>
              Sign Up Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
