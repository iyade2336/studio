
"use client";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit3, Trash2, Search, Image as ImageIcon, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import NextImage from "next/image"; // Renamed to avoid conflict
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
import { useToast } from "@/hooks/use-toast";


const initialMockIssues: Issue[] = [
  {
    id: "1",
    title: "Sensor Offline",
    description: "The sensor is not reporting any data to the dashboard.",
    imageUrl: "https://placehold.co/80x60.png",
    potentialCauses: ["Power supply issue", "Network connectivity problem"],
    solutions: ["Check power cable.", "Verify Wi-Fi/GSM connection."],
  },
  {
    id: "2",
    title: "Inaccurate Temperature",
    description: "Temperature values are consistently off.",
    imageUrl: "https://placehold.co/80x60.png",
    potentialCauses: ["Sensor miscalibration", "Sensor placement issue"],
    solutions: ["Recalibrate sensor.", "Relocate sensor."],
  },
];


export default function AdminManageIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>(initialMockIssues);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIssue, setCurrentIssue] = useState<Partial<Issue> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleAddNew = () => {
    setCurrentIssue({imageUrl: 'https://placehold.co/600x400.png'});
    setIsModalOpen(true);
  };

  const handleEdit = (issue: Issue) => {
    setCurrentIssue(issue);
    setIsModalOpen(true);
  };
  
  const handleDelete = (issueId: string) => {
    // Add confirmation dialog in real app
    setIssues(issues.filter(issue => issue.id !== issueId));
    toast({title: "Issue Deleted", description: "The issue has been removed from the list."});
  };

  const handleSaveIssue = () => {
    if (currentIssue) {
      if (currentIssue.id) { 
        setIssues(issues.map(iss => iss.id === currentIssue!.id ? currentIssue as Issue : iss));
        toast({title: "Issue Updated", description: `Issue "${currentIssue.title}" has been updated.`});
      } else { 
        const newIssue = { 
            ...currentIssue, 
            id: `iss_${Date.now()}`,
            imageUrl: currentIssue.imageUrl || 'https://placehold.co/600x400.png',
            potentialCauses: currentIssue.potentialCauses || [],
            solutions: currentIssue.solutions || [],
        } as Issue;
        setIssues([...issues, newIssue]);
        toast({title: "Issue Added", description: `New issue "${newIssue.title}" has been added.`});
      }
    }
    setIsModalOpen(false);
    setCurrentIssue(null);
  };

  const filteredIssues = issues.filter(issue => 
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadIssuesCSV = () => {
    const headers = ["ID", "Title", "Description", "Image URL", "Potential Causes", "Solutions"];
    const csvRows = [
        headers.join(','),
        ...filteredIssues.map(i => [
            i.id,
            `"${i.title.replace(/"/g, '""')}"`, // Escape quotes
            `"${i.description.replace(/"/g, '""')}"`,
            i.imageUrl,
            `"${i.potentialCauses.join('; ').replace(/"/g, '""')}"`, // Join array and escape quotes
            `"${i.solutions.join('; ').replace(/"/g, '""')}"`
        ].join(','))
    ];
    const csvString = csvRows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `iot_guardian_issues_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    toast({ title: "Issues CSV Exported", description: "Common issues data has been downloaded."});
  };


  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Manage Common Issues"
        description="Add, edit, or remove troubleshooting guides for common device problems."
      >
        <div className="flex gap-2">
          <Button onClick={downloadIssuesCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" /> Download CSV
          </Button>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Issue
          </Button>
        </div>
      </PageHeader>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search issues..."
            className="w-full rounded-lg bg-background pl-8 md:w-[300px] lg:w-[400px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIssues.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell>
                  <NextImage // Use NextImage
                    src={issue.imageUrl || "https://placehold.co/80x60.png"}
                    alt={issue.title}
                    width={64}
                    height={48}
                    className="rounded aspect-[4/3] object-cover"
                    data-ai-hint="device issue"
                    unoptimized={issue.imageUrl?.includes("picsum.photos")} // Add this if using picsum for dev
                  />
                </TableCell>
                <TableCell className="font-medium">{issue.title}</TableCell>
                <TableCell className="max-w-xs truncate">{issue.description}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(issue)} className="mr-2 hover:text-accent">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(issue.id)} className="text-destructive hover:text-destructive/80">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
             {filteredIssues.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
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
              <Input id="imageUrl" value={currentIssue?.imageUrl || ''} onChange={(e) => setCurrentIssue({...currentIssue, imageUrl: e.target.value})} className="col-span-3" placeholder="https://placehold.co/600x400.png"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="imageUpload" className="text-right self-start pt-2">Upload Image</Label>
               <div className="col-span-3">
                <Input id="imageUpload" type="file" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" disabled/>
                <p className="text-xs text-muted-foreground mt-1">Alternatively, provide an Image URL above. (File upload not implemented yet)</p>
               </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="potentialCauses" className="text-right pt-2">Potential Causes</Label>
              <Textarea id="potentialCauses" value={currentIssue?.potentialCauses?.join('\n') || ''} onChange={(e) => setCurrentIssue({...currentIssue, potentialCauses: e.target.value.split('\n').filter(c => c.trim() !== '')})} className="col-span-3 min-h-[80px]" placeholder="One cause per line"/>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="solutions" className="text-right pt-2">Solutions</Label>
              <Textarea id="solutions" value={currentIssue?.solutions?.join('\n') || ''} onChange={(e) => setCurrentIssue({...currentIssue, solutions: e.target.value.split('\n').filter(s => s.trim() !== '')})} className="col-span-3 min-h-[80px]" placeholder="One solution per line"/>
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
