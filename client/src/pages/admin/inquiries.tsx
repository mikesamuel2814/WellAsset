import { useQuery, useMutation } from "@tanstack/react-query";
import { MessageSquare, Mail, Phone, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Inquiry } from "@shared/schema";

export default function AdminInquiries() {
  const { toast } = useToast();

  const { data: inquiries, isLoading } = useQuery<Inquiry[]>({
    queryKey: ["/api/inquiries"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PUT", `/api/inquiries/${id}`, { status }),
    onSuccess: () => {
      toast({ title: "Inquiry status updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries"] });
    },
  });

  const handleMarkAsRead = (id: string) => {
    updateStatusMutation.mutate({ id, status: "read" });
  };

  const handleMarkAsResolved = (id: string) => {
    updateStatusMutation.mutate({ id, status: "resolved" });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-2 tracking-tight" data-testid="text-page-title">
          Inquiries
        </h1>
        <p className="text-muted-foreground">
          View and manage customer inquiries
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading inquiries...</p>
        </div>
      ) : !inquiries || inquiries.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No inquiries yet</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {inquiries.map((inquiry) => (
            <Card key={inquiry.id} data-testid={`card-inquiry-${inquiry.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="font-display text-xl mb-2">{inquiry.name}</CardTitle>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${inquiry.email}`} className="hover:text-primary">
                          {inquiry.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${inquiry.phone}`} className="hover:text-primary">
                          {inquiry.phone}
                        </a>
                      </div>
                      {inquiry.createdAt && (
                        <p className="text-xs">
                          {new Date(inquiry.createdAt).toLocaleDateString()} at{" "}
                          {new Date(inquiry.createdAt).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={
                      inquiry.status === "unread" ? "default" :
                      inquiry.status === "resolved" ? "secondary" :
                      "outline"
                    }
                  >
                    {inquiry.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Message:</h4>
                  <p className="text-foreground/80 whitespace-pre-line">{inquiry.message}</p>
                </div>
                {inquiry.propertyId && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>Related to Property ID: {inquiry.propertyId}</span>
                  </div>
                )}
                <div className="flex gap-3 flex-wrap">
                  {inquiry.status === "unread" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAsRead(inquiry.id)}
                      disabled={updateStatusMutation.isPending}
                      data-testid={`button-mark-read-${inquiry.id}`}
                    >
                      Mark as Read
                    </Button>
                  )}
                  {inquiry.status !== "resolved" && (
                    <Button
                      size="sm"
                      onClick={() => handleMarkAsResolved(inquiry.id)}
                      disabled={updateStatusMutation.isPending}
                      data-testid={`button-mark-resolved-${inquiry.id}`}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark as Resolved
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
