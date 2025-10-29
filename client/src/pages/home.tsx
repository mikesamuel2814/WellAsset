import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Building2, MapPin, Bed, Bath, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeroCarousel } from "@/components/hero-carousel";
import { motion } from "framer-motion";
import { useI18n, usePropertyText } from "@/lib/i18n";
import type { Property } from "@shared/schema";

export default function Home() {
  const { t } = useI18n();
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const featuredProperties = properties?.filter(p => p.status === "active").slice(0, 6) || [];
  const latestProperties = properties?.filter(p => p.status === "active").slice(0, 9) || [];

  return (
    <div className="min-h-screen">
      {!isLoading && <HeroCarousel properties={featuredProperties} />}

      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 
              className="font-display font-semibold text-4xl md:text-5xl mb-4 tracking-tight"
              data-testid="text-featured-title"
            >
              {t("home.featured")}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("home.featuredDesc")}
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-64 bg-muted animate-pulse"></div>
                  <CardContent className="p-6 space-y-3">
                    <div className="h-6 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3"></div>
                    <div className="h-8 bg-muted rounded animate-pulse w-1/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredProperties.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg">{t("home.noProperties")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <PropertyCard property={property} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-24 bg-card">
        <motion.div 
          className="max-w-4xl mx-auto px-6 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="font-display font-semibold text-3xl md:text-4xl mb-6 tracking-tight">
            {t("home.excellence")}
          </h2>
          <p className="text-foreground/80 text-lg leading-relaxed mb-8">
            {t("home.excellenceDesc")}
          </p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/about">
              <Button 
                variant="default"
                size="lg"
                className="font-display tracking-wide hover:scale-105 transition-transform duration-300"
                data-testid="button-learn-more"
              >
                {t("home.learnMore")}
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display font-semibold text-4xl md:text-5xl mb-4 tracking-tight">
              {t("home.latest")}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("home.latestDesc")}
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-64 bg-muted animate-pulse"></div>
                  <CardContent className="p-6 space-y-3">
                    <div className="h-6 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3"></div>
                    <div className="h-8 bg-muted rounded animate-pulse w-1/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : latestProperties.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg">No properties available at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/properties">
              <Button 
                variant="outline"
                size="lg"
                className="font-display tracking-wide"
                data-testid="button-view-all-properties"
              >
                {t("home.viewAll")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-6 tracking-tight">
            {t("home.ready")}
          </h2>
          <p className="text-lg mb-8 opacity-95">
            {t("home.readyDesc")}
          </p>
          <Link href="/contact">
            <Button 
              size="lg"
              variant="secondary"
              className="font-display text-base tracking-wide"
              data-testid="button-cta-contact"
            >
              {t("home.getInTouch")}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function PropertyCard({ property }: { property: Property }) {
  const imageUrl = property.images?.[0] || "";
  const price = parseFloat(property.price as any);
  const title = usePropertyText(property, 'title');
  const location = usePropertyText(property, 'location');

  return (
    <Link href={`/properties/${property.id}`}>
      <Card 
        className="overflow-hidden hover-elevate active-elevate-2 transition-transform duration-200 cursor-pointer group"
        data-testid={`card-property-${property.id}`}
      >
        <div className="relative h-64 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <CardContent className="p-6">
          <h3 className="font-display font-medium text-xl mb-2 line-clamp-1" data-testid={`text-property-title-${property.id}`}>
            {title}
          </h3>
          <div className="flex items-center text-muted-foreground mb-4">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm line-clamp-1">{location}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Maximize className="w-4 h-4" />
              <span>{property.area} sqft</span>
            </div>
          </div>
          <p className="text-primary font-display font-semibold text-2xl" data-testid={`text-property-price-${property.id}`}>
            ৳{price.toLocaleString('en-BD')}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
