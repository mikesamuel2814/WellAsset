import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Users, MessageSquare, TrendingUp } from "lucide-react";
import type { Property, Agent, Inquiry } from "@shared/schema";

export default function AdminDashboard() {
  const { data: properties } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: agents } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  const { data: inquiries } = useQuery<Inquiry[]>({
    queryKey: ["/api/inquiries"],
  });

  const activeProperties = properties?.filter(p => p.status === "active").length || 0;
  const totalProperties = properties?.length || 0;
  const totalAgents = agents?.length || 0;
  const unreadInquiries = inquiries?.filter(i => i.status === "unread").length || 0;
  const recentInquiries = inquiries?.slice(0, 5) || [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-2 tracking-tight" data-testid="text-dashboard-title">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your real estate platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Home className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-properties">{totalProperties}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeProperties} active listings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-listings">{activeProperties}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-agents">{totalAgents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active real estate agents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Inquiries</CardTitle>
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-unread-inquiries">{unreadInquiries}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Pending responses
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Recent Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            {recentInquiries.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No inquiries yet</p>
            ) : (
              <div className="space-y-4">
                {recentInquiries.map((inquiry) => (
                  <div key={inquiry.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${inquiry.status === "unread" ? "bg-primary" : "bg-muted-foreground"}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{inquiry.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{inquiry.email}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{inquiry.message}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${inquiry.status === "unread" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {inquiry.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Property Views</span>
              <span className="font-semibold">Coming Soon</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Inquiries</span>
              <span className="font-semibold">{inquiries?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Response Rate</span>
              <span className="font-semibold">
                {inquiries && inquiries.length > 0
                  ? Math.round(((inquiries.filter(i => i.status === "resolved").length / inquiries.length) * 100))
                  : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
