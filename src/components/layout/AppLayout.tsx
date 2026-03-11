import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, Home, Briefcase, MessageSquare, Search, PlusCircle, User, Settings, LogOut, Shield, ArrowLeftRight } from "lucide-react";
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
    <Sidebar collapsible="icon" className="border-r-0 bg-transparent">
      <div className="flex h-16 items-center px-6">
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-heading font-bold text-sm">G</div>
            <span className="text-lg font-heading font-bold">GigLocal</span>
          </Link>
        )}
      </div>
      <SidebarContent className="px-3 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground/70 mb-2">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-white/5 hover:text-foreground"
                      activeClassName="bg-primary/10 text-primary !font-semibold shadow-sm"
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="mt-auto p-4">
        {!collapsed && (
          <div className="flex items-center gap-3 rounded-2xl bg-card/60 backdrop-blur-md border border-border/50 p-3 shadow-sm transition-colors hover:bg-card/80">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{profile?.name?.charAt(0)?.toUpperCase() ?? "?"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{profile?.name ?? "User"}</p>
              <p className="text-xs text-muted-foreground capitalize">{activeRole}</p>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
}

function TopBar() {
  const { profile, activeRole, isAdmin, switchRole, signOut } = useAuth();
  const { unreadCount } = useRealtimeNotifications();
  const navigate = useNavigate();
  const otherRole = activeRole === "customer" ? "worker" : "customer";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 bg-background/60 backdrop-blur-xl px-4 lg:px-8 border-b border-border/40">
      <SidebarTrigger className="lg:hidden" />
      <div className="hidden lg:block"><SidebarTrigger /></div>
      <div className="flex-1" />
      <ThemeToggle />
      <Button variant="ghost" size="icon" className="relative rounded-full" onClick={() => navigate("/notifications")}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground ring-2 ring-background">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-9 w-9 ring-2 ring-border">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{profile?.name?.charAt(0)?.toUpperCase() ?? "?"}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-xl p-1">
          <div className="px-3 py-2">
            <p className="text-sm font-semibold">{profile?.name}</p>
            <p className="text-xs text-muted-foreground">{profile?.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => switchRole(otherRole)} className="rounded-lg">
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            Switch to {otherRole}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/profile")} className="rounded-lg">
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/settings")} className="rounded-lg">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem onClick={() => navigate("/admin")} className="rounded-lg">
              <Shield className="mr-2 h-4 w-4" />
              Admin
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut} className="rounded-lg text-destructive focus:text-destructive">
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border/40 bg-background/80 backdrop-blur-xl py-2 lg:hidden safe-area-pb">
      {items.map((item) => {
        const isActive = location.pathname === item.url || (item.url !== "/dashboard" && location.pathname.startsWith(item.url));
        return (
          <Link
            key={item.title}
            to={item.url}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 text-[11px] font-medium transition-colors rounded-lg",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg transition-colors", isActive && "bg-accent")}>
              <item.icon className="h-[18px] w-[18px]" />
            </div>
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
      <div className="min-h-screen flex w-full bg-background relative selection:bg-primary/30 selection:text-foreground">
        {/* Subtle dynamic background glow */}
        <div className="pointer-events-none fixed inset-0 flex justify-center z-0 overflow-hidden">
          <div className="w-[1000px] max-w-full h-full absolute top-[-20%] right-[-10%] bg-primary/5 blur-[120px] rounded-full opacity-50 dark:opacity-20 transition-opacity duration-1000" />
          <div className="w-[800px] max-w-full h-full absolute bottom-[-20%] left-[-10%] bg-purple-500/5 blur-[120px] rounded-full opacity-50 dark:opacity-20 transition-opacity duration-1000" />
        </div>
        
        <div className="hidden lg:block z-10 sticky top-0 h-screen border-r border-border/40 bg-card/30 backdrop-blur-3xl transition-all duration-300">
          <AppSidebarContent />
        </div>
        <div className="flex-1 flex flex-col min-w-0 z-10 relative">
          <TopBar />
          <main className="flex-1 pb-24 lg:pb-8 pt-4">
            {children}
          </main>
          <MobileBottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
}
