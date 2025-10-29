import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Building2, Upload, X, Image as ImageIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertPropertySchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Property, InsertProperty } from "@shared/schema";
import type { z } from "zod";
import penthouseImg from "@assets/generated_images/Penthouse_interior_property_image_dbc84d3f.png";
import beachfrontImg from "@assets/generated_images/Beachfront_condo_property_image_eb2adc6c.png";
import townhouseImg from "@assets/generated_images/Modern_townhouse_property_image_63084dd1.png";
import mansionImg from "@assets/generated_images/Mansion_interior_property_image_9b6f3d6b.png";
import officeImg from "@assets/generated_images/Office_building_property_image_aa5f3a46.png";

const defaultImages = [penthouseImg, beachfrontImg, townhouseImg, mansionImg, officeImg];

export default function AdminProperties() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const form = useForm<z.infer<typeof insertPropertySchema>>({
    resolver: zodResolver(insertPropertySchema),
    defaultValues: {
      title: "",
      titleBn: "",
      price: "",
      type: "Villa",
      location: "",
      locationBn: "",
      bedrooms: 0,
      bathrooms: 0,
      area: 0,
      description: "",
      descriptionBn: "",
      features: [],
      featuresBn: null,
      status: "active",
      images: [],
      agentId: undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertProperty) => apiRequest("POST", "/api/properties", data),
    onSuccess: () => {
      toast({ title: "Property created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InsertProperty }) =>
      apiRequest("PUT", `/api/properties/${id}`, data),
    onSuccess: () => {
      toast({ title: "Property updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      setIsDialogOpen(false);
      setEditingProperty(null);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/properties/${id}`, {}),
    onSuccess: () => {
      toast({ title: "Property deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await apiRequest("POST", "/api/upload", formData) as unknown as { urls: string[] };
      const { urls } = response;
      setUploadedFiles(prev => [...prev, ...urls]);
      toast({ title: "Files uploaded successfully" });
    } catch (error) {
      toast({ 
        title: "Upload failed", 
        description: "Failed to upload files",
        variant: "destructive" 
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (urlToRemove: string) => {
    setUploadedFiles(prev => prev.filter(url => url !== urlToRemove));
  };

  const onSubmit = (data: z.infer<typeof insertPropertySchema>) => {
    const images = uploadedFiles.filter(url => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
    );
    const videos = uploadedFiles.filter(url => 
      /\.(mp4|mov|avi|webm)$/i.test(url)
    );

    // Determine final images: use uploaded files, or existing property images, or default
    let finalImages: string[];
    if (images.length > 0) {
      finalImages = images;
    } else if (editingProperty && editingProperty.images && editingProperty.images.length > 0) {
      // Preserve existing images when editing
      finalImages = editingProperty.images;
    } else {
      // Use default image for new properties without uploads
      finalImages = [defaultImages[Math.floor(Math.random() * defaultImages.length)]];
    }

    // Preserve existing videos when editing if no new videos uploaded
    let finalVideos: string[] | undefined;
    if (videos.length > 0) {
      finalVideos = videos;
    } else if (editingProperty && editingProperty.videos && editingProperty.videos.length > 0) {
      finalVideos = editingProperty.videos;
    } else {
      finalVideos = undefined;
    }

    const propertyData = { 
      ...data, 
      images: finalImages,
      videos: finalVideos
    };

    if (editingProperty) {
      updateMutation.mutate({ id: editingProperty.id, data: propertyData });
    } else {
      createMutation.mutate(propertyData);
    }
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    const allFiles = [
      ...(property.images || []),
      ...(property.videos || [])
    ];
    setUploadedFiles(allFiles);
    form.reset({
      title: property.title,
      titleBn: property.titleBn || "",
      price: property.price as string,
      type: property.type,
      location: property.location,
      locationBn: property.locationBn || "",
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      description: property.description,
      descriptionBn: property.descriptionBn || "",
      features: property.features || [],
      featuresBn: property.featuresBn || null,
      status: property.status,
      images: property.images || [],
      agentId: property.agentId || undefined,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this property?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingProperty(null);
    setUploadedFiles([]);
    form.reset();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-3xl mb-2 tracking-tight" data-testid="text-page-title">
            Properties
          </h1>
          <p className="text-muted-foreground">
            Manage all property listings
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-display tracking-wide" data-testid="button-add-property">
              <Plus className="w-4 h-4 mr-2" />
              ADD PROPERTY
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingProperty ? "Edit Property" : "Add New Property"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <Tabs defaultValue="en" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="en">English</TabsTrigger>
                    <TabsTrigger value="bn">বাংলা (Bangla)</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="en" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Luxury Villa..." {...field} data-testid="input-property-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Dhaka, Bangladesh" {...field} data-testid="input-property-location" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              rows={4} 
                              placeholder="Property description..." 
                              {...field} 
                              data-testid="textarea-property-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="features"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Features (comma-separated)</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={3}
                              placeholder="Swimming Pool, Gym, Garden..."
                              value={field.value?.join(", ") || ""}
                              onChange={e => field.onChange(e.target.value.split(",").map(f => f.trim()).filter(Boolean))}
                              data-testid="textarea-property-features"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="bn" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="titleBn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>শিরোনাম (Title)</FormLabel>
                          <FormControl>
                            <Input placeholder="বিলাসবহুল ভিলা..." {...field} data-testid="input-property-title-bn" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="locationBn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>অবস্থান (Location)</FormLabel>
                          <FormControl>
                            <Input placeholder="ঢাকা, বাংলাদেশ" {...field} data-testid="input-property-location-bn" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="descriptionBn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>বর্ণনা (Description)</FormLabel>
                          <FormControl>
                            <Textarea 
                              rows={4} 
                              placeholder="সম্পত্তির বর্ণনা..." 
                              {...field} 
                              data-testid="textarea-property-description-bn"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="featuresBn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>বৈশিষ্ট্য (Features) - comma-separated</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={3}
                              placeholder="সুইমিং পুল, জিম, বাগান..."
                              value={field.value?.join(", ") || ""}
                              onChange={e => {
                                const values = e.target.value.split(",").map(f => f.trim()).filter(Boolean);
                                field.onChange(values.length > 0 ? values : null);
                              }}
                              data-testid="textarea-property-features-bn"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input placeholder="1000000" {...field} data-testid="input-property-price" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-property-type">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Villa">Villa</SelectItem>
                            <SelectItem value="Condo">Condo</SelectItem>
                            <SelectItem value="Townhouse">Townhouse</SelectItem>
                            <SelectItem value="Apartment">Apartment</SelectItem>
                            <SelectItem value="Commercial">Commercial</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bedrooms</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-property-bedrooms"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bathrooms</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-property-bathrooms"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area (sqm)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-property-area"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Images & Videos</Label>
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      data-testid="input-file-upload"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full"
                      data-testid="button-upload-files"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Images & Videos
                        </>
                      )}
                    </Button>

                    {uploadedFiles.length > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        {uploadedFiles.map((url, index) => {
                          const isVideo = /\.(mp4|mov|avi|webm)$/i.test(url);
                          return (
                            <div key={index} className="relative group">
                              <div className="aspect-square rounded-md border bg-muted overflow-hidden">
                                {isVideo ? (
                                  <div className="w-full h-full flex items-center justify-center bg-muted">
                                    <Video className="w-8 h-8 text-muted-foreground" />
                                  </div>
                                ) : (
                                  <img
                                    src={url}
                                    alt={`Upload ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6"
                                onClick={() => removeFile(url)}
                                data-testid={`button-remove-file-${index}`}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Upload images (JPG, PNG, GIF) and videos (MP4, MOV, AVI, WEBM). Maximum 50MB per file.
                    </p>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-property-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="sold">Sold</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 justify-end pt-4">
                  <Button type="button" variant="secondary" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save-property"
                  >
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading properties...</p>
          </div>
        ) : !properties || properties.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No properties yet</p>
            <Button onClick={() => setIsDialogOpen(true)}>Add Your First Property</Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id} data-testid={`row-property-${property.id}`}>
                  <TableCell className="font-medium">{property.title}</TableCell>
                  <TableCell>{property.type}</TableCell>
                  <TableCell>{property.location}</TableCell>
                  <TableCell>${parseFloat(property.price as any).toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      property.status === "active" ? "bg-primary/10 text-primary" :
                      property.status === "sold" ? "bg-muted text-muted-foreground" :
                      "bg-accent text-accent-foreground"
                    }`}>
                      {property.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(property)}
                        data-testid={`button-edit-${property.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(property.id)}
                        data-testid={`button-delete-${property.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
