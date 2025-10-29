import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { MapPin, Bed, Bath, Maximize, ArrowLeft, Mail, Phone, User, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertInquirySchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useI18n, usePropertyText } from "@/lib/i18n";
import type { Property } from "@shared/schema";
import type { z } from "zod";

export default function PropertyDetails() {
  const [, params] = useRoute("/properties/:id");
  const propertyId = params?.id;
  const [selectedImage, setSelectedImage] = useState(0);
  const { toast } = useToast();
  const { t } = useI18n();

  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: ["/api/properties", propertyId],
    queryFn: async () => {
      const response = await fetch(`/api/properties/${propertyId}`);
      if (!response.ok) throw new Error("Failed to fetch property");
      return response.json();
    },
    enabled: !!propertyId,
  });

  const form = useForm<z.infer<typeof insertInquirySchema>>({
    resolver: zodResolver(insertInquirySchema.extend({
      propertyId: insertInquirySchema.shape.propertyId.optional(),
    })),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      propertyId: propertyId || undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof insertInquirySchema>) =>
      apiRequest("POST", "/api/inquiries", data),
    onSuccess: () => {
      toast({
        title: "Inquiry sent successfully!",
        description: "We'll get back to you as soon as possible.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries"] });
    },
    onError: () => {
      toast({
        title: "Error sending inquiry",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof insertInquirySchema>) => {
    mutation.mutate({ ...data, propertyId: propertyId });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="h-8 w-32 bg-muted rounded animate-pulse mb-8"></div>
          <div className="h-96 bg-muted rounded-lg animate-pulse mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-48 bg-muted rounded animate-pulse"></div>
              <div className="h-32 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="h-64 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display font-semibold text-2xl mb-4">Error loading property</h2>
          <p className="text-muted-foreground mb-6">Please try again later</p>
          <Link href="/properties">
            <Button variant="default" data-testid="button-back-error">Back to Properties</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display font-semibold text-2xl mb-4">Property not found</h2>
          <Link href="/properties">
            <Button variant="default" data-testid="button-back-not-found">Back to Properties</Button>
          </Link>
        </div>
      </div>
    );
  }

  const price = parseFloat(property.price as any);
  const images = property.images || [];
  const title = usePropertyText(property, 'title');
  const location = usePropertyText(property, 'location');
  const description = usePropertyText(property, 'description');
  const features = usePropertyText(property, 'features');

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Link href="/properties">
            <Button variant="ghost" className="hover-elevate" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("common.backToProperties")}
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {images.length > 0 && (
          <div className="mb-12">
            <div className="rounded-lg overflow-hidden mb-4">
              <img
                src={images[selectedImage]}
                alt={title}
                className="w-full h-96 object-cover"
                data-testid="img-property-main"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`rounded-md overflow-hidden hover-elevate transition-all ${
                      selectedImage === idx ? "ring-2 ring-primary" : ""
                    }`}
                    data-testid={`button-thumbnail-${idx}`}
                  >
                    <img
                      src={img}
                      alt={`${title} ${idx + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                <div>
                  <h1 className="font-display font-bold text-3xl md:text-4xl mb-2 tracking-tight" data-testid="text-property-title">
                    {title}
                  </h1>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span className="text-lg">{location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-primary font-display font-bold text-3xl md:text-4xl" data-testid="text-property-price">
                    ৳{price.toLocaleString('en-BD')}
                  </p>
                  <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-md text-sm font-medium mt-2">
                    {property.type}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-8 py-6 border-y">
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-primary" />
                  <span className="font-medium">{property.bedrooms} {t("common.bedrooms")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5 text-primary" />
                  <span className="font-medium">{property.bathrooms} {t("common.bathrooms")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Maximize className="w-5 h-5 text-primary" />
                  <span className="font-medium">{property.area} {t("common.sqft")}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-display font-semibold text-2xl mb-4">{t("propertyDetails.description")}</h2>
              <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>

            {features && features.length > 0 && (
              <div>
                <h2 className="font-display font-semibold text-2xl mb-4">{t("propertyDetails.features")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {features.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="font-display font-semibold text-2xl mb-4">{t("propertyDetails.location")}</h2>
              <div className="bg-muted rounded-lg h-96 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">{t("propertyDetails.mapAvailable")}</p>
                  <p className="text-xs mt-1">{location}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="font-display">Interested in this property?</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Your full name" 
                              {...field} 
                              data-testid="input-inquiry-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="your@email.com" 
                              {...field} 
                              data-testid="input-inquiry-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input 
                              type="tel" 
                              placeholder="+1 (555) 000-0000" 
                              {...field} 
                              data-testid="input-inquiry-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about your requirements..."
                              rows={4}
                              {...field}
                              data-testid="textarea-inquiry-message"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full font-display tracking-wide" 
                      disabled={mutation.isPending}
                      data-testid="button-submit-inquiry"
                    >
                      {mutation.isPending ? "Sending..." : "SEND INQUIRY"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
