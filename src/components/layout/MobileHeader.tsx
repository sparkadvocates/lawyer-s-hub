import { useState } from "react";
import { Search, Bell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  title?: string;
  showSearch?: boolean;
  showBack?: boolean;
  onBack?: () => void;
}

const MobileHeader = ({ title, showSearch = false }: MobileHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.substring(0, 2).toUpperCase();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border safe-area-top">
      {/* Main Header */}
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left - Avatar */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => navigate("/dashboard/settings")}
        >
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>

        {/* Center - Title or Search */}
        {searchOpen ? (
          <form onSubmit={handleSearch} className="flex-1 mx-3">
            <Input
              placeholder="খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 bg-secondary/50"
              autoFocus
            />
          </form>
        ) : (
          <h1 className="font-display font-semibold text-foreground">
            {title || "LexProSuite"}
          </h1>
        )}

        {/* Right - Actions */}
        <div className="flex items-center gap-1">
          {showSearch && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="w-5 h-5" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full relative"
            onClick={() => navigate("/dashboard/messages")}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 p-0 flex items-center justify-center text-[10px] bg-destructive">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
