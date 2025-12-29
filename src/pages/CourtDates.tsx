import { useState } from "react";
import { format, parseISO, isPast, isToday, isTomorrow, addDays, differenceInDays } from "date-fns";
import {
  Gavel,
  Plus,
  Search,
  Calendar,
  Clock,
  MapPin,
  Bell,
  BellOff,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Briefcase,
  User,
  FileText,
  ChevronRight,
  Filter,
} from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface CourtDate {
  id: string;
  title: string;
  caseId: string;
  caseName: string;
  caseNumber: string;
  date: string;
  time: string;
  endTime?: string;
  courtName: string;
  courtRoom: string;
  address: string;
  judge?: string;
  type: "hearing" | "trial" | "motion" | "conference" | "deposition" | "arraignment" | "sentencing";
  status: "scheduled" | "completed" | "postponed" | "cancelled";
  notes?: string;
  reminder: boolean;
  reminderDays: number;
  documents: string[];
  attendees: string[];
}

interface Case {
  id: string;
  name: string;
  caseNumber: string;
  client: string;
}

const mockCases: Case[] = [
  { id: "1", name: "Smith vs. Johnson Corporation", caseNumber: "CASE-2024-001", client: "John Smith" },
  { id: "2", name: "Estate of Williams", caseNumber: "CASE-2024-002", client: "Williams Family Trust" },
  { id: "3", name: "Thompson Criminal Defense", caseNumber: "CASE-2024-003", client: "Robert Thompson" },
  { id: "4", name: "Garcia Immigration Appeal", caseNumber: "CASE-2024-004", client: "Maria Garcia" },
  { id: "5", name: "Chen Contract Dispute", caseNumber: "CASE-2024-005", client: "Chen Enterprises LLC" },
];

const hearingTypes = [
  { value: "hearing", label: "Hearing" },
  { value: "trial", label: "Trial" },
  { value: "motion", label: "Motion Hearing" },
  { value: "conference", label: "Conference" },
  { value: "deposition", label: "Deposition" },
  { value: "arraignment", label: "Arraignment" },
  { value: "sentencing", label: "Sentencing" },
];

const initialCourtDates: CourtDate[] = [
  {
    id: "1",
    title: "Preliminary Hearing",
    caseId: "1",
    caseName: "Smith vs. Johnson Corporation",
    caseNumber: "CASE-2024-001",
    date: "2024-12-30",
    time: "09:00",
    endTime: "11:00",
    courtName: "District Court of New York",
    courtRoom: "Room 204",
    address: "60 Centre Street, New York, NY 10007",
    judge: "Hon. Patricia Williams",
    type: "hearing",
    status: "scheduled",
    notes: "Bring all original contract documents. Opposing counsel: James Richardson.",
    reminder: true,
    reminderDays: 3,
    documents: ["Contract Agreement.pdf", "Evidence Summary.docx"],
    attendees: ["Sarah Mitchell", "John Smith"],
  },
  {
    id: "2",
    title: "Criminal Trial - Day 1",
    caseId: "3",
    caseName: "Thompson Criminal Defense",
    caseNumber: "CASE-2024-003",
    date: "2025-01-02",
    time: "10:00",
    endTime: "16:00",
    courtName: "Criminal Court of Illinois",
    courtRoom: "Courtroom 5A",
    address: "2650 S California Ave, Chicago, IL 60608",
    judge: "Hon. Michael Chen",
    type: "trial",
    status: "scheduled",
    notes: "Full day trial. Jury selection completed. 6 witnesses scheduled.",
    reminder: true,
    reminderDays: 7,
    documents: ["Witness List.pdf", "Evidence Photos.zip", "Expert Report.pdf"],
    attendees: ["Sarah Mitchell", "James Wilson", "Robert Thompson"],
  },
  {
    id: "3",
    title: "Immigration Appeal Hearing",
    caseId: "4",
    caseName: "Garcia Immigration Appeal",
    caseNumber: "CASE-2024-004",
    date: "2025-01-06",
    time: "11:00",
    courtName: "Federal Immigration Court",
    courtRoom: "Room 101",
    address: "333 S Miami Ave, Miami, FL 33130",
    judge: "Hon. Robert Martinez",
    type: "hearing",
    status: "scheduled",
    notes: "Appeal hearing for visa denial. Interpreter required.",
    reminder: true,
    reminderDays: 5,
    documents: ["Visa Application.pdf", "Supporting Documents.pdf"],
    attendees: ["Lisa Rodriguez", "Maria Garcia"],
  },
  {
    id: "4",
    title: "Motion to Dismiss Hearing",
    caseId: "1",
    caseName: "Smith vs. Johnson Corporation",
    caseNumber: "CASE-2024-001",
    date: "2025-01-10",
    time: "14:00",
    courtName: "District Court of New York",
    courtRoom: "Room 204",
    address: "60 Centre Street, New York, NY 10007",
    judge: "Hon. Patricia Williams",
    type: "motion",
    status: "scheduled",
    reminder: true,
    reminderDays: 3,
    documents: ["Motion to Dismiss.pdf"],
    attendees: ["Sarah Mitchell"],
  },
  {
    id: "5",
    title: "Probate Conference",
    caseId: "2",
    caseName: "Estate of Williams",
    caseNumber: "CASE-2024-002",
    date: "2025-01-15",
    time: "10:30",
    courtName: "Probate Court of Los Angeles",
    courtRoom: "Room 302",
    address: "111 N Hill St, Los Angeles, CA 90012",
    judge: "Hon. Sandra Lee",
    type: "conference",
    status: "scheduled",
    notes: "Status conference for probate proceedings.",
    reminder: true,
    reminderDays: 2,
    documents: ["Estate Inventory.xlsx"],
    attendees: ["Emily Chen"],
  },
  {
    id: "6",
    title: "Settlement Conference",
    caseId: "5",
    caseName: "Chen Contract Dispute",
    caseNumber: "CASE-2024-005",
    date: "2024-06-15",
    time: "09:00",
    courtName: "Superior Court of California",
    courtRoom: "Room 401",
    address: "400 McAllister St, San Francisco, CA 94102",
    judge: "Hon. David Kim",
    type: "conference",
    status: "completed",
    notes: "Settlement reached. Case closed.",
    reminder: false,
    reminderDays: 0,
    documents: ["Settlement Agreement.pdf"],
    attendees: ["Sarah Mitchell", "Chen Enterprises Rep"],
  },
];

const typeConfig = {
  hearing: { label: "Hearing", className: "bg-info/20 text-info border-info/30" },
  trial: { label: "Trial", className: "bg-destructive/20 text-destructive border-destructive/30" },
  motion: { label: "Motion", className: "bg-warning/20 text-warning border-warning/30" },
  conference: { label: "Conference", className: "bg-primary/20 text-primary border-primary/30" },
  deposition: { label: "Deposition", className: "bg-muted text-muted-foreground border-border" },
  arraignment: { label: "Arraignment", className: "bg-destructive/20 text-destructive border-destructive/30" },
  sentencing: { label: "Sentencing", className: "bg-destructive/20 text-destructive border-destructive/30" },
};

const statusConfig = {
  scheduled: { label: "Scheduled", className: "bg-success/20 text-success border-success/30" },
  completed: { label: "Completed", className: "bg-muted text-muted-foreground border-border" },
  postponed: { label: "Postponed", className: "bg-warning/20 text-warning border-warning/30" },
  cancelled: { label: "Cancelled", className: "bg-destructive/20 text-destructive border-destructive/30" },
};

const CourtDates = () => {
  const [courtDates, setCourtDates] = useState<CourtDate[]>(initialCourtDates);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCase, setSelectedCase] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCourtDate, setSelectedCourtDate] = useState<CourtDate | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    caseId: "",
    date: "",
    time: "",
    endTime: "",
    courtName: "",
    courtRoom: "",
    address: "",
    judge: "",
    type: "hearing" as CourtDate["type"],
    status: "scheduled" as CourtDate["status"],
    notes: "",
    reminder: true,
    reminderDays: 3,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      caseId: "",
      date: "",
      time: "",
      endTime: "",
      courtName: "",
      courtRoom: "",
      address: "",
      judge: "",
      type: "hearing",
      status: "scheduled",
      notes: "",
      reminder: true,
      reminderDays: 3,
    });
  };

  const handleAddCourtDate = () => {
    if (!formData.title || !formData.caseId || !formData.date || !formData.time || !formData.courtName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const selectedCaseData = mockCases.find((c) => c.id === formData.caseId);
    if (!selectedCaseData) return;

    const newCourtDate: CourtDate = {
      id: Date.now().toString(),
      title: formData.title,
      caseId: formData.caseId,
      caseName: selectedCaseData.name,
      caseNumber: selectedCaseData.caseNumber,
      date: formData.date,
      time: formData.time,
      endTime: formData.endTime || undefined,
      courtName: formData.courtName,
      courtRoom: formData.courtRoom,
      address: formData.address,
      judge: formData.judge || undefined,
      type: formData.type,
      status: formData.status,
      notes: formData.notes || undefined,
      reminder: formData.reminder,
      reminderDays: formData.reminderDays,
      documents: [],
      attendees: [],
    };

    setCourtDates([newCourtDate, ...courtDates]);
    setIsAddOpen(false);
    resetForm();
    toast({
      title: "Court Date Added",
      description: `${newCourtDate.title} scheduled for ${format(parseISO(newCourtDate.date), "MMMM d, yyyy")}.`,
    });
  };

  const handleUpdateCourtDate = () => {
    if (!selectedCourtDate) return;

    const selectedCaseData = mockCases.find((c) => c.id === formData.caseId);
    if (!selectedCaseData) return;

    const updatedCourtDates = courtDates.map((cd) =>
      cd.id === selectedCourtDate.id
        ? {
            ...cd,
            ...formData,
            caseName: selectedCaseData.name,
            caseNumber: selectedCaseData.caseNumber,
          }
        : cd
    );

    setCourtDates(updatedCourtDates);
    setIsEditOpen(false);
    setSelectedCourtDate(null);
    resetForm();
    toast({
      title: "Court Date Updated",
      description: "The court date has been updated successfully.",
    });
  };

  const handleDeleteCourtDate = (id: string) => {
    setCourtDates(courtDates.filter((cd) => cd.id !== id));
    toast({
      title: "Court Date Deleted",
      description: "The court date has been removed.",
    });
  };

  const toggleReminder = (id: string) => {
    setCourtDates(
      courtDates.map((cd) =>
        cd.id === id ? { ...cd, reminder: !cd.reminder } : cd
      )
    );
    const courtDate = courtDates.find((cd) => cd.id === id);
    toast({
      title: courtDate?.reminder ? "Reminder Disabled" : "Reminder Enabled",
      description: courtDate?.reminder
        ? "You will no longer receive reminders for this court date."
        : "You will receive reminders for this court date.",
    });
  };

  const openEditDialog = (courtDate: CourtDate) => {
    setSelectedCourtDate(courtDate);
    setFormData({
      title: courtDate.title,
      caseId: courtDate.caseId,
      date: courtDate.date,
      time: courtDate.time,
      endTime: courtDate.endTime || "",
      courtName: courtDate.courtName,
      courtRoom: courtDate.courtRoom,
      address: courtDate.address,
      judge: courtDate.judge || "",
      type: courtDate.type,
      status: courtDate.status,
      notes: courtDate.notes || "",
      reminder: courtDate.reminder,
      reminderDays: courtDate.reminderDays,
    });
    setIsEditOpen(true);
  };

  const openViewDialog = (courtDate: CourtDate) => {
    setSelectedCourtDate(courtDate);
    setIsViewOpen(true);
  };

  const filteredCourtDates = courtDates.filter((cd) => {
    const matchesSearch =
      cd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cd.caseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cd.courtName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCase = selectedCase === "all" || cd.caseId === selectedCase;
    const matchesType = selectedType === "all" || cd.type === selectedType;
    const matchesStatus = selectedStatus === "all" || cd.status === selectedStatus;
    return matchesSearch && matchesCase && matchesType && matchesStatus;
  });

  const upcomingDates = filteredCourtDates
    .filter((cd) => cd.status === "scheduled" && !isPast(parseISO(cd.date)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastDates = filteredCourtDates
    .filter((cd) => cd.status !== "scheduled" || isPast(parseISO(cd.date)))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const urgentDates = upcomingDates.filter((cd) => {
    const daysUntil = differenceInDays(parseISO(cd.date), new Date());
    return daysUntil <= 7 && daysUntil >= 0;
  });

  const getUrgencyBadge = (date: string) => {
    const dateObj = parseISO(date);
    if (isToday(dateObj)) return { label: "Today", className: "bg-destructive text-destructive-foreground" };
    if (isTomorrow(dateObj)) return { label: "Tomorrow", className: "bg-warning text-warning-foreground" };
    const daysUntil = differenceInDays(dateObj, new Date());
    if (daysUntil <= 3) return { label: `${daysUntil} days`, className: "bg-warning/20 text-warning" };
    if (daysUntil <= 7) return { label: `${daysUntil} days`, className: "bg-info/20 text-info" };
    return null;
  };

  const stats = {
    total: courtDates.length,
    upcoming: upcomingDates.length,
    urgent: urgentDates.length,
    thisMonth: courtDates.filter((cd) => {
      const date = parseISO(cd.date);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
  };

  const CourtDateForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="e.g., Preliminary Hearing"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Case *</Label>
          <Select value={formData.caseId} onValueChange={(v) => setFormData({ ...formData, caseId: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select case" />
            </SelectTrigger>
            <SelectContent>
              {mockCases.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Type *</Label>
          <Select value={formData.type} onValueChange={(v: CourtDate["type"]) => setFormData({ ...formData, type: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {hearingTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Start Time *</Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="courtName">Court Name *</Label>
          <Input
            id="courtName"
            placeholder="e.g., District Court of New York"
            value={formData.courtName}
            onChange={(e) => setFormData({ ...formData, courtName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="courtRoom">Courtroom</Label>
          <Input
            id="courtRoom"
            placeholder="e.g., Room 204"
            value={formData.courtRoom}
            onChange={(e) => setFormData({ ...formData, courtRoom: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          placeholder="Full court address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="judge">Judge</Label>
          <Input
            id="judge"
            placeholder="e.g., Hon. Patricia Williams"
            value={formData.judge}
            onChange={(e) => setFormData({ ...formData, judge: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(v: CourtDate["status"]) => setFormData({ ...formData, status: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="postponed">Postponed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes, preparation reminders..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-primary" />
          <div>
            <p className="font-medium text-foreground">Reminder</p>
            <p className="text-sm text-muted-foreground">Get notified before this court date</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={formData.reminderDays.toString()}
            onValueChange={(v) => setFormData({ ...formData, reminderDays: parseInt(v) })}
            disabled={!formData.reminder}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 day</SelectItem>
              <SelectItem value="2">2 days</SelectItem>
              <SelectItem value="3">3 days</SelectItem>
              <SelectItem value="5">5 days</SelectItem>
              <SelectItem value="7">7 days</SelectItem>
            </SelectContent>
          </Select>
          <Switch
            checked={formData.reminder}
            onCheckedChange={(checked) => setFormData({ ...formData, reminder: checked })}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            isEdit ? setIsEditOpen(false) : setIsAddOpen(false);
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button
          className="flex-1 gradient-gold text-primary-foreground"
          onClick={isEdit ? handleUpdateCourtDate : handleAddCourtDate}
        >
          {isEdit ? "Update" : "Add Court Date"}
        </Button>
      </div>
    </div>
  );

  const CourtDateCard = ({ courtDate }: { courtDate: CourtDate }) => {
    const urgency = getUrgencyBadge(courtDate.date);
    return (
      <div className="glass-card p-5 hover:border-primary/30 transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/20">
              <Gavel className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{courtDate.title}</h3>
              <p className="text-sm text-muted-foreground">{courtDate.caseNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {urgency && courtDate.status === "scheduled" && (
              <Badge className={urgency.className}>{urgency.label}</Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border">
                <DropdownMenuItem onClick={() => openViewDialog(courtDate)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openEditDialog(courtDate)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleReminder(courtDate.id)}>
                  {courtDate.reminder ? (
                    <>
                      <BellOff className="w-4 h-4 mr-2" />
                      Disable Reminder
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4 mr-2" />
                      Enable Reminder
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => handleDeleteCourtDate(courtDate.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">
              {format(parseISO(courtDate.date), "EEEE, MMMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              {courtDate.time}
              {courtDate.endTime && ` - ${courtDate.endTime}`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{courtDate.courtName}, {courtDate.courtRoom}</span>
          </div>
          {courtDate.judge && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{courtDate.judge}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <Badge className={cn("font-normal", typeConfig[courtDate.type].className)}>
              {typeConfig[courtDate.type].label}
            </Badge>
            <Badge className={cn("font-normal", statusConfig[courtDate.status].className)}>
              {statusConfig[courtDate.status].label}
            </Badge>
          </div>
          {courtDate.reminder && courtDate.status === "scheduled" && (
            <Bell className="w-4 h-4 text-primary" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">Court Dates</h1>
                <p className="text-muted-foreground mt-1">Manage hearings, trials, and court appearances</p>
              </div>
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-gold text-primary-foreground shadow-gold">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Court Date
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl">Schedule Court Date</DialogTitle>
                  </DialogHeader>
                  <CourtDateForm />
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Gavel className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total Dates</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/20">
                    <Calendar className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.upcoming}</p>
                    <p className="text-sm text-muted-foreground">Upcoming</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/20">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.urgent}</p>
                    <p className="text-sm text-muted-foreground">Within 7 Days</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-info/20">
                    <Clock className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.thisMonth}</p>
                    <p className="text-sm text-muted-foreground">This Month</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Urgent Alert */}
            {urgentDates.length > 0 && (
              <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/10">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <h3 className="font-semibold text-foreground">Upcoming Court Dates</h3>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {urgentDates.slice(0, 3).map((cd) => (
                    <button
                      key={cd.id}
                      onClick={() => openViewDialog(cd)}
                      className="flex items-center gap-3 p-3 bg-background/50 rounded-lg text-left hover:bg-background/80 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{cd.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(cd.date), "MMM d")} at {cd.time}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="glass-card p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search court dates..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedCase} onValueChange={setSelectedCase}>
                  <SelectTrigger className="w-full sm:w-56">
                    <SelectValue placeholder="Filter by case" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cases</SelectItem>
                    {mockCases.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {hearingTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="postponed">Postponed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs defaultValue="upcoming" className="space-y-6">
              <TabsList className="bg-secondary/50">
                <TabsTrigger value="upcoming">Upcoming ({upcomingDates.length})</TabsTrigger>
                <TabsTrigger value="past">Past & Completed ({pastDates.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingDates.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {upcomingDates.map((cd) => (
                      <CourtDateCard key={cd.id} courtDate={cd} />
                    ))}
                  </div>
                ) : (
                  <div className="glass-card p-12 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto text-success/50 mb-3" />
                    <p className="text-muted-foreground">No upcoming court dates.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-4">
                {pastDates.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {pastDates.map((cd) => (
                      <CourtDateCard key={cd.id} courtDate={cd} />
                    ))}
                  </div>
                ) : (
                  <div className="glass-card p-12 text-center">
                    <Gavel className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No past court dates.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Edit Court Date</DialogTitle>
          </DialogHeader>
          <CourtDateForm isEdit />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          {selectedCourtDate && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-destructive/20">
                    <Gavel className="w-6 h-6 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="font-display text-xl">{selectedCourtDate.title}</DialogTitle>
                    <p className="text-muted-foreground mt-1">{selectedCourtDate.caseName}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge className={cn(typeConfig[selectedCourtDate.type].className)}>
                        {typeConfig[selectedCourtDate.type].label}
                      </Badge>
                      <Badge className={cn(statusConfig[selectedCourtDate.status].className)}>
                        {statusConfig[selectedCourtDate.status].label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-primary" />
                      <p className="text-sm text-muted-foreground">Date</p>
                    </div>
                    <p className="font-medium text-foreground">
                      {format(parseISO(selectedCourtDate.date), "EEEE, MMMM d, yyyy")}
                    </p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-primary" />
                      <p className="text-sm text-muted-foreground">Time</p>
                    </div>
                    <p className="font-medium text-foreground">
                      {selectedCourtDate.time}
                      {selectedCourtDate.endTime && ` - ${selectedCourtDate.endTime}`}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-primary" />
                    <p className="text-sm text-muted-foreground">Location</p>
                  </div>
                  <p className="font-medium text-foreground">{selectedCourtDate.courtName}</p>
                  <p className="text-muted-foreground">{selectedCourtDate.courtRoom}</p>
                  {selectedCourtDate.address && (
                    <p className="text-sm text-muted-foreground mt-1">{selectedCourtDate.address}</p>
                  )}
                </div>

                {selectedCourtDate.judge && (
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-primary" />
                      <p className="text-sm text-muted-foreground">Presiding Judge</p>
                    </div>
                    <p className="font-medium text-foreground">{selectedCourtDate.judge}</p>
                  </div>
                )}

                {selectedCourtDate.notes && (
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-primary" />
                      <p className="text-sm text-muted-foreground">Notes</p>
                    </div>
                    <p className="text-foreground">{selectedCourtDate.notes}</p>
                  </div>
                )}

                {selectedCourtDate.documents.length > 0 && (
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <p className="text-sm text-muted-foreground">Related Documents</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCourtDate.documents.map((doc, i) => (
                        <Badge key={i} variant="outline" className="font-normal">
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCourtDate.reminder && (
                  <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <Bell className="w-5 h-5 text-primary" />
                    <p className="text-foreground">
                      Reminder set for {selectedCourtDate.reminderDays} day{selectedCourtDate.reminderDays > 1 ? "s" : ""} before
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setIsViewOpen(false)}>
                    Close
                  </Button>
                  <Button
                    className="flex-1 gradient-gold text-primary-foreground"
                    onClick={() => {
                      setIsViewOpen(false);
                      openEditDialog(selectedCourtDate);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourtDates;
