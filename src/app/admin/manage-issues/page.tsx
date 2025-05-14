
"use client";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit3, Trash2, Search, Download, CalendarDays } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from 'react';
import type { Issue } from "@/components/issues/issue-card";
import { format } from 'date-fns';

const initialMockIssues: Issue[] = [
  {
    id: "1",
    title: "Sensor Offline",
    description: "The sensor is not reporting any data to the dashboard.",
    imageUrl: "https://picsum.photos/seed/offline/80/60",
    potentialCauses: ["Power supply issue", "Network connectivity problem"],
    solutions: ["Check power cable.", "Verify Wi-Fi/GSM connection."],
    reportedDate: "2023-10-01T10:00:00Z",
  },
  {
    id: "2",
    title: "Inaccurate Temperature",
    description: "Temperature values are consistently off.",
    imageUrl: "httpsum.photos/seed/temp/80/60",
    potentialCauses: ["Sensor miscalibration", "Sensor placement issue"],
    solutions: ["Recalibrate sensor.", "Relocate sensor."],
    reportedDate: "2023-11-15T14:30:00Z",
  },
  {
    id: "3",
    title: "Water Leak False Alarm",
    description: "System triggers water leak alert without actual leak.",
    imageUrl: "httpsum.photos/seed/water/80/60",
    potentialCauses: ["High sensor sensitivity", "Condensation"],
    solutions: ["Adjust sensitivity.", "Clean sensor."],
    reportedDate: "2023-12-05T09:15:00Z",
  }
];


export default function AdminManageIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>(initialMockIssues);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIssue, setCurrentIssue] = useState<Partial<Issue> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddNew = () => {
    setCurrentIssue({ reportedDate: new Date().toISOString() });
    setIsModalOpen(true);
  };

  const handleEdit = (issue: Issue) => {
    setCurrentIssue(issue);
    setIsModalOpen(true);
  };
  
  const handleDelete = (issueId: string) => {
    setIssues(issues.filter(issue => issue.id !== issueId));
  };

  const handleSaveIssue = () => {
    if (currentIssue) {
      if (currentIssue.id) {
        setIssues(issues.map(iss => iss.id === currentIssue!.id ? currentIssue as Issue : iss));
      } else {
        const newIssue = { 
          ...currentIssue, 
          id: `iss_${Date.now()}`,
          potentialCauses: currentIssue.potentialCauses || [],
          solutions: currentIssue.solutions || [],
          imageUrl: currentIssue.imageUrl || 'https://picsum.photos/seed/newissue/80/60',
          reportedDate: currentIssue.reportedDate || new Date().toISOString(),
        } as Issue;
        setIssues([...issues, newIssue]);
      }
    }
    setIsModalOpen(false);
    setCurrentIssue(null);
  };

  const filteredIssues = issues.filter(issue => 
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = (dataToExport: Issue[], filenamePrefix: string) => {
    const header = ["ID", "Title", "Description", "Image URL", "Potential Causes", "Solutions", "Reported Date"];
    const csvRows = [
      header.join(','),
      ...dataToExport.map(issue => [
        issue.id,
        `"${issue.title.replace(/"/g, '""')}"`,
        `"${issue.description.replace(/"/g, '""')}"`,
        issue.imageUrl,
        `"${issue.potentialCauses.join('; ').replace(/"/g, '""')}"`,
        `"${issue.solutions.join('; ').replace(/"/g, '""')}"`,
        issue.reportedDate ? format(new Date(issue.reportedDate), 'yyyy-MM-dd HH:mm:ss') : ''
      ].join(','))
    ];
    const csvString = csvRows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filenamePrefix}_issues_${format(new Date(), 'yyyyMMdd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExportWeekly = () => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyIssues = issues.filter(issue => issue.reportedDate && new Date(issue.reportedDate) >= oneWeekAgo);
    exportToCSV(weeklyIssues, 'weekly');
  };

  const handleExportMonthly = () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const monthlyIssues = issues.filter(issue => issue.reportedDate && new Date(issue.reportedDate) >= oneMonthAgo);
    exportToCSV(monthlyIssues, 'monthly');
  };


  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Manage Common Issues"
        description="Add, edit, or remove troubleshooting guides for common device problems."
      >
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Issue
        </Button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:w-auto sm:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search issues..."
            className="w-full rounded-lg bg-background pl-8 md:w-[300px] lg:w-[400px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportWeekly}>
            <Download className="mr-2 h-4 w-4" /> Export Weekly
          </Button>
          <Button variant="outline" onClick={handleExportMonthly}>
            <Download className="mr-2 h-4 w-4" /> Export Monthly
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Reported</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIssues.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell>
                  <Image
                    src={issue.imageUrl}
                    alt={issue.title}
                    width={64}
                    height={48}
                    className="rounded aspect-[4/3] object-cover"
                    data-ai-hint="device issue"
                  />
                </TableCell>
                <TableCell className="font-medium">{issue.title}</TableCell>
                <TableCell className="max-w-xs truncate">{issue.description}</TableCell>
                <TableCell>
                  {issue.reportedDate ? format(new Date(issue.reportedDate), 'PP') : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(issue)} className="mr-2">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(issue.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
             {filteredIssues.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  No issues found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentIssue?.id ? "Edit Issue" : "Add New Issue"}</DialogTitle>
            <DialogDescription>
              Fill in the details for the troubleshooting guide. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input id="title" value={currentIssue?.title || ''} onChange={(e) => setCurrentIssue({...currentIssue, title: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea id="description" value={currentIssue?.description || ''} onChange={(e) => setCurrentIssue({...currentIssue, description: e.target.value})} className="col-span-3 min-h-[80px]" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
              <Input id="imageUrl" value={currentIssue?.imageUrl || ''} onChange={(e) => setCurrentIssue({...currentIssue, imageUrl: e.target.value})} className="col-span-3" placeholder="https://picsum.photos/seed/example/600/400"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="reportedDate" className="text-right">Reported Date</Label>
               <Input 
                id="reportedDate" 
                type="date" 
                value={currentIssue?.reportedDate ? format(new Date(currentIssue.reportedDate), 'yyyy-MM-dd') : ''} 
                onChange={(e) => setCurrentIssue({...currentIssue, reportedDate: new Date(e.target.value).toISOString()})} 
                className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="potentialCauses" className="text-right pt-2">Potential Causes</Label>
              <Textarea id="potentialCauses" value={Array.isArray(currentIssue?.potentialCauses) ? currentIssue.potentialCauses.join('\n') : ''} onChange={(e) => setCurrentIssue({...currentIssue, potentialCauses: e.target.value.split('\n')})} className="col-span-3 min-h-[80px]" placeholder="One cause per line"/>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="solutions" className="text-right pt-2">Solutions</Label>
              <Textarea id="solutions" value={Array.isArray(currentIssue?.solutions) ? currentIssue.solutions.join('\n') : ''} onChange={(e) => setCurrentIssue({...currentIssue, solutions: e.target.value.split('\n')})} className="col-span-3 min-h-[80px]" placeholder="One solution per line"/>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleSaveIssue}>Save Issue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
