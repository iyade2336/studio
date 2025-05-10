import { PageHeader } from "@/components/shared/page-header";
import { IssueCard, type Issue } from "@/components/issues/issue-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const mockIssues: Issue[] = [
  {
    id: "1",
    title: "Sensor Offline",
    description: "The sensor is not reporting any data to the dashboard.",
    imageUrl: "https://picsum.photos/seed/offline/600/400",
    potentialCauses: ["Power supply issue", "Network connectivity problem", "Faulty sensor hardware"],
    solutions: ["Check power cable and source.", "Verify Wi-Fi/GSM connection.", "Restart the sensor and controller."],
  },
  {
    id: "2",
    title: "Inaccurate Temperature Readings",
    description: "Temperature values are consistently too high or too low.",
    imageUrl: "https://picsum.photos/seed/temp/600/400",
    potentialCauses: ["Sensor miscalibration", "Sensor placement issue (e.g., near heat source)", "Environmental interference"],
    solutions: ["Recalibrate the sensor if possible.", "Relocate sensor to a neutral area.", "Shield sensor from direct sunlight or drafts."],
  },
  {
    id: "3",
    title: "False Water Leak Alerts",
    description: "The system reports water leaks when there are none.",
    imageUrl: "https://picsum.photos/seed/leak/600/400",
    potentialCauses: ["Sensor sensitivity too high", "Condensation buildup on sensor", "Electromagnetic interference"],
    solutions: ["Adjust sensor sensitivity settings.", "Clean and dry the sensor area.", "Ensure proper grounding and shielding."],
  },
  {
    id: "4",
    title: "Intermittent Connectivity",
    description: "Sensor drops connection randomly and then reconnects.",
    imageUrl: "https://picsum.photos/seed/intermittent/600/400",
    potentialCauses: ["Weak Wi-Fi/GSM signal", "Network congestion", "Router issues", "Firmware bugs"],
    solutions: ["Move sensor closer to router or use signal booster.", "Check network for other high-bandwidth devices.", "Restart router.", "Update sensor/controller firmware."],
  }
];

export default function IssuesPage() {
  // In a real app, you'd fetch and filter issues.
  // For now, we'll just display all mock issues.
  const issues = mockIssues;

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Common Troubleshooting Guides"
        description="Find solutions to frequently encountered sensor and device issues."
      />
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input type="search" placeholder="Search issues..." className="pl-10 w-full md:w-1/2 lg:w-1/3" />
      </div>
      {issues.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">No common issues found. Try a different search term.</p>
      )}
    </div>
  );
}
