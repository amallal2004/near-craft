import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, Home, Briefcase, MessageSquare, Search, PlusCircle, User, Settings, LogOut, Shield, ArrowLeftRight, Users } from "lucide-react";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";
import { SidebarProvider, SidebarTrigger, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { motion } from "framer-motion";

const customerNav = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Browse Workers", url: "/workers", icon: Users },
  { title: "My Jobs", url: "/jobs", icon: Briefcase },
  { title: "Post a Job", url: "/jobs/new", icon: PlusCircle },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Reviews", url: "/reviews", icon: Search },
  { title: "Settings", url: "/settings", icon: Settings },
];

const workerNav = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Browse Jobs", url: "/jobs", icon: Search },
  { title: "My Applications", url: "/applications", icon: Briefcase },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Reviews", url: "/reviews", icon: Search },
  { title: "Settings", url: "/settings", icon: Settings },
];

function AppSidebarContent() {
  const { activeRole, profile, signOut } = useAuth();
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

  if (activeRole === "customer") {
    return (
      <Sidebar collapsible="icon" className="border-r border-slate-100 bg-slate-50 z-50">
        <div className="flex flex-col h-full bg-slate-50 p-4">
          <div className="mb-10 px-4">
            {!collapsed ? (
              <>
                <h1 className="text-xl font-bold tracking-tight text-l-on-surface font-l-headline">MinuteWorker</h1>
                <p className="text-[10px] uppercase tracking-widest text-l-secondary font-bold font-l-headline">Freelancer Hub</p>
              </>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-l-primary to-l-primary-container text-white font-black text-xl shadow-lg shadow-l-primary/20">M</div>
            )}
          </div>
          <SidebarContent className="flex-1 mt-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {items.map((item) => {
                    const isActive = location.pathname === item.url || (item.url !== "/dashboard" && location.pathname.startsWith(item.url));
                    return (
                      <SidebarMenuItem key={item.title}>
                        <Link
                          to={item.url}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 transition-all duration-200 rounded-lg",
                            isActive 
                              ? "text-l-primary font-bold bg-white shadow-sm scale-[0.98]" 
                              : "text-slate-600 hover:text-l-primary hover:bg-slate-100"
                          )}
                        >
                          <item.icon className={cn("h-5 w-5 shrink-0 transition-transform duration-300", isActive ? "text-l-primary" : "text-slate-400 group-hover:text-l-primary")} />
                          {!collapsed && <span className="text-sm">{item.title}</span>}
                        </Link>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          {!collapsed && (
            <div className="mt-auto p-4 bg-slate-100 rounded-xl">
              <Button 
                onClick={() => navigate("/jobs/new")}
                className="w-full h-12 bg-gradient-to-br from-[#b7102a] to-[#db313f] text-white hover:scale-[1.02] transition-transform rounded-xl font-bold text-sm shadow-lg shadow-l-primary/20 border-none"
              >
                Post a Job
              </Button>
            </div>
          )}
        </div>
      </Sidebar>
    );
  }

  // Worker sidebar — light theme, same structure as customer
  return (
    <Sidebar collapsible="icon" className="border-r border-slate-100 bg-slate-50 z-50">
      <div className="flex flex-col h-full bg-slate-50 p-4">
        <div className="mb-10 px-4">
          {!collapsed ? (
            <>
              <h1 className="text-xl font-bold tracking-tight text-l-on-surface font-l-headline">MinuteWorker</h1>
              <p className="text-[10px] uppercase tracking-widest text-l-secondary font-bold font-l-headline opacity-70">Velocity Atelier</p>
            </>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-l-primary to-l-primary-container text-white font-black text-xl shadow-lg shadow-l-primary/20">M</div>
          )}
        </div>
        <SidebarContent className="flex-1">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {items.map((item) => {
                  const isActive = location.pathname === item.url || (item.url !== "/dashboard" && location.pathname.startsWith(item.url));
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Link
                        to={item.url}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 transition-all duration-200 rounded-lg",
                          isActive
                            ? "text-l-primary font-bold bg-white shadow-sm scale-[0.98]"
                            : "text-slate-600 hover:text-l-primary hover:bg-slate-100"
                        )}
                      >
                        <item.icon className={cn("h-5 w-5 shrink-0 transition-transform duration-300", isActive ? "text-l-primary" : "text-slate-400")} />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </Link>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        {!collapsed && (
          <div className="mt-auto p-4 bg-slate-100 rounded-xl">
            <Button
              onClick={() => navigate("/jobs")}
              className="w-full h-12 bg-gradient-to-br from-[#b7102a] to-[#db313f] text-white hover:scale-[1.02] transition-transform rounded-xl font-bold text-sm shadow-lg shadow-l-primary/20 border-none"
            >
              Browse Jobs
            </Button>
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
  const [searchQuery, setSearchQuery] = useState("");
  const otherRole = activeRole === "customer" ? "worker" : "customer";
  const items = activeRole === "worker" ? workerNav : customerNav;
  const location = useLocation();
  const currentItem = items.find(item => location.pathname === item.url);

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    // Navigate to jobs page with search query
    navigate(`/jobs?q=${encodeURIComponent(q)}`);
  };

  if (activeRole === "customer") {
    return (
      <header className="sticky top-0 z-40 w-full transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-[0_20px_40px_rgba(0,27,60,0.06)] px-6 py-0">
        <div className="flex h-20 items-center justify-between px-8">
          <div className="flex items-center flex-1 max-w-md">
            <SidebarTrigger className="mr-4 lg:hidden text-slate-500" />
            <div className="relative w-full group">
              <button
                onClick={handleSearch}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-l-primary transition-colors hover:text-l-primary"
              >
                <span className="material-symbols-outlined text-xl">search</span>
              </button>
              <input 
                type="text" 
                placeholder="Search workers or jobs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full bg-l-surface-container-low border-none rounded-full py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-l-primary/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-l-on-surface font-l-headline">Welcome back, {profile?.name || "John"}!</p>
              <p className="text-[10px] text-l-secondary font-bold uppercase tracking-wider font-l-headline">Freelancer Hub</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-500 hover:text-l-primary transition-colors">
                <span className="material-symbols-outlined">help</span>
              </button>
              <button className="p-2 text-slate-500 hover:text-l-primary transition-colors relative">
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-l-primary rounded-full border-2 border-white" />
                )}
              </button>
            </div>
            <div className="h-8 w-[1px] bg-slate-200" />
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <Button variant="ghost" className="px-4 py-2 text-l-primary font-semibold text-sm hover:bg-l-primary/5 rounded-lg transition-colors border-none h-auto">
                  Hire Talent
                </Button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 outline-none">
                    <Avatar className="h-10 w-10 border-2 border-l-primary/10 hover:border-l-primary/30 transition-all">
                      <AvatarImage src={profile?.avatar_url || ""} />
                      <AvatarFallback className="bg-l-primary text-white font-black text-xs">{profile?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border border-slate-100 shadow-xl mt-2 bg-white text-l-on-surface">
                  <DropdownMenuItem className="h-10 rounded-lg cursor-pointer gap-3 text-sm font-medium" onClick={() => navigate("/profile")}>
                    <User className="h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="h-10 rounded-lg cursor-pointer gap-3 text-sm font-medium" onClick={() => switchRole(otherRole)}>
                    <ArrowLeftRight className="h-4 w-4" /> Switch Role
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem className="h-10 rounded-lg cursor-pointer gap-3 text-sm font-medium" onClick={() => navigate("/admin")}>
                      <Shield className="h-4 w-4" /> Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="my-1 bg-slate-100" />
                  <DropdownMenuItem className="h-10 rounded-lg cursor-pointer gap-3 text-sm font-medium text-destructive focus:text-destructive" onClick={() => signOut()}>
                    <LogOut className="h-4 w-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Worker TopBar — light theme matching the template
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-[0_20px_40px_rgba(0,27,60,0.04)] px-6 py-0">
      <div className="flex h-20 items-center justify-between px-8">
        <div className="flex items-center flex-1 max-w-md">
          <SidebarTrigger className="mr-4 lg:hidden text-slate-500" />
          <div className="relative w-full group">
            <button
              onClick={handleSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-l-primary transition-colors hover:text-l-primary"
            >
              <span className="material-symbols-outlined text-xl">search</span>
            </button>
            <input
              type="text"
              placeholder="Search gigs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full bg-l-surface-container-low border-none rounded-full py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-l-primary/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-l-on-surface font-l-headline">Welcome back, {profile?.name?.split(" ")[0] || "there"}!</p>
            <p className="text-[10px] text-l-secondary font-bold uppercase tracking-wider font-l-headline opacity-70">Velocity Atelier</p>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 text-slate-500 hover:text-l-primary transition-colors relative" onClick={() => navigate("/notifications")}>
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-l-primary rounded-full border-2 border-white" />
              )}
            </button>
            <button className="p-2 text-slate-500 hover:text-l-primary transition-colors" onClick={() => navigate("/settings")}>
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
          <div className="h-8 w-[1px] bg-slate-200" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 outline-none">
                <Avatar className="h-10 w-10 border-2 border-l-primary/10 hover:border-l-primary/30 transition-all">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-l-primary text-white font-black text-xs">{profile?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border border-slate-100 shadow-xl mt-2 bg-white text-l-on-surface">
              <DropdownMenuItem className="h-10 rounded-lg cursor-pointer gap-3 text-sm font-medium" onClick={() => navigate("/profile")}>
                <User className="h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="h-10 rounded-lg cursor-pointer gap-3 text-sm font-medium" onClick={() => navigate("/settings")}>
                <Settings className="h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="h-10 rounded-lg cursor-pointer gap-3 text-sm font-medium" onClick={() => switchRole(otherRole)}>
                <ArrowLeftRight className="h-4 w-4" /> Switch to {otherRole}
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem className="h-10 rounded-lg cursor-pointer gap-3 text-sm font-medium" onClick={() => navigate("/admin")}>
                  <Shield className="h-4 w-4" /> Admin
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="my-1 bg-slate-100" />
              <DropdownMenuItem className="h-10 rounded-lg cursor-pointer gap-3 text-sm font-medium text-destructive focus:text-destructive" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function MobileBottomNav() {
  const { activeRole } = useAuth();
  const location = useLocation();
  const items = activeRole === "worker" ? workerNav.slice(0, 5) : customerNav.slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-[var(--glass-border)] bg-[var(--glass-sidebar)] backdrop-blur-xl py-2 lg:hidden safe-area-pb">
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
      <div className="min-h-screen flex w-full relative selection:bg-l-primary/30 selection:text-l-on-surface bg-white">
        <div className="hidden lg:block z-10 sticky top-0 h-screen transition-all duration-300 bg-slate-50 border-r border-slate-100">
          <AppSidebarContent />
        </div>
        <div className="flex-1 flex flex-col min-w-0 z-10 relative">
          <TopBar />
          <main className="flex-1 pb-24 lg:pb-8 pt-4 bg-[#f9f9ff]">
            {children}
          </main>
          <MobileBottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
}
