import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SEOHead } from "@/components/seo-head";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertInquirySchema } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { PropertyMap } from "@/components/property-map";
import type { z } from "zod";

type SiteSetting = {
  id: string;
  key: string;
  value: string;
  valueBn?: string;
};

export default function Contact() {
  const { toast } = useToast();
  const { t } = useI18n();
  
  const { data: settings } = useQuery<SiteSetting[]>({
    queryKey: ["/api/cms/settings"],
  });

  const officeLatitude = settings?.find(s => s.key === 'office_latitude')?.value;
  const officeLongitude = settings?.find(s => s.key === 'office_longitude')?.value;

  const form = useForm<z.infer<typeof insertInquirySchema>>({
    resolver: zodResolver(insertInquirySchema.extend({
      propertyId: insertInquirySchema.shape.propertyId.optional(),
    })),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof insertInquirySchema>) =>
      apiRequest("POST", "/api/inquiries", data),
    onSuccess: () => {
      toast({
        title: t("contact.successTitle"),
        description: t("contact.successDesc"),
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries"] });
    },
    onError: () => {
      toast({
        title: t("contact.errorTitle"),
        description: t("contact.errorDesc"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof insertInquirySchema>) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Contact Us - Well Asset Development"
        description="Get in touch with Well Asset Development Co., Ltd for luxury real estate inquiries in Dhaka, Bangladesh. Call us, email us, or visit our office in Dhaka."
        keywords="contact Well Asset, real estate inquiries Dhaka, property contact Bangladesh"
      />
      <div className="bg-card border-b">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-4 tracking-tight" data-testid="text-page-title">
            {t("contact.title")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            {t("contact.subtitle")}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{t("contact.phone")}</h3>
              <p className="text-muted-foreground mb-2">{t("contact.phoneAvailable")}</p>
              <a href={`tel:${t("contact.phoneNumber").replace(/\s/g, '')}`} className="text-primary hover:underline">
                {t("contact.phoneNumber")}
              </a>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{t("contact.email")}</h3>
              <p className="text-muted-foreground mb-2">{t("contact.emailResponse")}</p>
              <a href={`mailto:${t("contact.emailAddress")}`} className="text-primary hover:underline">
                {t("contact.emailAddress")}
              </a>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{t("contact.office")}</h3>
              <p className="text-muted-foreground mb-2">{t("contact.officeVisit")}</p>
              <p className="text-primary whitespace-pre-line">
                {t("contact.officeAddress")}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="font-display font-semibold text-3xl mb-6 tracking-tight">{t("contact.formTitle")}</h2>
            <p className="text-muted-foreground mb-8">
              {t("contact.formDesc")}
            </p>
            
            <Card>
              <CardContent className="p-8">
                <p className="text-sm text-muted-foreground mb-6">
                  All fields are required
                </p>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            {t("contact.fullName")} <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={t("contact.fullNamePlaceholder")}
                              {...field} 
                              data-testid="input-contact-name"
                              className={form.formState.errors.name ? "border-destructive" : ""}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            {t("contact.emailLabel")} <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder={t("contact.emailPlaceholder")}
                              {...field} 
                              data-testid="input-contact-email"
                              className={form.formState.errors.email ? "border-destructive" : ""}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            {t("contact.phoneLabel")} <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="tel" 
                              placeholder={t("contact.phonePlaceholder")}
                              {...field} 
                              data-testid="input-contact-phone"
                              className={form.formState.errors.phone ? "border-destructive" : ""}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            {t("contact.messageLabel")} <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t("contact.messagePlaceholder")}
                              rows={6}
                              {...field}
                              data-testid="textarea-contact-message"
                              className={form.formState.errors.message ? "border-destructive" : ""}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full font-display text-base tracking-wide" 
                      size="lg"
                      disabled={mutation.isPending || !form.formState.isValid}
                      data-testid="button-submit-contact"
                    >
                      {mutation.isPending ? (
                        t("contact.sending")
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          {t("contact.sendMessage")}
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="font-display font-semibold text-3xl mb-6 tracking-tight">{t("contact.visitOffice")}</h2>
            <div className="mb-6">
              <PropertyMap 
                location={t("contact.officeAddress")}
                title={t("footer.companyName") || "Well Asset Development Co., Ltd"}
                latitude={officeLatitude}
                longitude={officeLongitude}
              />
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="font-display">{t("contact.officeHours")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("contact.mondayFriday")}</span>
                  <span className="font-medium">{t("contact.mondayFridayTime")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("contact.saturday")}</span>
                  <span className="font-medium">{t("contact.saturdayTime")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("contact.sunday")}</span>
                  <span className="font-medium">{t("contact.sundayClosed")}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
