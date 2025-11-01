import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Loader2,
  Globe,
  Facebook,
  Phone,
  MapPin,
  Info,
  Menu,
  MessageCircle,
} from "lucide-react";
import { SiWhatsapp, SiTelegram } from "react-icons/si";
import { MapPicker } from "@/components/map-picker";

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

const FIELD_DESCRIPTIONS: Record<
  string,
  { description: string; location: string }
> = {
  contact_address: {
    description: "Your business office address",
    location: "Displayed in: Footer, Contact Page, Contact Form",
  },
  contact_hours: {
    description: "Business operating hours",
    location: "Displayed in: Contact Page",
  },
  contact_email: {
    description: "Business email for inquiries",
    location: "Displayed in: Footer, Contact Page",
  },
  contact_phone: {
    description: "Primary business phone number",
    location: "Displayed in: Footer, Contact Page, Navbar Contact Dropdown",
  },
  phone: {
    description: "Alternative phone number",
    location: "Displayed in: Footer, Navbar Contact Dropdown",
  },
  office_latitude: {
    description: "Office location latitude coordinate for map display",
    location: "Displayed in: Contact Page Map",
  },
  office_longitude: {
    description: "Office location longitude coordinate for map display",
    location: "Displayed in: Contact Page Map",
  },
  about_mission: {
    description: "Company mission statement",
    location: "Displayed in: About Page (Mission Section)",
  },
  about_vision: {
    description: "Company vision statement",
    location: "Displayed in: About Page (Vision Section)",
  },
  about_values: {
    description: "Company core values",
    location: "Displayed in: About Page (Values Section)",
  },
};

// Separate component to handle individual setting with its own state
function SettingItem({
  setting,
  onUpdate,
  isPending,
}: {
  setting: SiteSetting;
  onUpdate: (data: { key: string; value: string; valueBn?: string }) => void;
  isPending: boolean;
}) {
  const [enValue, setEnValue] = useState(setting.value);
  const [bnValue, setBnValue] = useState(setting.valueBn || "");
  const fieldInfo = FIELD_DESCRIPTIONS[setting.key];
  const isLongText =
    setting.key.includes("mission") ||
    setting.key.includes("vision") ||
    setting.key.includes("values") ||
    setting.key.includes("address");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onUpdate({
          key: setting.key,
          value: enValue,
          valueBn: bnValue,
        });
      }}
      className="space-y-3 p-4 border border-border rounded-lg bg-card/50"
    >
      <div className="space-y-1">
        <Label htmlFor={setting.key} className="text-base font-semibold">
          {setting.label}
        </Label>
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
          <TabsTrigger value="en" data-testid={`tab-en-${setting.key}`}>
            English
          </TabsTrigger>
          <TabsTrigger value="bn" data-testid={`tab-bn-${setting.key}`}>
            বাংলা
          </TabsTrigger>
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
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update"}
      </Button>
    </form>
  );
}

export default function AdminCMS() {
  const { toast } = useToast();
  const { token } = useAuth();

  const { data: settings, isLoading: settingsLoading } = useQuery<
    SiteSetting[]
  >({
    queryKey: ["/api/cms/settings"],
  });

  const { data: socialMedia, isLoading: socialLoading } = useQuery<
    SocialMedia[]
  >({
    queryKey: ["/api/cms/social-media"],
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({
      key,
      value,
      valueBn,
    }: {
      key: string;
      value: string;
      valueBn?: string;
    }) => {
      return await apiRequest("PUT", `/api/cms/settings/${key}`, {
        value,
        valueBn,
      });
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
    if (platformLower === "facebook") return <Facebook className={size} />;
    if (platformLower === "telegram") return <SiTelegram className={size} />;
    if (platformLower === "whatsapp") return <SiWhatsapp className={size} />;
    return <Globe className={size} />;
  };

  if (settingsLoading || socialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const contactSettings =
    settings?.filter(
      (s) => s.key.startsWith("contact_") && !s.key.includes("office"),
    ) || [];

  const aboutSettings =
    settings?.filter((s) => s.key.startsWith("about_")) || [];

  const otherSettings =
    settings?.filter(
      (s) =>
        !s.key.startsWith("contact_") &&
        !s.key.startsWith("about_") &&
        !s.key.startsWith("office_"),
    ) || [];

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1
          className="text-2xl md:text-3xl font-display font-bold"
          data-testid="text-cms-title"
        >
          CMS Settings
        </h1>
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

      <Card data-testid="card-office-location">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <MapPin className="w-5 h-5 flex-shrink-0" />
            <span>Office Location</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Click on the map to set office coordinates. Displayed on the Contact
            Page map.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings &&
            (() => {
              const latSetting = settings.find(
                (s) => s.key === "office_latitude",
              );
              const lngSetting = settings.find(
                (s) => s.key === "office_longitude",
              );
              const currentLat = parseFloat(latSetting?.value || "23.8103");
              const currentLng = parseFloat(lngSetting?.value || "90.4125");

              return (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    <p>
                      Click anywhere on the map to update the office location
                      coordinates
                    </p>
                  </div>
                  <MapPicker
                    latitude={currentLat}
                    longitude={currentLng}
                    onLocationChange={async (lat, lng) => {
                      try {
                        await updateSettingMutation.mutateAsync({
                          key: "office_latitude",
                          value: lat.toFixed(7),
                        });
                        await updateSettingMutation.mutateAsync({
                          key: "office_longitude",
                          value: lng.toFixed(7),
                        });
                        queryClient.invalidateQueries({
                          queryKey: ["/api/cms/settings"],
                        });
                      } catch (error) {
                        console.error("Failed to update coordinates:", error);
                      }
                    }}
                  />
                  <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Latitude
                      </p>
                      <p className="font-mono text-sm">
                        {currentLat.toFixed(7)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Longitude
                      </p>
                      <p className="font-mono text-sm">
                        {currentLng.toFixed(7)}
                      </p>
                    </div>
                  </div>
                </>
              );
            })()}
        </CardContent>
      </Card>

      <Card data-testid="card-navbar-dropdown">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Menu className="w-5 h-5 flex-shrink-0" />
            <span>Navbar Contact Dropdown</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Manage links for the 5 contact options in the navbar dropdown menu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 p-3 bg-muted/50 rounded-lg">
              <Info className="w-4 h-4 flex-shrink-0" />
              <p>
                Update URLs for Facebook, Telegram, WhatsApp, Call (phone
                number), and Contact Page. These appear in the navbar Contact
                dropdown.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {(() => {
                const facebook = socialMedia?.find(
                  (s) => s.platform.toLowerCase() === "facebook",
                );
                const telegram = socialMedia?.find(
                  (s) => s.platform.toLowerCase() === "telegram",
                );
                const whatsapp = socialMedia?.find(
                  (s) => s.platform.toLowerCase() === "whatsapp",
                );
                const phoneNumber =
                  settings?.find((s) => s.key === "phone")?.value || "";

                return (
                  <>
                    {facebook && (
                      <form
                        key={facebook.id}
                        onSubmit={handleSocialSubmit}
                        className="space-y-2 p-4 border border-border rounded-lg bg-card/50"
                      >
                        <input type="hidden" name="id" value={facebook.id} />
                        <Label
                          htmlFor={`navbar-facebook`}
                          className="flex items-center gap-2 font-semibold"
                        >
                          <Facebook className="w-5 h-5" />
                          Facebook
                        </Label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Input
                            id={`navbar-facebook`}
                            name="url"
                            defaultValue={facebook.url}
                            placeholder="https://facebook.com/yourpage"
                            data-testid="input-navbar-facebook"
                            className="flex-1"
                          />
                          <Button
                            type="submit"
                            disabled={updateSocialMutation.isPending}
                            data-testid="button-update-navbar-facebook"
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
                    )}

                    {telegram && (
                      <form
                        key={telegram.id}
                        onSubmit={handleSocialSubmit}
                        className="space-y-2 p-4 border border-border rounded-lg bg-card/50"
                      >
                        <input type="hidden" name="id" value={telegram.id} />
                        <Label
                          htmlFor={`navbar-telegram`}
                          className="flex items-center gap-2 font-semibold"
                        >
                          <SiTelegram className="w-5 h-5" />
                          Telegram
                        </Label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Input
                            id={`navbar-telegram`}
                            name="url"
                            defaultValue={telegram.url}
                            placeholder="https://t.me/yourgroup"
                            data-testid="input-navbar-telegram"
                            className="flex-1"
                          />
                          <Button
                            type="submit"
                            disabled={updateSocialMutation.isPending}
                            data-testid="button-update-navbar-telegram"
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
                    )}

                    {whatsapp && (
                      <form
                        key={whatsapp.id}
                        onSubmit={handleSocialSubmit}
                        className="space-y-2 p-4 border border-border rounded-lg bg-card/50"
                      >
                        <input type="hidden" name="id" value={whatsapp.id} />
                        <Label
                          htmlFor={`navbar-whatsapp`}
                          className="flex items-center gap-2 font-semibold"
                        >
                          <SiWhatsapp className="w-5 h-5" />
                          WhatsApp
                        </Label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Input
                            id={`navbar-whatsapp`}
                            name="url"
                            defaultValue={whatsapp.url}
                            placeholder="https://wa.me/1234567890"
                            data-testid="input-navbar-whatsapp"
                            className="flex-1"
                          />
                          <Button
                            type="submit"
                            disabled={updateSocialMutation.isPending}
                            data-testid="button-update-navbar-whatsapp"
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
                    )}

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const value = formData.get("value") as string;
                        updateSettingMutation.mutate({ key: "phone", value });
                      }}
                      className="space-y-2 p-4 border border-border rounded-lg bg-card/50"
                    >
                      <Label
                        htmlFor="navbar-phone"
                        className="flex items-center gap-2 font-semibold"
                      >
                        <Phone className="w-5 h-5" />
                        Call (Phone Number)
                      </Label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          id="navbar-phone"
                          name="value"
                          defaultValue={phoneNumber}
                          placeholder="+880 1234 567890"
                          data-testid="input-navbar-phone"
                          className="flex-1"
                        />
                        <Button
                          type="submit"
                          disabled={updateSettingMutation.isPending}
                          data-testid="button-update-navbar-phone"
                          className="sm:w-auto"
                        >
                          {updateSettingMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Update"
                          )}
                        </Button>
                      </div>
                    </form>

                    <div className="p-4 border border-border rounded-lg bg-card/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        <div>
                          <p className="font-semibold">Contact Page</p>
                          <p className="text-xs text-muted-foreground">
                            Always visible - links to /contact
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Fixed Link
                      </span>
                    </div>
                  </>
                );
              })()}
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
              <form
                key={item.id}
                onSubmit={handleSocialSubmit}
                className="space-y-2 p-4 border border-border rounded-lg bg-card/50"
              >
                <input type="hidden" name="id" value={item.id} />
                <Label
                  htmlFor={`social-${item.id}`}
                  className="flex items-center gap-2 font-semibold"
                >
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
            <CardDescription>Additional website configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {otherSettings.map((setting) => (
              <form
                key={setting.id}
                onSubmit={handleSettingSubmit}
                className="space-y-2"
              >
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
