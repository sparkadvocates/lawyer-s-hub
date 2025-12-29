import { useState } from "react";
import { format } from "date-fns";
import { bn } from "date-fns/locale";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Clock,
  FileText,
  Gavel,
  Scale,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { useCaseTimeline, TimelineEvent } from "@/hooks/useCaseTimeline";

interface CaseTimelineProps {
  caseId: string;
  caseName?: string;
}

const eventTypes = [
  { value: "hearing", label: "শুনানি", icon: Gavel, color: "text-primary" },
  { value: "filing", label: "দাখিল", icon: FileText, color: "text-info" },
  { value: "order", label: "আদেশ", icon: Scale, color: "text-success" },
  { value: "adjournment", label: "মুলতবি", icon: Clock, color: "text-warning" },
  { value: "argument", label: "যুক্তিতর্ক", icon: AlertCircle, color: "text-accent" },
  { value: "evidence", label: "সাক্ষ্য", icon: FileText, color: "text-muted-foreground" },
  { value: "judgment", label: "রায়", icon: CheckCircle, color: "text-success" },
  { value: "appeal", label: "আপিল", icon: Scale, color: "text-destructive" },
  { value: "other", label: "অন্যান্য", icon: Calendar, color: "text-muted-foreground" },
];

const CaseTimeline = ({ caseId, caseName }: CaseTimelineProps) => {
  const { events, loading, createEvent, updateEvent, deleteEvent } = useCaseTimeline(caseId);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    event_type: "hearing",
    title: "",
    description: "",
    event_date: new Date().toISOString().split("T")[0],
  });

  const resetForm = () => {
    setFormData({
      event_type: "hearing",
      title: "",
      description: "",
      event_date: new Date().toISOString().split("T")[0],
    });
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.event_date) return;
    
    setIsSaving(true);
    const result = await createEvent({
      case_id: caseId,
      ...formData,
    });
    setIsSaving(false);
    
    if (result) {
      setIsAddOpen(false);
      resetForm();
    }
  };

  const handleUpdate = async () => {
    if (!selectedEvent || !formData.title) return;
    
    setIsSaving(true);
    const result = await updateEvent(selectedEvent.id, formData);
    setIsSaving(false);
    
    if (result) {
      setIsEditOpen(false);
      setSelectedEvent(null);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    await deleteEvent(id);
  };

  const openEditDialog = (event: TimelineEvent) => {
    setSelectedEvent(event);
    setFormData({
      event_type: event.event_type,
      title: event.title,
      description: event.description || "",
      event_date: event.event_date,
    });
    setIsEditOpen(true);
  };

  const getEventConfig = (type: string) => {
    return eventTypes.find((t) => t.value === type) || eventTypes[eventTypes.length - 1];
  };

  const EventForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>তারিখ *</Label>
          <Input
            type="date"
            value={formData.event_date}
            onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>ইভেন্ট টাইপ</Label>
          <Select
            value={formData.event_type}
            onValueChange={(v) => setFormData({ ...formData, event_type: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>শিরোনাম / কী হয়েছিল *</Label>
        <Input
          placeholder="যেমন: সাক্ষ্য গ্রহণ সম্পন্ন, পরবর্তী তারিখ ধার্য"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>বিস্তারিত বিবরণ</Label>
        <Textarea
          placeholder="আদালতে কী কী ঘটেছে, কী আদেশ হয়েছে..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            if (isEdit) setIsEditOpen(false);
            else setIsAddOpen(false);
            resetForm();
          }}
        >
          বাতিল
        </Button>
        <Button
          className="flex-1 gradient-gold text-primary-foreground"
          onClick={isEdit ? handleUpdate : handleCreate}
          disabled={isSaving}
        >
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEdit ? "আপডেট করুন" : "যোগ করুন"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          হেয়ারিং টাইমলাইন
        </h3>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gradient-gold text-primary-foreground">
              <Plus className="w-4 h-4 mr-1" />
              নতুন এন্ট্রি
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>নতুন হেয়ারিং/ইভেন্ট যোগ করুন</DialogTitle>
            </DialogHeader>
            <EventForm />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>কোনো হেয়ারিং রেকর্ড নেই</p>
          <p className="text-sm">প্রথম এন্ট্রি যোগ করুন</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-4">
            {events.map((event, index) => {
              const config = getEventConfig(event.event_type);
              const IconComponent = config.icon;
              
              return (
                <div key={event.id} className="relative pl-10">
                  {/* Timeline dot */}
                  <div className={`absolute left-2 top-2 w-5 h-5 rounded-full bg-card border-2 border-primary flex items-center justify-center`}>
                    <IconComponent className={`w-3 h-3 ${config.color}`} />
                  </div>

                  <div className="glass-card p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {config.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(event.event_date), "dd MMMM, yyyy", { locale: bn })}
                          </span>
                        </div>
                        <h4 className="font-medium text-foreground">{event.title}</h4>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(event)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(event.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>এন্ট্রি সম্পাদনা</DialogTitle>
          </DialogHeader>
          <EventForm isEdit />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CaseTimeline;
