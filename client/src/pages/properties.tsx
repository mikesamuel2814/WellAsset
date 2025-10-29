import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Building2, MapPin, Bed, Bath, Maximize, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useI18n, usePropertyText } from "@/lib/i18n";
import type { Property } from "@shared/schema";

export default function Properties() {
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterBedrooms, setFilterBedrooms] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const filteredProperties = properties?.filter(property => {
    if (property.status !== "active") return false;
    
    const matchesSearch = searchQuery === "" || 
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || property.type === filterType;
    
    const matchesBedrooms = filterBedrooms === "all" || property.bedrooms.toString() === filterBedrooms;
    
    const price = parseFloat(property.price as any);
    const matchesMinPrice = minPrice === "" || price >= parseFloat(minPrice);
    const matchesMaxPrice = maxPrice === "" || price <= parseFloat(maxPrice);
    
    return matchesSearch && matchesType && matchesBedrooms && matchesMinPrice && matchesMaxPrice;
  }) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-4 tracking-tight" data-testid="text-page-title">
            Browse Properties
          </h1>
          <p className="text-muted-foreground text-lg">
            Explore our exclusive collection of luxury real estate
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal className="w-5 h-5 text-primary" />
                <h2 className="font-display font-semibold text-lg">Filters</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="search" className="mb-2 block">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search properties..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="type" className="mb-2 block">Property Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger id="type" data-testid="select-property-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                      <SelectItem value="Condo">Condo</SelectItem>
                      <SelectItem value="Townhouse">Townhouse</SelectItem>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bedrooms" className="mb-2 block">Bedrooms</Label>
                  <Select value={filterBedrooms} onValueChange={setFilterBedrooms}>
                    <SelectTrigger id="bedrooms" data-testid="select-bedrooms">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">Price Range</Label>
                  <div className="space-y-3">
                    <Input
                      type="number"
                      placeholder="Min Price"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      data-testid="input-min-price"
                    />
                    <Input
                      type="number"
                      placeholder="Max Price"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      data-testid="input-max-price"
                    />
                  </div>
                </div>

                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterType("all");
                    setFilterBedrooms("all");
                    setMinPrice("");
                    setMaxPrice("");
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              </div>
            </Card>
          </aside>

          <main className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-56 bg-muted animate-pulse"></div>
                    <CardContent className="p-6 space-y-3">
                      <div className="h-6 bg-muted rounded animate-pulse"></div>
                      <div className="h-4 bg-muted rounded animate-pulse w-2/3"></div>
                      <div className="h-8 bg-muted rounded animate-pulse w-1/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-24">
                <Building2 className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
                <h3 className="font-display font-semibold text-2xl mb-3">No properties found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your filters to see more results</p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterType("all");
                    setFilterBedrooms("all");
                    setMinPrice("");
                    setMaxPrice("");
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                  <p className="text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{filteredProperties.length}</span> {filteredProperties.length === 1 ? "property" : "properties"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
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
        <div className="relative h-56 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 right-3">
            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium">
              {property.type}
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <CardContent className="p-6">
          <h3 className="font-display font-medium text-xl mb-2 line-clamp-1" data-testid={`text-property-title-${property.id}`}>
            {title}
          </h3>
          <div className="flex items-center text-muted-foreground mb-4">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
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
