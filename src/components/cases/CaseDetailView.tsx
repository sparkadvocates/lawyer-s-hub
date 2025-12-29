import { format } from "date-fns";
import { bn } from "date-fns/locale";
import {
  Briefcase,
  Calendar,
  User,
  Building,
  Scale,
  FileText,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CaseData } from "@/hooks/useCases";
import CaseTimeline from "./CaseTimeline";

interface CaseDetailViewProps {
  caseData: CaseData;
}

const statusConfig = {
  open: { label: "চলমান", className: "bg-info/20 text-info border-info/30" },
  in_progress: { label: "অগ্রগতিতে", className: "bg-success/20 text-success border-success/30" },
  pending: { label: "বিচারাধীন", className: "bg-warning/20 text-warning border-warning/30" },
  closed: { label: "সম্পন্ন", className: "bg-muted text-muted-foreground border-border" },
  won: { label: "জয়", className: "bg-success/20 text-success border-success/30" },
  lost: { label: "পরাজয়", className: "bg-destructive/20 text-destructive border-destructive/30" },
};

const priorityConfig = {
  urgent: { label: "জরুরি", className: "bg-destructive/20 text-destructive border-destructive/30" },
  high: { label: "উচ্চ", className: "bg-warning/20 text-warning border-warning/30" },
  medium: { label: "মাঝারি", className: "bg-info/20 text-info border-info/30" },
  low: { label: "নিম্ন", className: "bg-muted text-muted-foreground border-border" },
};

const CaseDetailView = ({ caseData }: CaseDetailViewProps) => {
  const isUpcoming = caseData.next_hearing_date && new Date(caseData.next_hearing_date) > new Date();
  const daysUntilHearing = caseData.next_hearing_date
    ? Math.ceil((new Date(caseData.next_hearing_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6">
      {/* Header with badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className={statusConfig[caseData.status]?.className}>
          {statusConfig[caseData.status]?.label}
        </Badge>
        <Badge variant="outline" className={priorityConfig[caseData.priority]?.className}>
          {priorityConfig[caseData.priority]?.label}
        </Badge>
        {isUpcoming && daysUntilHearing !== null && daysUntilHearing <= 7 && (
          <Badge className="bg-warning/20 text-warning border-warning/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {daysUntilHearing} দিন বাকি
          </Badge>
        )}
      </div>

      {/* Next Hearing Alert */}
      {caseData.next_hearing_date && (
        <div className={`p-4 rounded-lg border ${isUpcoming ? "bg-primary/10 border-primary/30" : "bg-muted border-border"}`}>
          <div className="flex items-center gap-3">
            <Calendar className={`w-5 h-5 ${isUpcoming ? "text-primary" : "text-muted-foreground"}`} />
            <div>
              <p className="text-sm text-muted-foreground">পরবর্তী হেয়ারিং</p>
              <p className="font-semibold text-foreground">
                {format(new Date(caseData.next_hearing_date), "dd MMMM, yyyy (EEEE)", { locale: bn })}
              </p>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="details">বিস্তারিত</TabsTrigger>
          <TabsTrigger value="timeline">হেয়ারিং টাইমলাইন</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4 mt-4">
          {/* Case Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">মক্কেল</p>
                <p className="font-medium">{caseData.client?.name || "-"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Briefcase className="w-4 h-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">মামলার ধরন</p>
                <p className="font-medium">{caseData.case_type || "-"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building className="w-4 h-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">আদালত</p>
                <p className="font-medium">{caseData.court_name || "-"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Scale className="w-4 h-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">বিচারক</p>
                <p className="font-medium">{caseData.judge_name || "-"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">বিপক্ষ</p>
                <p className="font-medium">{caseData.opposing_party || "-"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">বিপক্ষ উকিল</p>
                <p className="font-medium">{caseData.opposing_counsel || "-"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">দায়েরের তারিখ</p>
                <p className="font-medium">
                  {caseData.filing_date
                    ? format(new Date(caseData.filing_date), "dd MMMM, yyyy", { locale: bn })
                    : "-"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">মামলা নম্বর</p>
                <p className="font-medium font-mono">{caseData.case_number}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {caseData.description && (
            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground mb-1">বিবরণ</p>
              <p className="text-foreground">{caseData.description}</p>
            </div>
          )}

          {/* Notes */}
          {caseData.notes && (
            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground mb-1">নোট</p>
              <p className="text-foreground">{caseData.notes}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <CaseTimeline caseId={caseData.id} caseName={caseData.title} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CaseDetailView;
