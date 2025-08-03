
"use client";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import Image from "next/image";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Contact form submitted:", data);
    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We'll get back to you shortly.",
    });
    form.reset();
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Contact IoT Guardian"
        description="We're here to help. Reach out to us with any questions or inquiries."
      />

      <div className="grid md:grid-cols-2 gap-12">
        <section className="animate-in fade-in slide-in-from-left-10 duration-700">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Send Us a Message</CardTitle>
              <CardDescription>
                Fill out the form below and our team will get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" {...form.register("name")} placeholder="John Doe" />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" {...form.register("email")} placeholder="you@example.com" />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" {...form.register("subject")} placeholder="Inquiry about Premium Plan" />
                   {form.formState.errors.subject && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.subject.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    {...form.register("message")}
                    placeholder="Your message here..."
                    className="min-h-[120px]"
                  />
                  {form.formState.errors.message && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.message.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6 animate-in fade-in slide-in-from-right-10 duration-700 delay-200">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Our Contact Information</CardTitle>
              <CardDescription>
                Alternatively, you can reach us through the following channels:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-accent mr-3 mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold">Our Office</h3>
                  <p className="text-muted-foreground text-sm">
                    123 IoT Street, Innovation City, TechState 54321
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="h-6 w-6 text-accent mr-3 mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold">Email Us</h3>
                  <a href="mailto:support@iotguardian.example.com" className="text-muted-foreground hover:text-primary text-sm">
                    support@iotguardian.example.com
                  </a>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="h-6 w-6 text-accent mr-3 mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold">Call Us</h3>
                  <p className="text-muted-foreground text-sm">(555) 123-4567</p>
                  <p className="text-xs text-muted-foreground">Mon - Fri, 9 AM - 5 PM (Tech Time)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-md animate-in zoom-in-95 delay-300 duration-500">
             <Image
                src="https://placehold.co/600x338.png"
                alt="Map to IoT Guardian office"
                layout="fill"
                objectFit="cover"
                data-ai-hint="city map location"
              />
          </div>
        </section>
      </div>
    </div>
  );
}
