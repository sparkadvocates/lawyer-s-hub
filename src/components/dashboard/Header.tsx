import { Bell, Search, Plus, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/login");
  };

  const getUserInitials = () => {
    if (!user?.email) return "U";
    const email = user.email;
    return email.substring(0, 2).toUpperCase();
  };

  const getUserDisplayName = () => {
    if (!user?.email) return "User";
    return user.email.split("@")[0];
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 px-6 flex items-center justify-between">
      {/* Search */}
      <div className="relative w-96 hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search cases, clients, documents..."
          className="pl-10 bg-secondary/50 border-transparent focus:border-primary"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Quick Actions */}
        <Button variant="gold" size="sm" className="hidden sm:flex">
          <Plus className="w-4 h-4" />
          New Case
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">Court date reminder</span>
              <span className="text-sm text-muted-foreground">
                Smith vs. Johnson hearing tomorrow at 9 AM
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">Document signed</span>
              <span className="text-sm text-muted-foreground">
                Client signed the settlement agreement
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">New message</span>
              <span className="text-sm text-muted-foreground">
                2 unread messages from clients
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 px-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium">{getUserDisplayName()}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
