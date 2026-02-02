import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { NoticeStatus } from "@/hooks/useChecks";
import { useState } from "react";

export type FilterType = 'all' | 'pending_dishonor' | 'pending_notice' | 'pending_case' | 'completed' | 'overdue';
export type SortField = 'check_date' | 'dishonor_date' | 'legal_notice_date' | 'check_amount' | 'created_at';
export type SortOrder = 'asc' | 'desc';

interface MobileCheckFiltersProps {
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

const MobileCheckFilters = ({
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
}: MobileCheckFiltersProps) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const hasActiveFilters = filterType !== 'all' || noticeStatusFilter !== 'all' || bankFilter !== 'all';
  const activeFilterCount = [filterType !== 'all', noticeStatusFilter !== 'all', bankFilter !== 'all'].filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Search + Filter Button Row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="চেক খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="relative shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
            <SheetHeader className="text-left pb-4">
              <SheetTitle className="text-xl font-display">ফিল্টার ও সর্ট</SheetTitle>
            </SheetHeader>

            <div className="space-y-4 overflow-y-auto pb-8">
              {/* Filter Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">ফিল্টার</label>
                <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
                  <SelectTrigger>
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
              </div>

              {/* Notice Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium">নোটিশ অবস্থা</label>
                <Select value={noticeStatusFilter} onValueChange={(v) => setNoticeStatusFilter(v as NoticeStatus | 'all')}>
                  <SelectTrigger>
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
              </div>

              {/* Bank Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">ব্যাংক</label>
                <Select value={bankFilter} onValueChange={setBankFilter}>
                  <SelectTrigger>
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

              {/* Sort Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium">সর্ট করুন</label>
                <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
                  <SelectTrigger>
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
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <label className="text-sm font-medium">ক্রম</label>
                <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">নতুন প্রথমে</SelectItem>
                    <SelectItem value="asc">পুরাতন প্রথমে</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      onClearFilters();
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    রিসেট
                  </Button>
                )}
                <Button
                  variant="gold"
                  className="flex-1"
                  onClick={() => setSheetOpen(false)}
                >
                  প্রয়োগ করুন
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filterType !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filterLabels[filterType]}
              <button onClick={() => setFilterType('all')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {noticeStatusFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {noticeStatusLabels[noticeStatusFilter]}
              <button onClick={() => setNoticeStatusFilter('all')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {bankFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {bankFilter}
              <button onClick={() => setBankFilter('all')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileCheckFilters;
