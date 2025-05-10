import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, MessageSquarePlus } from "lucide-react";
import type { Issue } from "@/components/issues/issue-card"; // Re-using the type

// Mock data fetching function
async function getIssueDetails(id: string): Promise<Issue | null> {
  const mockIssues: Issue[] = [
    {
      id: "1",
      title: "Sensor Offline",
      description: "The sensor is not reporting any data to the dashboard. This can be frustrating but is often due to simple power or network issues.",
      imageUrl: "https://picsum.photos/seed/offline/800/400",
      potentialCauses: ["Power supply issue (cable unplugged, faulty adapter, power outage)", "Network connectivity problem (Wi-Fi password change, router offline, GSM signal loss)", "Faulty sensor hardware or wiring", "Controller (Arduino) malfunction", "Incorrect configuration settings"],
      solutions: ["Check all power cables and connections. Try a different power outlet or adapter.", "Verify your Wi-Fi network is up and the password is correct. For GSM, check signal strength and SIM card status.", "Inspect sensor wiring for damage or loose connections. Restart the sensor and the main controller (Arduino).", "If other steps fail, the sensor or controller might need replacement. Check for firmware updates.", "Ensure device ID and server settings are correctly configured on the device."],
    },
    {
      id: "2",
      title: "Inaccurate Temperature Readings",
      description: "Temperature values reported by the sensor are consistently too high, too low, or fluctuate wildly.",
      imageUrl: "https://picsum.photos/seed/temp/800/400",
      potentialCauses: ["Sensor miscalibration or drift over time", "Sensor placement (e.g., near direct sunlight, heat source, AC vent)", "Environmental interference (e.g., high humidity affecting sensor, drafts)", "Faulty sensor component", "Software bug in data processing"],
      solutions: ["If your sensor supports calibration, follow manufacturer's instructions. Relocate the sensor to a more neutral environment, away from direct heat/cold sources. Shield the sensor from direct drafts or sunlight. Ensure the sensor is clean. Try restarting the device. If problems persist, the sensor might be faulty and require replacement."],
    },
    // Add other issues similarly...
  ];
  return mockIssues.find(issue => issue.id === id) || null;
}


export default async function IssueDetailPage({ params }: { params: { id: string } }) {
  const issue = await getIssueDetails(params.id);

  if (!issue) {
    return (
      <div>
        <PageHeader title="Issue Not Found" />
        <p>The requested troubleshooting guide could not be found.</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/issues">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Issues
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader title={issue.title} description={issue.description} />
      
      <Card className="overflow-hidden shadow-lg">
        <div className="relative w-full h-64 md:h-96">
          <Image
            src={issue.imageUrl}
            alt={issue.title}
            layout="fill"
            objectFit="cover"
            data-ai-hint="technical illustration"
          />
        </div>
        <CardContent className="p-6">
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3 text-primary">Potential Causes</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              {issue.potentialCauses.map((cause, index) => (
                <li key={index}>{cause}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-primary">Suggested Solutions</h2>
            <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
              {issue.solutions.map((solution, index) => (
                <li key={index}>{solution}</li>
              ))}
            </ul>
          </section>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Still need help?</CardTitle>
          <CardDescription>
            If these solutions don't resolve your problem, our AI assistant might be able to provide more specific guidance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg">
            <Link href={`/troubleshoot?issue=${issue.title}`}>
              <MessageSquarePlus className="mr-2 h-5 w-5" /> Ask AI Assistant
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Button variant="outline" asChild>
        <Link href="/issues">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to All Issues
        </Link>
      </Button>
    </div>
  );
}

// Generate static paths for mock issues if using SSG for these pages (optional)
export async function generateStaticParams() {
  const mockIssues: Issue[] = [ { id: "1" }, { id: "2" } ]; // Add more IDs
  return mockIssues.map(issue => ({ id: issue.id }));
}
