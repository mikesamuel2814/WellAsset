import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/lib/auth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Home from "@/pages/home";
import Properties from "@/pages/properties";
import PropertyDetails from "@/pages/property-details";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProperties from "@/pages/admin/properties";
import AdminAgents from "@/pages/admin/agents";
import AdminInquiries from "@/pages/admin/inquiries";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function Router() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, authHydrated } = useAuth();
  const isAdminRoute = location.startsWith("/admin");
  const isAdminLogin = location === "/admin/login";

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  useEffect(() => {
    if (!authHydrated) return;
    
    if (isAdminRoute && !isAdminLogin && !isAuthenticated) {
      setLocation("/admin/login");
    } else if (isAdminLogin && isAuthenticated) {
      setLocation("/admin/dashboard");
    }
  }, [location, isAuthenticated, authHydrated, isAdminRoute, isAdminLogin, setLocation]);

  if (isAdminRoute && !authHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" data-testid="loading-spinner"></div>
      </div>
    );
  }

  if (isAdminRoute) {
    if (isAdminLogin) {
      if (isAuthenticated) {
        return <Redirect to="/admin/dashboard" />;
      }
      return (
        <Switch>
          <Route path="/admin/login" component={AdminLogin} />
        </Switch>
      );
    }

    if (!isAuthenticated) {
      return <Redirect to="/admin/login" />;
    }

    return (
      <SidebarProvider style={sidebarStyle as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <header className="flex items-center gap-4 px-6 py-4 border-b">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
            </header>
            <main className="flex-1 overflow-auto">
              <Switch>
                <Route path="/admin/dashboard" component={AdminDashboard} />
                <Route path="/admin/properties" component={AdminProperties} />
                <Route path="/admin/agents" component={AdminAgents} />
                <Route path="/admin/inquiries" component={AdminInquiries} />
                <Route component={NotFound} />
              </Switch>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <>
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/properties" component={Properties} />
        <Route path="/properties/:id" component={PropertyDetails} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route component={NotFound} />
      </Switch>
      <Footer />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="well-asset-theme">
        <AuthProvider>
          <I18nProvider>
            <TooltipProvider>
              <Router />
              <Toaster />
            </TooltipProvider>
          </I18nProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
