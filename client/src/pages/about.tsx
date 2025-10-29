import { Building2, Target, Users, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

export default function About() {
  const { t } = useI18n();
  
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-4 tracking-tight" data-testid="text-page-title">
            {t("about.title")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            {t("about.subtitle")}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="font-display font-semibold text-3xl mb-6 tracking-tight">{t("about.story")}</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              {t("about.storyPara1")}
            </p>
            <p className="text-foreground/80 leading-relaxed mb-4">
              {t("about.storyPara2")}
            </p>
            <p className="text-foreground/80 leading-relaxed">
              {t("about.storyPara3")}
            </p>
          </div>
          <div className="bg-muted rounded-lg h-96 flex items-center justify-center">
            <Building2 className="w-32 h-32 text-muted-foreground/30" />
          </div>
        </div>

        <div className="mb-20">
          <h2 className="font-display font-semibold text-3xl mb-12 text-center tracking-tight">{t("about.values")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-3">{t("about.excellence")}</h3>
                <p className="text-muted-foreground">
                  {t("about.excellenceDesc")}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-3">{t("about.clientCentric")}</h3>
                <p className="text-muted-foreground">
                  {t("about.clientCentricDesc")}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-3">{t("about.innovation")}</h3>
                <p className="text-muted-foreground">
                  {t("about.innovationDesc")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="bg-card p-12 rounded-lg text-center">
          <h2 className="font-display font-semibold text-3xl mb-6 tracking-tight">{t("about.mission")}</h2>
          <p className="text-foreground/80 text-lg leading-relaxed max-w-4xl mx-auto mb-8">
            {t("about.missionDesc")}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <div>
              <p className="font-display font-bold text-4xl text-primary mb-2">50+</p>
              <p className="text-muted-foreground">{t("about.projectsCompleted")}</p>
            </div>
            <div>
              <p className="font-display font-bold text-4xl text-primary mb-2">1,000+</p>
              <p className="text-muted-foreground">{t("about.happyClients")}</p>
            </div>
            <div>
              <p className="font-display font-bold text-4xl text-primary mb-2">15+</p>
              <p className="text-muted-foreground">{t("about.yearsExperience")}</p>
            </div>
            <div>
              <p className="font-display font-bold text-4xl text-primary mb-2">20+</p>
              <p className="text-muted-foreground">{t("about.awardsWon")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
