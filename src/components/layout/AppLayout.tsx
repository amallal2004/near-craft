import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, Home, Briefcase, MessageSquare, Search, PlusCircle, User, Settings, LogOut, Shield, ArrowLeftRight, Menu } from "lucide-react";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";
import { SidebarProvider, SidebarTrigger, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";

const customerNav = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "My Jobs", url: "/jobs", icon: Briefcase },
  { title: "Post a Job", url: "/jobs/new", icon: PlusCircle },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Reviews", url: "/reviews", icon: Search },
];

const workerNav = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Browse Jobs", url: "/jobs", icon: Search },
  { title: "My Applications", url: "/applications", icon: Briefcase },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Reviews", url: "/reviews", icon: Search },
];

function AppSidebarContent() {
  const { activeRole, profile, switchRole, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const items = activeRole === "worker" ? workerNav : customerNav;

  let sidebarState: string;
  try {
    const sidebar = useSidebar();
    sidebarState = sidebar.state;
  } catch {
    sidebarState = "expanded";
  }
  const collapsed = sidebarState === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r">
      <div className="flex h-14 items-center border-b px-4">
        {!collapsed && <Link to="/dashboard" className="text-lg font-heading font-bold text-primary">GigLocal</Link>}
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === "/dashboard"} className="hover:bg-muted/50" activeClassName="bg-primary/10 text-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="mt-auto border-t p-4">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">{profile?.name?.charAt(0)?.toUpperCase() ?? "?"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.name ?? "User"}</p>
              <p className="text-xs text-muted-foreground capitalize">{activeRole}</p>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
}

function TopBar() {
  const { profile, activeRole, switchRole, signOut } = useAuth();
  const { unreadCount } = useRealtimeNotifications();
  const navigate = useNavigate();
  const otherRole = activeRole === "customer" ? "worker" : "customer";

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:px-6">
      <SidebarTrigger className="lg:hidden" />
      <div className="hidden lg:block"><SidebarTrigger /></div>
      <div className="flex-1" />
      <ThemeToggle />
      <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/notifications")}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">{profile?.name?.charAt(0)?.toUpperCase() ?? "?"}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{profile?.name}</p>
            <p className="text-xs text-muted-foreground">{profile?.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => switchRole(otherRole)}>
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            Switch to {otherRole}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/profile")}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/admin")}>
            <Shield className="mr-2 h-4 w-4" />
            Admin
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

function MobileBottomNav() {
  const { activeRole } = useAuth();
  const location = useLocation();
  const items = activeRole === "worker" ? workerNav.slice(0, 5) : customerNav.slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t bg-background/95 backdrop-blur-sm py-2 lg:hidden">
      {items.map((item) => {
        const isActive = location.pathname === item.url || (item.url !== "/dashboard" && location.pathname.startsWith(item.url));
        return (
          <Link
            key={item.title}
            to={item.url}
            className={cn("flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors", isActive ? "text-primary" : "text-muted-foreground")}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <div className="hidden lg:block">
          <AppSidebarContent />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 pb-20 lg:pb-0">
            {children}
          </main>
          <MobileBottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
}
