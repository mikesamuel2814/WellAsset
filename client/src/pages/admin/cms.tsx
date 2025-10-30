import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2, Globe, Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from "lucide-react";

type SiteSetting = {
  id: string;
  key: string;
  value: string;
  valueBn?: string;
  label: string;
};

type SocialMedia = {
  id: string;
  platform: string;
  url: string;
  icon: string;
};

// Separate component to handle individual setting with its own state
function SettingItem({ 
  setting, 
  onUpdate, 
  isPending 
}: { 
  setting: SiteSetting; 
  onUpdate: (data: { key: string; value: string; valueBn?: string }) => void;
  isPending: boolean;
}) {
  const [enValue, setEnValue] = useState(setting.value);
  const [bnValue, setBnValue] = useState(setting.valueBn || "");

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        onUpdate({ 
          key: setting.key, 
          value: enValue, 
          valueBn: bnValue 
        });
      }} 
      className="space-y-3"
    >
      <Label htmlFor={setting.key}>{setting.label}</Label>
      <Tabs defaultValue="en" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="en" data-testid={`tab-en-${setting.key}`}>English</TabsTrigger>
          <TabsTrigger value="bn" data-testid={`tab-bn-${setting.key}`}>বাংলা</TabsTrigger>
        </TabsList>
        <TabsContent value="en" className="space-y-2">
          <Input
            id={setting.key}
            value={enValue}
            onChange={(e) => setEnValue(e.target.value)}
            placeholder={`${setting.label} (English)`}
            data-testid={`input-${setting.key}-en`}
          />
        </TabsContent>
        <TabsContent value="bn" className="space-y-2">
          <Input
            id={`${setting.key}-bn`}
            value={bnValue}
            onChange={(e) => setBnValue(e.target.value)}
            placeholder={`${setting.label} (বাংলা)`}
            data-testid={`input-${setting.key}-bn`}
          />
        </TabsContent>
      </Tabs>
      <Button 
        type="submit" 
        disabled={isPending}
        data-testid={`button-update-${setting.key}`}
        className="w-full"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "Update"
        )}
      </Button>
    </form>
  );
}

export default function AdminCMS() {
  const { toast } = useToast();
  const { token } = useAuth();

  const { data: settings, isLoading: settingsLoading } = useQuery<SiteSetting[]>({
    queryKey: ["/api/cms/settings"],
  });

  const { data: socialMedia, isLoading: socialLoading } = useQuery<SocialMedia[]>({
    queryKey: ["/api/cms/social-media"],
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value, valueBn }: { key: string; value: string; valueBn?: string }) => {
      return await apiRequest("PUT", `/api/cms/settings/${key}`, { value, valueBn });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/settings"] });
      toast({
        title: "Success",
        description: "Setting updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      });
    },
  });

  const updateSocialMutation = useMutation({
    mutationFn: async ({ id, url }: { id: string; url: string }) => {
      const res = await fetch(`/api/cms/social-media/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error("Failed to update social media");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/social-media"] });
      toast({
        title: "Success",
        description: "Social media link updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update social media link",
        variant: "destructive",
      });
    },
  });

  const handleSettingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const key = formData.get("key") as string;
    const value = formData.get("value") as string;
    const valueBn = formData.get("valueBn") as string;
    updateSettingMutation.mutate({ key, value, valueBn });
  };

  const handleSocialSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = formData.get("id") as string;
    const url = formData.get("url") as string;
    updateSocialMutation.mutate({ id, url });
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Facebook,
      Twitter,
      Instagram,
      Linkedin,
      Youtube,
      Mail,
      Phone,
      MapPin,
      Globe,
    };
    const Icon = icons[iconName] || Globe;
    return <Icon className="w-5 h-5" />;
  };

  if (settingsLoading || socialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const contactSettings = settings?.filter(s => 
    s.key.startsWith('contact_') || s.key.startsWith('office_')
  ) || [];

  const aboutSettings = settings?.filter(s => 
    s.key.startsWith('about_')
  ) || [];

  const otherSettings = settings?.filter(s => 
    !s.key.startsWith('contact_') && !s.key.startsWith('about_') && !s.key.startsWith('office_')
  ) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold" data-testid="text-cms-title">CMS Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage website content, contact information, and social media links
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card data-testid="card-contact-settings">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contact Information
            </CardTitle>
            <CardDescription>
              Update contact details displayed on the website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {contactSettings.map((setting) => (
              <SettingItem 
                key={setting.id}
                setting={setting}
                onUpdate={(data) => updateSettingMutation.mutate(data)}
                isPending={updateSettingMutation.isPending}
              />
            ))}
          </CardContent>
        </Card>

        <Card data-testid="card-about-settings">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              About Page Content
            </CardTitle>
            <CardDescription>
              Update about page sections (mission, vision, values)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {aboutSettings.map((setting) => (
              <SettingItem 
                key={setting.id}
                setting={setting}
                onUpdate={(data) => updateSettingMutation.mutate(data)}
                isPending={updateSettingMutation.isPending}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-social-media">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Facebook className="w-5 h-5" />
            Social Media Links
          </CardTitle>
          <CardDescription>
            Update social media URLs displayed in the footer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {socialMedia?.map((item) => (
              <form key={item.id} onSubmit={handleSocialSubmit} className="space-y-2">
                <input type="hidden" name="id" value={item.id} />
                <Label htmlFor={`social-${item.id}`} className="flex items-center gap-2">
                  {getIcon(item.icon)}
                  {item.platform}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id={`social-${item.id}`}
                    name="url"
                    defaultValue={item.url}
                    placeholder={`Enter ${item.platform} URL`}
                    data-testid={`input-social-${item.platform.toLowerCase()}`}
                  />
                  <Button 
                    type="submit" 
                    disabled={updateSocialMutation.isPending}
                    data-testid={`button-update-social-${item.platform.toLowerCase()}`}
                  >
                    {updateSocialMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Update"
                    )}
                  </Button>
                </div>
              </form>
            ))}
          </div>
        </CardContent>
      </Card>

      {otherSettings.length > 0 && (
        <Card data-testid="card-other-settings">
          <CardHeader>
            <CardTitle>Other Settings</CardTitle>
            <CardDescription>
              Additional website configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {otherSettings.map((setting) => (
              <form key={setting.id} onSubmit={handleSettingSubmit} className="space-y-2">
                <input type="hidden" name="key" value={setting.key} />
                <Label htmlFor={setting.key}>{setting.label}</Label>
                <div className="flex gap-2">
                  <Input
                    id={setting.key}
                    name="value"
                    defaultValue={setting.value}
                    placeholder={setting.label}
                    data-testid={`input-${setting.key}`}
                  />
                  <Button 
                    type="submit" 
                    disabled={updateSettingMutation.isPending}
                    data-testid={`button-update-${setting.key}`}
                  >
                    {updateSettingMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Update"
                    )}
                  </Button>
                </div>
              </form>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
