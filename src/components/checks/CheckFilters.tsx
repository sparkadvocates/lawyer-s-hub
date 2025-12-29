import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, Filter } from "lucide-react";
import { NoticeStatus } from "@/hooks/useChecks";

export type FilterType = 'all' | 'pending_dishonor' | 'pending_notice' | 'pending_case' | 'completed' | 'overdue';
export type SortField = 'check_date' | 'dishonor_date' | 'legal_notice_date' | 'check_amount' | 'created_at';
export type SortOrder = 'asc' | 'desc';

interface CheckFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filterType: FilterType;
  setFilterType: (value: FilterType) => void;
  noticeStatusFilter: NoticeStatus | 'all';
  setNoticeStatusFilter: (value: NoticeStatus | 'all') => void;
  sortField: SortField;
  setSortField: (value: SortField) => void;
  sortOrder: SortOrder;
  setSortOrder: (value: SortOrder) => void;
  bankFilter: string;
  setBankFilter: (value: string) => void;
  banks: string[];
  onClearFilters: () => void;
}

const filterLabels: Record<FilterType, string> = {
  all: 'সব চেক',
  pending_dishonor: 'ডিস অনার বাকি',
  pending_notice: 'নোটিশ বাকি',
  pending_case: 'মামলা বাকি',
  completed: 'সম্পন্ন',
  overdue: 'সময়সীমা শেষ',
};

const noticeStatusLabels: Record<NoticeStatus | 'all', string> = {
  all: 'সব অবস্থা',
  pending: 'অপেক্ষমাণ',
  ad_received: 'AD প্রাপ্ত',
  recipient_not_found: 'প্রাপক পাওয়া যায়নি',
  returned_unaccepted: 'গ্রহণ না করায় ফেরত',
  delivered: 'ডেলিভারি সম্পন্ন',
};

const sortFieldLabels: Record<SortField, string> = {
  check_date: 'চেকের তারিখ',
  dishonor_date: 'ডিস অনার তারিখ',
  legal_notice_date: 'নোটিশ তারিখ',
  check_amount: 'পরিমাণ',
  created_at: 'যোগ করার তারিখ',
};

const CheckFilters = ({
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  noticeStatusFilter,
  setNoticeStatusFilter,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  bankFilter,
  setBankFilter,
  banks,
  onClearFilters,
}: CheckFiltersProps) => {
  const hasActiveFilters = searchQuery || filterType !== 'all' || noticeStatusFilter !== 'all' || bankFilter !== 'all';

  return (
    <div className="space-y-4">
      {/* Search and Quick Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="চেক নম্বর, ব্যাংক খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(filterLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={noticeStatusFilter} onValueChange={(v) => setNoticeStatusFilter(v as NoticeStatus | 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(noticeStatusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={bankFilter} onValueChange={setBankFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="ব্যাংক নির্বাচন" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব ব্যাংক</SelectItem>
            {banks.map((bank) => (
              <SelectItem key={bank} value={bank}>
                {bank}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sorting */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">সর্ট করুন:</span>
        <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(sortFieldLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">নতুন প্রথমে</SelectItem>
            <SelectItem value="asc">পুরাতন প্রথমে</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="gap-1 text-muted-foreground">
            <X className="w-4 h-4" />
            ফিল্টার মুছুন
          </Button>
        )}
      </div>
    </div>
  );
};

export default CheckFilters;
