import { useState } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, parseISO, startOfMonth, endOfMonth } from "date-fns";
import {
  Clock,
  Plus,
  Play,
  Pause,
  Square,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Briefcase,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface TimeEntry {
  id: string;
  caseId: string;
  caseName: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  hourlyRate: number;
  billable: boolean;
  status: "pending" | "approved" | "billed";
}

interface Case {
  id: string;
  name: string;
  client: string;
  hourlyRate: number;
}

const mockCases: Case[] = [
  { id: "1", name: "Smith vs. Johnson Corporation", client: "John Smith", hourlyRate: 350 },
  { id: "2", name: "Estate of Williams", client: "Williams Family Trust", hourlyRate: 275 },
  { id: "3", name: "Thompson Criminal Defense", client: "Robert Thompson", hourlyRate: 450 },
  { id: "4", name: "Garcia Immigration Appeal", client: "Maria Garcia", hourlyRate: 300 },
  { id: "5", name: "Chen Contract Dispute", client: "Chen Enterprises LLC", hourlyRate: 325 },
];

const initialEntries: TimeEntry[] = [
  {
    id: "1",
    caseId: "1",
    caseName: "Smith vs. Johnson Corporation",
    description: "Document review and case preparation",
    date: "2024-12-28",
    startTime: "09:00",
    endTime: "11:30",
    duration: 150,
    hourlyRate: 350,
    billable: true,
    status: "approved",
  },
  {
    id: "2",
    caseId: "3",
    caseName: "Thompson Criminal Defense",
    description: "Client meeting and strategy discussion",
    date: "2024-12-28",
    startTime: "14:00",
    endTime: "16:00",
    duration: 120,
    hourlyRate: 450,
    billable: true,
    status: "approved",
  },
  {
    id: "3",
    caseId: "2",
    caseName: "Estate of Williams",
    description: "Probate filing preparation",
    date: "2024-12-27",
    startTime: "10:00",
    endTime: "12:00",
    duration: 120,
    hourlyRate: 275,
    billable: true,
    status: "billed",
  },
  {
    id: "4",
    caseId: "1",
    caseName: "Smith vs. Johnson Corporation",
    description: "Court appearance preparation",
    date: "2024-12-27",
    startTime: "13:00",
    endTime: "15:30",
    duration: 150,
    hourlyRate: 350,
    billable: true,
    status: "pending",
  },
  {
    id: "5",
    caseId: "4",
    caseName: "Garcia Immigration Appeal",
    description: "Research and documentation",
    date: "2024-12-26",
    startTime: "09:00",
    endTime: "11:00",
    duration: 120,
    hourlyRate: 300,
    billable: true,
    status: "approved",
  },
  {
    id: "6",
    caseId: "5",
    caseName: "Chen Contract Dispute",
    description: "Contract analysis",
    date: "2024-12-26",
    startTime: "14:00",
    endTime: "16:30",
    duration: 150,
    hourlyRate: 325,
    billable: true,
    status: "billed",
  },
  {
    id: "7",
    caseId: "3",
    caseName: "Thompson Criminal Defense",
    description: "Evidence review",
    date: "2024-12-25",
    startTime: "09:00",
    endTime: "12:00",
    duration: 180,
    hourlyRate: 450,
    billable: true,
    status: "billed",
  },
];

const statusConfig = {
  pending: { label: "Pending", className: "bg-warning/20 text-warning border-warning/30" },
  approved: { label: "Approved", className: "bg-success/20 text-success border-success/30" },
  billed: { label: "Billed", className: "bg-primary/20 text-primary border-primary/30" },
};

const TimeTracking = () => {
  const [entries, setEntries] = useState<TimeEntry[]>(initialEntries);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedCase, setSelectedCase] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  
  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerCaseId, setTimerCaseId] = useState("");
  const [timerDescription, setTimerDescription] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    caseId: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "",
    endTime: "",
    billable: true,
  });

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTimerDisplay = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const calculateAmount = (minutes: number, rate: number) => {
    return (minutes / 60) * rate;
  };

  const handleAddEntry = () => {
    if (!formData.caseId || !formData.startTime || !formData.endTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const selectedCaseData = mockCases.find((c) => c.id === formData.caseId);
    if (!selectedCaseData) return;

    const start = new Date(`${formData.date}T${formData.startTime}`);
    const end = new Date(`${formData.date}T${formData.endTime}`);
    const duration = Math.round((end.getTime() - start.getTime()) / 60000);

    if (duration <= 0) {
      toast({
        title: "Invalid Time Range",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      caseId: formData.caseId,
      caseName: selectedCaseData.name,
      description: formData.description,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      duration,
      hourlyRate: selectedCaseData.hourlyRate,
      billable: formData.billable,
      status: "pending",
    };

    setEntries([newEntry, ...entries]);
    setIsAddOpen(false);
    setFormData({
      caseId: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
      startTime: "",
      endTime: "",
      billable: true,
    });

    toast({
      title: "Time Entry Added",
      description: `${formatDuration(duration)} logged for ${selectedCaseData.name}.`,
    });
  };

  const handleDeleteEntry = (entryId: string) => {
    setEntries(entries.filter((e) => e.id !== entryId));
    toast({
      title: "Entry Deleted",
      description: "Time entry has been removed.",
    });
  };

  const startTimer = () => {
    if (!timerCaseId) {
      toast({
        title: "Select a Case",
        description: "Please select a case before starting the timer.",
        variant: "destructive",
      });
      return;
    }
    setIsTimerRunning(true);
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    (window as any).timerInterval = interval;
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
    clearInterval((window as any).timerInterval);
  };

  const stopTimer = () => {
    if (timerSeconds < 60) {
      toast({
        title: "Minimum Time Required",
        description: "Timer must run for at least 1 minute.",
        variant: "destructive",
      });
      return;
    }

    const selectedCaseData = mockCases.find((c) => c.id === timerCaseId);
    if (!selectedCaseData) return;

    const now = new Date();
    const duration = Math.round(timerSeconds / 60);
    const startDate = new Date(now.getTime() - timerSeconds * 1000);

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      caseId: timerCaseId,
      caseName: selectedCaseData.name,
      description: timerDescription || "Timer session",
      date: format(now, "yyyy-MM-dd"),
      startTime: format(startDate, "HH:mm"),
      endTime: format(now, "HH:mm"),
      duration,
      hourlyRate: selectedCaseData.hourlyRate,
      billable: true,
      status: "pending",
    };

    setEntries([newEntry, ...entries]);
    setIsTimerRunning(false);
    setTimerSeconds(0);
    setTimerCaseId("");
    setTimerDescription("");
    clearInterval((window as any).timerInterval);

    toast({
      title: "Time Logged",
      description: `${formatDuration(duration)} logged for ${selectedCaseData.name}.`,
    });
  };

  // Calculate statistics
  const thisWeekEntries = entries.filter((e) => {
    const entryDate = parseISO(e.date);
    return entryDate >= weekStart && entryDate <= weekEnd;
  });

  const thisMonthEntries = entries.filter((e) => {
    const entryDate = parseISO(e.date);
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    return entryDate >= monthStart && entryDate <= monthEnd;
  });

  const totalHoursThisWeek = thisWeekEntries.reduce((acc, e) => acc + e.duration, 0) / 60;
  const totalBillableThisWeek = thisWeekEntries
    .filter((e) => e.billable)
    .reduce((acc, e) => acc + calculateAmount(e.duration, e.hourlyRate), 0);

  const totalHoursThisMonth = thisMonthEntries.reduce((acc, e) => acc + e.duration, 0) / 60;
  const totalBillableThisMonth = thisMonthEntries
    .filter((e) => e.billable)
    .reduce((acc, e) => acc + calculateAmount(e.duration, e.hourlyRate), 0);

  const pendingApproval = entries.filter((e) => e.status === "pending").length;
  const weeklyTarget = 40; // hours
  const weeklyProgress = (totalHoursThisWeek / weeklyTarget) * 100;

  // Case breakdown for report
  const caseBreakdown = mockCases.map((c) => {
    const caseEntries = thisMonthEntries.filter((e) => e.caseId === c.id);
    const totalMinutes = caseEntries.reduce((acc, e) => acc + e.duration, 0);
    const totalAmount = caseEntries
      .filter((e) => e.billable)
      .reduce((acc, e) => acc + calculateAmount(e.duration, e.hourlyRate), 0);
    return {
      ...c,
      hours: totalMinutes / 60,
      amount: totalAmount,
      entries: caseEntries.length,
    };
  }).filter((c) => c.hours > 0);

  const filteredEntries = entries.filter((e) => {
    const matchesCase = selectedCase === "all" || e.caseId === selectedCase;
    const matchesStatus = selectedStatus === "all" || e.status === selectedStatus;
    return matchesCase && matchesStatus;
  });

  const getEntriesForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return entries.filter((e) => e.date === dateStr);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">Time Tracking</h1>
                <p className="text-muted-foreground mt-1">Log billable hours and manage your time entries</p>
              </div>
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-gold text-primary-foreground shadow-gold">
                    <Plus className="w-4 h-4 mr-2" />
                    Log Time
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl">Log Time Entry</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Case *</Label>
                      <Select value={formData.caseId} onValueChange={(v) => setFormData({ ...formData, caseId: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a case" />
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
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="What did you work on?"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time *</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endTime">End Time *</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="billable"
                        checked={formData.billable}
                        onChange={(e) => setFormData({ ...formData, billable: e.target.checked })}
                        className="rounded border-border"
                      />
                      <Label htmlFor="billable" className="cursor-pointer">Billable time</Label>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" className="flex-1" onClick={() => setIsAddOpen(false)}>
                        Cancel
                      </Button>
                      <Button className="flex-1 gradient-gold text-primary-foreground" onClick={handleAddEntry}>
                        Log Time
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Timer Widget */}
            <div className="glass-card p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Live Timer
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Select value={timerCaseId} onValueChange={setTimerCaseId} disabled={isTimerRunning}>
                      <SelectTrigger className="w-full sm:w-64">
                        <SelectValue placeholder="Select a case" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCases.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="What are you working on?"
                      value={timerDescription}
                      onChange={(e) => setTimerDescription(e.target.value)}
                      className="flex-1"
                      disabled={isTimerRunning}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "text-4xl font-mono font-bold transition-colors",
                    isTimerRunning ? "text-primary" : "text-foreground"
                  )}>
                    {formatTimerDisplay(timerSeconds)}
                  </div>
                  <div className="flex gap-2">
                    {!isTimerRunning ? (
                      <Button
                        size="icon"
                        className="w-12 h-12 rounded-full gradient-gold text-primary-foreground shadow-gold"
                        onClick={startTimer}
                      >
                        <Play className="w-5 h-5" />
                      </Button>
                    ) : (
                      <Button
                        size="icon"
                        variant="outline"
                        className="w-12 h-12 rounded-full"
                        onClick={pauseTimer}
                      >
                        <Pause className="w-5 h-5" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="destructive"
                      className="w-12 h-12 rounded-full"
                      onClick={stopTimer}
                      disabled={timerSeconds === 0}
                    >
                      <Square className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{totalHoursThisWeek.toFixed(1)}h</p>
                    <p className="text-sm text-muted-foreground">This Week</p>
                  </div>
                </div>
                <div className="mt-3">
                  <Progress value={weeklyProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{weeklyProgress.toFixed(0)}% of {weeklyTarget}h target</p>
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/20">
                    <DollarSign className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">${totalBillableThisWeek.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Billable This Week</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-info/20">
                    <TrendingUp className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{totalHoursThisMonth.toFixed(1)}h</p>
                    <p className="text-sm text-muted-foreground">This Month</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/20">
                    <FileText className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{pendingApproval}</p>
                    <p className="text-sm text-muted-foreground">Pending Approval</p>
                  </div>
                </div>
              </div>
            </div>

            <Tabs defaultValue="entries" className="space-y-6">
              <TabsList className="bg-secondary/50">
                <TabsTrigger value="entries">Time Entries</TabsTrigger>
                <TabsTrigger value="weekly">Weekly View</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="entries" className="space-y-4">
                {/* Filters */}
                <div className="glass-card p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Select value={selectedCase} onValueChange={setSelectedCase}>
                      <SelectTrigger className="w-full sm:w-64">
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
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="billed">Billed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Entries Table */}
                <div className="glass-card overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Date</TableHead>
                        <TableHead className="text-muted-foreground">Case</TableHead>
                        <TableHead className="text-muted-foreground">Description</TableHead>
                        <TableHead className="text-muted-foreground">Time</TableHead>
                        <TableHead className="text-muted-foreground">Duration</TableHead>
                        <TableHead className="text-muted-foreground">Amount</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                        <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEntries.length > 0 ? (
                        filteredEntries.map((entry) => (
                          <TableRow key={entry.id} className="border-border">
                            <TableCell className="text-muted-foreground">
                              {format(parseISO(entry.date), "MMM d")}
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[200px]">
                                <p className="font-medium text-foreground truncate">{entry.caseName}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-muted-foreground max-w-[200px] truncate">{entry.description}</p>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {entry.startTime} - {entry.endTime}
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                              {formatDuration(entry.duration)}
                            </TableCell>
                            <TableCell className="font-medium text-success">
                              ${calculateAmount(entry.duration, entry.hourlyRate).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge className={cn("font-normal", statusConfig[entry.status].className)}>
                                {statusConfig[entry.status].label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12">
                            <Clock className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                            <p className="text-muted-foreground">No time entries found.</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="weekly" className="space-y-4">
                {/* Week Navigation */}
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="icon" onClick={() => setCurrentWeek(new Date(currentWeek.getTime() - 7 * 24 * 60 * 60 * 1000))}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="text-center">
                      <p className="font-display font-semibold text-foreground">
                        {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {totalHoursThisWeek.toFixed(1)} hours logged
                      </p>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => setCurrentWeek(new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000))}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Weekly Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day) => {
                    const dayEntries = getEntriesForDay(day);
                    const dayTotal = dayEntries.reduce((acc, e) => acc + e.duration, 0);
                    return (
                      <div
                        key={day.toISOString()}
                        className={cn(
                          "glass-card p-3 min-h-[150px]",
                          isToday(day) && "ring-2 ring-primary"
                        )}
                      >
                        <div className="text-center mb-3">
                          <p className="text-xs text-muted-foreground">{format(day, "EEE")}</p>
                          <p className={cn("text-lg font-bold", isToday(day) ? "text-primary" : "text-foreground")}>
                            {format(day, "d")}
                          </p>
                        </div>
                        <div className="space-y-1">
                          {dayEntries.slice(0, 3).map((entry) => (
                            <div key={entry.id} className="p-1.5 bg-primary/10 rounded text-xs truncate">
                              {formatDuration(entry.duration)}
                            </div>
                          ))}
                          {dayEntries.length > 3 && (
                            <p className="text-xs text-muted-foreground text-center">+{dayEntries.length - 3} more</p>
                          )}
                        </div>
                        {dayTotal > 0 && (
                          <div className="mt-2 pt-2 border-t border-border text-center">
                            <p className="text-sm font-medium text-primary">{formatDuration(dayTotal)}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="reports" className="space-y-6">
                {/* Report Header */}
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-display text-xl font-semibold text-foreground">Monthly Billing Report</h3>
                      <p className="text-muted-foreground">{format(new Date(), "MMMM yyyy")}</p>
                    </div>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Report
                    </Button>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-secondary/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Hours</p>
                      <p className="text-2xl font-bold text-foreground">{totalHoursThisMonth.toFixed(1)}h</p>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Billable Amount</p>
                      <p className="text-2xl font-bold text-success">${totalBillableThisMonth.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Active Cases</p>
                      <p className="text-2xl font-bold text-foreground">{caseBreakdown.length}</p>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Avg. Hourly Rate</p>
                      <p className="text-2xl font-bold text-foreground">
                        ${totalHoursThisMonth > 0 ? (totalBillableThisMonth / totalHoursThisMonth).toFixed(0) : 0}
                      </p>
                    </div>
                  </div>

                  {/* Case Breakdown */}
                  <h4 className="font-display font-semibold text-foreground mb-4">Breakdown by Case</h4>
                  <div className="space-y-3">
                    {caseBreakdown.length > 0 ? (
                      caseBreakdown.map((c) => (
                        <div key={c.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/20">
                              <Briefcase className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{c.name}</p>
                              <p className="text-sm text-muted-foreground">{c.client} • ${c.hourlyRate}/hr</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-foreground">{c.hours.toFixed(1)}h</p>
                            <p className="text-sm text-success">${c.amount.toLocaleString()}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No billable time this month.</p>
                    )}
                  </div>
                </div>
              </TabsContent>
          </Tabs>
      </div>
    </AppLayout>
  );
};

export default TimeTracking;
