import { Building2, Target, Users, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-4 tracking-tight" data-testid="text-page-title">
            About Well Asset Development
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Creating exceptional living spaces for discerning clients since 2010
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="font-display font-semibold text-3xl mb-6 tracking-tight">Our Story</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Well Asset Development Co., Ltd was founded with a singular vision: to transform the real estate 
              landscape through innovative design, uncompromising quality, and exceptional customer service.
            </p>
            <p className="text-foreground/80 leading-relaxed mb-4">
              For over a decade, we have been at the forefront of luxury property development, creating 
              residences and commercial spaces that set new standards in modern living. Our portfolio spans 
              prestigious locations, each property carefully crafted to offer the perfect blend of elegance, 
              functionality, and lifestyle.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              From exclusive villas to sophisticated urban condominiums, every project reflects our commitment 
              to excellence and our deep understanding of what makes a property truly exceptional.
            </p>
          </div>
          <div className="bg-muted rounded-lg h-96 flex items-center justify-center">
            <Building2 className="w-32 h-32 text-muted-foreground/30" />
          </div>
        </div>

        <div className="mb-20">
          <h2 className="font-display font-semibold text-3xl mb-12 text-center tracking-tight">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-3">Excellence</h3>
                <p className="text-muted-foreground">
                  We pursue perfection in every detail, from architectural design to customer service, 
                  ensuring that each property exceeds expectations.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-3">Client-Centric</h3>
                <p className="text-muted-foreground">
                  Your vision drives our work. We listen carefully, understand deeply, and deliver 
                  solutions that perfectly match your lifestyle and aspirations.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-3">Innovation</h3>
                <p className="text-muted-foreground">
                  We embrace cutting-edge design and sustainable practices, creating properties that 
                  are both timeless and forward-thinking.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="bg-card p-12 rounded-lg text-center">
          <h2 className="font-display font-semibold text-3xl mb-6 tracking-tight">Our Mission</h2>
          <p className="text-foreground/80 text-lg leading-relaxed max-w-4xl mx-auto mb-8">
            To create extraordinary properties that enhance lives, build communities, and stand as 
            enduring testaments to quality and innovation. We are committed to delivering exceptional 
            value to our clients while maintaining the highest standards of integrity and professionalism.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <div>
              <p className="font-display font-bold text-4xl text-primary mb-2">50+</p>
              <p className="text-muted-foreground">Projects Completed</p>
            </div>
            <div>
              <p className="font-display font-bold text-4xl text-primary mb-2">1,000+</p>
              <p className="text-muted-foreground">Happy Clients</p>
            </div>
            <div>
              <p className="font-display font-bold text-4xl text-primary mb-2">15+</p>
              <p className="text-muted-foreground">Years Experience</p>
            </div>
            <div>
              <p className="font-display font-bold text-4xl text-primary mb-2">20+</p>
              <p className="text-muted-foreground">Awards Won</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
