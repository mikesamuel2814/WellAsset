import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2, Globe, Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, Info, Eye, EyeOff, Menu } from "lucide-react";
import { SiWhatsapp, SiTelegram } from "react-icons/si";

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
  isActive: boolean;
  order: number;
};

const FIELD_DESCRIPTIONS: Record<string, { description: string; location: string }> = {
  contact_address: {
    description: "Your business office address",
    location: "Displayed in: Footer, Contact Page, Contact Form"
  },
  contact_hours: {
    description: "Business operating hours",
    location: "Displayed in: Contact Page"
  },
  contact_email: {
    description: "Business email for inquiries",
    location: "Displayed in: Footer, Contact Page"
  },
  contact_phone: {
    description: "Primary business phone number",
    location: "Displayed in: Footer, Contact Page, Navbar Contact Dropdown"
  },
  phone: {
    description: "Alternative phone number",
    location: "Displayed in: Footer, Navbar Contact Dropdown"
  },
  office_latitude: {
    description: "Office location latitude coordinate for map display",
    location: "Displayed in: Contact Page Map"
  },
  office_longitude: {
    description: "Office location longitude coordinate for map display",
    location: "Displayed in: Contact Page Map"
  },
  about_mission: {
    description: "Company mission statement",
    location: "Displayed in: About Page (Mission Section)"
  },
  about_vision: {
    description: "Company vision statement",
    location: "Displayed in: About Page (Vision Section)"
  },
  about_values: {
    description: "Company core values",
    location: "Displayed in: About Page (Values Section)"
  },
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
  const fieldInfo = FIELD_DESCRIPTIONS[setting.key];
  const isLongText = setting.key.includes('mission') || setting.key.includes('vision') || setting.key.includes('values') || setting.key.includes('address');

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
      className="space-y-3 p-4 border border-border rounded-lg bg-card/50"
    >
      <div className="space-y-1">
        <Label htmlFor={setting.key} className="text-base font-semibold">{setting.label}</Label>
        {fieldInfo && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-start gap-1.5">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{fieldInfo.description}</span>
            </p>
            <p className="text-xs text-muted-foreground/80 ml-5">
              📍 {fieldInfo.location}
            </p>
          </div>
        )}
      </div>
      <Tabs defaultValue="en" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="en" data-testid={`tab-en-${setting.key}`}>English</TabsTrigger>
          <TabsTrigger value="bn" data-testid={`tab-bn-${setting.key}`}>বাংলা</TabsTrigger>
        </TabsList>
        <TabsContent value="en" className="space-y-2">
          {isLongText ? (
            <Textarea
              id={setting.key}
              value={enValue}
              onChange={(e) => setEnValue(e.target.value)}
              placeholder={`${setting.label} (English)`}
              data-testid={`input-${setting.key}-en`}
              rows={4}
            />
          ) : (
            <Input
              id={setting.key}
              value={enValue}
              onChange={(e) => setEnValue(e.target.value)}
              placeholder={`${setting.label} (English)`}
              data-testid={`input-${setting.key}-en`}
            />
          )}
        </TabsContent>
        <TabsContent value="bn" className="space-y-2">
          {isLongText ? (
            <Textarea
              id={`${setting.key}-bn`}
              value={bnValue}
              onChange={(e) => setBnValue(e.target.value)}
              placeholder={`${setting.label} (বাংলা)`}
              data-testid={`input-${setting.key}-bn`}
              rows={4}
            />
          ) : (
            <Input
              id={`${setting.key}-bn`}
              value={bnValue}
              onChange={(e) => setBnValue(e.target.value)}
              placeholder={`${setting.label} (বাংলা)`}
              data-testid={`input-${setting.key}-bn`}
            />
          )}
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
      return await apiRequest("PUT", `/api/cms/social-media/${id}`, { url });
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

  const toggleSocialVisibilityMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return await apiRequest("PUT", `/api/cms/social-media/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/social-media"] });
      toast({
        title: "Success",
        description: "Navbar dropdown visibility updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update visibility",
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

  const getIcon = (platform: string, size = "w-5 h-5") => {
    const platformLower = platform.toLowerCase();
    if (platformLower === 'facebook') return <Facebook className={size} />;
    if (platformLower === 'twitter') return <Twitter className={size} />;
    if (platformLower === 'instagram') return <Instagram className={size} />;
    if (platformLower === 'linkedin') return <Linkedin className={size} />;
    if (platformLower === 'telegram') return <SiTelegram className={size} />;
    if (platformLower === 'whatsapp') return <SiWhatsapp className={size} />;
    return <Globe className={size} />;
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
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold" data-testid="text-cms-title">CMS Settings</h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Manage website content, contact information, and social media links
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card data-testid="card-contact-settings" className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Phone className="w-5 h-5 flex-shrink-0" />
              <span>Contact Information</span>
            </CardTitle>
            <CardDescription className="text-sm">
              Update contact details displayed on the website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
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

        <Card data-testid="card-about-settings" className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Globe className="w-5 h-5 flex-shrink-0" />
              <span>About Page Content</span>
            </CardTitle>
            <CardDescription className="text-sm">
              Update about page sections (mission, vision, values)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
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

      <Card data-testid="card-navbar-dropdown">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Menu className="w-5 h-5 flex-shrink-0" />
            <span>Navbar Contact Dropdown</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Control which contact options appear in the navbar dropdown menu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 p-3 bg-muted/50 rounded-lg">
              <Info className="w-4 h-4 flex-shrink-0" />
              <p>Toggle the visibility of social media links and phone number in the navbar Contact dropdown. The Contact Page link is always visible.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {socialMedia?.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card/50">
                  <div className="flex items-center gap-3">
                    {getIcon(item.platform)}
                    <span className="font-medium">{item.platform}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </span>
                    <Switch
                      checked={item.isActive}
                      onCheckedChange={(checked) => {
                        toggleSocialVisibilityMutation.mutate({ 
                          id: item.id, 
                          isActive: checked 
                        });
                      }}
                      data-testid={`switch-navbar-${item.platform.toLowerCase()}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-social-media">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Facebook className="w-5 h-5 flex-shrink-0" />
            <span>Social Media Links</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Update social media URLs displayed in the footer and navbar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {socialMedia?.map((item) => (
              <form key={item.id} onSubmit={handleSocialSubmit} className="space-y-2 p-4 border border-border rounded-lg bg-card/50">
                <input type="hidden" name="id" value={item.id} />
                <Label htmlFor={`social-${item.id}`} className="flex items-center gap-2 font-semibold">
                  {getIcon(item.platform)}
                  {item.platform}
                </Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    id={`social-${item.id}`}
                    name="url"
                    defaultValue={item.url}
                    placeholder={`Enter ${item.platform} URL`}
                    data-testid={`input-social-${item.platform.toLowerCase()}`}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={updateSocialMutation.isPending}
                    data-testid={`button-update-social-${item.platform.toLowerCase()}`}
                    className="sm:w-auto"
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
