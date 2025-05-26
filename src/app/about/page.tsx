
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Users, Zap, ShieldCheck, Target } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="About IoT Guardian"
        description="Empowering Your Connected World with Security and Intelligence."
      />

      <section className="animate-in fade-in duration-700">
        <Card className="shadow-lg">
          <CardContent className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-semibold text-primary mb-4">
                  Our Mission
                </h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  At IoT Guardian, our mission is to provide robust, intuitive, and intelligent solutions for managing and securing Internet of Things (IoT) devices. We believe that as the world becomes more connected, the need for reliable oversight and proactive protection of IoT ecosystems is paramount. We empower individuals and businesses to harness the full potential of their IoT deployments with confidence and peace of mind.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We strive to simplify the complexities of IoT management through cutting-edge technology, AI-driven insights, and a user-centric approach, making advanced device monitoring accessible to everyone.
                </p>
              </div>
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-md animate-in zoom-in-95 delay-200 duration-500">
                <Image
                  src="https://placehold.co/600x400.png"
                  alt="IoT Guardian Team or Office"
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint="modern office team"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
        <h2 className="text-3xl font-bold text-center text-primary mb-12">
          Our Core Values
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: ShieldCheck,
              title: "Security First",
              description: "We prioritize the security of your devices and data above all, implementing robust protocols and best practices.",
            },
            {
              icon: Zap,
              title: "Innovation",
              description: "We continuously explore and integrate the latest technologies, including AI, to offer cutting-edge solutions.",
            },
            {
              icon: Users,
              title: "Customer Centricity",
              description: "Our users are at the heart of everything we do. We design our platform to be intuitive, reliable, and supportive.",
            },
            {
              icon: Target,
              title: "Reliability",
              description: "We build dependable systems that you can trust to monitor and manage your critical IoT infrastructure 24/7.",
            },
          ].map((value) => (
            <Card key={value.title} className="text-center shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 mb-4">
                  <value.icon className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-xl">{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="text-center py-10 animate-in fade-in duration-700 delay-500">
        <h2 className="text-2xl font-semibold text-primary mb-4">
          Join Us on Our Journey
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          IoT Guardian is more than just a platform; it's a commitment to a safer and smarter connected future. We invite you to explore our services and see how we can help you protect and optimize your IoT world.
        </p>
      </section>
    </div>
  );
}
