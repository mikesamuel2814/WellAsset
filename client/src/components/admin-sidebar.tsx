import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Building2, LayoutDashboard, Home, Users, MessageSquare, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminSidebar() {
  const [location, setLocation] = useLocation();

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { title: "Properties", icon: Home, path: "/admin/properties" },
    { title: "Agents", icon: Users, path: "/admin/agents" },
    { title: "Inquiries", icon: MessageSquare, path: "/admin/inquiries" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    setLocation("/admin/login");
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-sidebar-primary rounded-md flex items-center justify-center">
            <Building2 className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg">Well Asset</h2>
            <p className="text-xs text-sidebar-foreground/70">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarMenu>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  className={isActive ? "bg-sidebar-accent" : ""}
                  data-testid={`link-${item.title.toLowerCase()}`}
                >
                  <Link href={item.path}>
                    <Icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start hover-elevate"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
