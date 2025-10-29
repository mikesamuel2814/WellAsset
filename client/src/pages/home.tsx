import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Building2, MapPin, Bed, Bath, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Property } from "@shared/schema";
import heroImage from "@assets/generated_images/Luxury_villa_hero_image_a5b9ac3f.png";

export default function Home() {
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const featuredProperties = properties?.filter(p => p.status === "active").slice(0, 6) || [];
  const latestProperties = properties?.filter(p => p.status === "active").slice(0, 9) || [];

  return (
    <div className="min-h-screen">
      <section 
        className="relative min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(28, 28, 28, 0.7), rgba(28, 28, 28, 0.4)), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="text-center text-white px-6 max-w-5xl mx-auto">
          <h1 
            className="font-display font-bold text-5xl md:text-6xl lg:text-7xl mb-6 tracking-tight"
            data-testid="text-hero-title"
          >
            Discover Your Dream Property
          </h1>
          <p className="text-lg md:text-xl mb-8 leading-relaxed text-white/90 max-w-3xl mx-auto">
            Well Asset Development Co., Ltd presents exclusive luxury real estate with unparalleled elegance and sophistication
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/properties">
              <Button 
                size="lg"
                variant="default"
                className="font-display text-base tracking-wide"
                data-testid="button-browse-properties"
              >
                BROWSE PROPERTIES
              </Button>
            </Link>
            <Link href="/contact">
              <Button 
                size="lg"
                variant="outline"
                className="font-display text-base tracking-wide backdrop-blur-md bg-white/10 border-white/30 text-white hover:bg-white/20"
                data-testid="button-contact-us"
              >
                CONTACT US
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center p-2">
            <div className="w-1 h-3 bg-white/70 rounded-full"></div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 
              className="font-display font-semibold text-4xl md:text-5xl mb-4 tracking-tight"
              data-testid="text-featured-title"
            >
              Featured Properties
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Handpicked selection of our most prestigious properties
            </p>
          </div>

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
              <p className="text-muted-foreground text-lg">No featured properties available at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-24 bg-card">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display font-semibold text-3xl md:text-4xl mb-6 tracking-tight">
            Excellence in Real Estate Development
          </h2>
          <p className="text-foreground/80 text-lg leading-relaxed mb-8">
            For over a decade, Well Asset Development Co., Ltd has been at the forefront of luxury real estate, 
            creating exceptional properties that redefine modern living. Our commitment to quality, innovation, 
            and customer satisfaction has made us a trusted name in premium property development.
          </p>
          <Link href="/about">
            <Button 
              variant="default"
              size="lg"
              className="font-display tracking-wide"
              data-testid="button-learn-more"
            >
              LEARN MORE ABOUT US
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-semibold text-4xl md:text-5xl mb-4 tracking-tight">
              Latest Listings
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover our newest luxury properties now available
            </p>
          </div>

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
                VIEW ALL PROPERTIES
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-6 tracking-tight">
            Ready to Find Your Perfect Property?
          </h2>
          <p className="text-lg mb-8 opacity-95">
            Let our expert team guide you to your dream home or investment opportunity
          </p>
          <Link href="/contact">
            <Button 
              size="lg"
              variant="secondary"
              className="font-display text-base tracking-wide"
              data-testid="button-cta-contact"
            >
              GET IN TOUCH TODAY
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

  return (
    <Link href={`/properties/${property.id}`}>
      <Card 
        className="overflow-hidden hover-elevate active-elevate-2 transition-transform duration-200 cursor-pointer group"
        data-testid={`card-property-${property.id}`}
      >
        <div className="relative h-64 overflow-hidden">
          <img
            src={imageUrl}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <CardContent className="p-6">
          <h3 className="font-display font-medium text-xl mb-2 line-clamp-1" data-testid={`text-property-title-${property.id}`}>
            {property.title}
          </h3>
          <div className="flex items-center text-muted-foreground mb-4">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm line-clamp-1">{property.location}</span>
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
              <span>{property.area} sqm</span>
            </div>
          </div>
          <p className="text-primary font-display font-semibold text-2xl" data-testid={`text-property-price-${property.id}`}>
            ${price.toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
