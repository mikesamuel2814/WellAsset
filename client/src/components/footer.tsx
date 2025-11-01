import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, MessageCircle } from "lucide-react";
import { SiWhatsapp, SiTelegram } from "react-icons/si";
import { useI18n } from "@/lib/i18n";

type SocialMedia = {
  id: string;
  platform: string;
  url: string;
  icon: string;
};

type Settings = {
  key: string;
  value: string;
  valueBn?: string | null;
};

export function Footer() {
  const { t } = useI18n();
  
  const { data: socialMedia } = useQuery<SocialMedia[]>({
    queryKey: ["/api/cms/social-media"],
  });

  const { data: settings } = useQuery<Settings[]>({
    queryKey: ["/api/cms/settings"],
  });

  const phoneNumber = settings?.find(s => s.key === 'phone')?.value;
  const facebook = socialMedia?.find(s => s.platform.toLowerCase() === 'facebook')?.url;
  const telegram = socialMedia?.find(s => s.platform.toLowerCase() === 'telegram')?.url;
  const whatsapp = socialMedia?.find(s => s.platform.toLowerCase() === 'whatsapp')?.url;
  const twitter = socialMedia?.find(s => s.platform.toLowerCase() === 'twitter')?.url;
  const instagram = socialMedia?.find(s => s.platform.toLowerCase() === 'instagram')?.url;
  const linkedin = socialMedia?.find(s => s.platform.toLowerCase() === 'linkedin')?.url;
  
  return (
    <footer className="bg-card border-t">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img 
                src="/logo.png" 
                alt="Well Asset Logo" 
                className="w-10 h-10 object-cover rounded-full"
              />
              <div>
                <h3 className="font-display font-bold text-lg leading-tight">Well Asset</h3>
                <p className="text-xs text-muted-foreground">Development Co., Ltd</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/">
                  <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-home">
                    {t("footer.home")}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/properties">
                  <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-properties">
                    {t("footer.properties")}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-about">
                    {t("footer.about")}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-contact">
                    {t("footer.contact")}
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">{t("footer.contactInfo")}</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span data-testid="text-office-address" className="whitespace-pre-line">{t("footer.officeAddress")}</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href={`tel:${t("footer.phone").replace(/\s/g, '')}`} className="hover:text-primary transition-colors" data-testid="link-phone">
                  {t("footer.phone")}
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href={`mailto:${t("footer.email")}`} className="hover:text-primary transition-colors" data-testid="link-email">
                  {t("footer.email")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">{t("footer.followUs")}</h4>
            <div className="flex flex-wrap gap-3">
              {facebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover-elevate transition-all"
                  aria-label="Facebook"
                  data-testid="link-social-facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {telegram && (
                <a
                  href={telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover-elevate transition-all"
                  aria-label="Telegram"
                  data-testid="link-social-telegram"
                >
                  <SiTelegram className="w-5 h-5" />
                </a>
              )}
              {whatsapp && (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover-elevate transition-all"
                  aria-label="WhatsApp"
                  data-testid="link-social-whatsapp"
                >
                  <SiWhatsapp className="w-5 h-5" />
                </a>
              )}
              {twitter && (
                <a
                  href={twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover-elevate transition-all"
                  aria-label="Twitter"
                  data-testid="link-social-twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover-elevate transition-all"
                  aria-label="Instagram"
                  data-testid="link-social-instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {linkedin && (
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover-elevate transition-all"
                  aria-label="LinkedIn"
                  data-testid="link-social-linkedin"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {phoneNumber && (
                <a
                  href={`tel:${phoneNumber}`}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover-elevate transition-all"
                  aria-label="Phone"
                  data-testid="link-social-phone"
                >
                  <Phone className="w-5 h-5" />
                </a>
              )}
              <Link href="/contact">
                <a
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover-elevate transition-all"
                  aria-label="Contact"
                  data-testid="link-social-contact"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-primary/20 pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
