import { Link, useLocation } from "wouter";
import { Menu, X, Phone, Facebook, MessageCircle } from "lucide-react";
import { SiWhatsapp, SiTelegram } from "react-icons/si";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";

type SocialMedia = {
  id: string;
  platform: string;
  url: string;
  icon: string;
  isActive: boolean;
  order: number;
};

type Settings = {
  key: string;
  value: string;
  valueBn?: string | null;
};

export function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useI18n();

  const { data: socialMedia } = useQuery<SocialMedia[]>({
    queryKey: ["/api/cms/social-media"],
  });

  const { data: settings } = useQuery<Settings[]>({
    queryKey: ["/api/cms/settings"],
  });

  const phoneNumber = settings?.find(s => s.key === 'phone')?.value;
  
  // Filter only active social media items
  const activeSocialMedia = socialMedia?.filter(s => s.isActive) || [];
  const facebook = activeSocialMedia.find(s => s.platform.toLowerCase() === 'facebook')?.url;
  const telegram = activeSocialMedia.find(s => s.platform.toLowerCase() === 'telegram')?.url;
  const whatsapp = activeSocialMedia.find(s => s.platform.toLowerCase() === 'whatsapp')?.url;

  const isActive = (path: string) => location === path;

  const navLinks = [
    { path: "/", label: t("nav.home") },
    { path: "/properties", label: t("nav.properties") },
    { path: "/about", label: t("nav.about") },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/40 shadow-lg shadow-black/5">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer hover-elevate rounded-md px-2 py-1" data-testid="link-home">
              <img 
                src="/logo.png" 
                alt="Well Asset Logo" 
                className="w-10 h-10 object-cover rounded-full"
              />
              <div>
                <h1 className="font-display font-bold text-lg leading-tight">Well Asset</h1>
                <p className="text-xs text-muted-foreground">Development Co., Ltd</p>
              </div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <nav className="flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <Button
                    variant={isActive(link.path) ? "secondary" : "ghost"}
                    className="font-medium"
                    data-testid={`nav-link-${link.path}`}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div onMouseEnter={(e) => {
                    const button = e.currentTarget.querySelector('button');
                    button?.click();
                  }}>
                    <Button
                      variant={isActive("/contact") ? "secondary" : "ghost"}
                      className="font-medium"
                      data-testid="nav-link-contact"
                    >
                      {t("nav.contact")}
                    </Button>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {facebook && (
                    <DropdownMenuItem asChild>
                      <a href={facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer" data-testid="contact-facebook">
                        <Facebook className="w-4 h-4" />
                        <span>Facebook</span>
                      </a>
                    </DropdownMenuItem>
                  )}
                  {telegram && (
                    <DropdownMenuItem asChild>
                      <a href={telegram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer" data-testid="contact-telegram">
                        <SiTelegram className="w-4 h-4" />
                        <span>Telegram</span>
                      </a>
                    </DropdownMenuItem>
                  )}
                  {whatsapp && (
                    <DropdownMenuItem asChild>
                      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer" data-testid="contact-whatsapp">
                        <SiWhatsapp className="w-4 h-4" />
                        <span>WhatsApp</span>
                      </a>
                    </DropdownMenuItem>
                  )}
                  {phoneNumber && (
                    <DropdownMenuItem asChild>
                      <a href={`tel:${phoneNumber}`} className="flex items-center gap-2 cursor-pointer" data-testid="contact-phone">
                        <Phone className="w-4 h-4" />
                        <span>Call {phoneNumber}</span>
                      </a>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/contact">
                      <div className="flex items-center gap-2 cursor-pointer w-full" data-testid="contact-page">
                        <MessageCircle className="w-4 h-4" />
                        <span>Contact Page</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
            <ThemeToggle />
            <LanguageSwitcher />
          </div>

          <button
            className="md:hidden p-2 hover-elevate rounded-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t pt-4 space-y-2">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <Button
                  variant={isActive(link.path) ? "secondary" : "ghost"}
                  className="w-full justify-start font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`mobile-nav-link-${link.path}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground px-3 py-2">
                {t("nav.contact")}
              </div>
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start font-medium gap-2" data-testid="mobile-contact-facebook">
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </Button>
                </a>
              )}
              {telegram && (
                <a href={telegram} target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start font-medium gap-2" data-testid="mobile-contact-telegram">
                    <SiTelegram className="w-4 h-4" />
                    Telegram
                  </Button>
                </a>
              )}
              {whatsapp && (
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start font-medium gap-2" data-testid="mobile-contact-whatsapp">
                    <SiWhatsapp className="w-4 h-4" />
                    WhatsApp
                  </Button>
                </a>
              )}
              {phoneNumber && (
                <a href={`tel:${phoneNumber}`} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start font-medium gap-2" data-testid="mobile-contact-phone">
                    <Phone className="w-4 h-4" />
                    Call {phoneNumber}
                  </Button>
                </a>
              )}
              <Link href="/contact">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start font-medium gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-contact-page"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact Page
                </Button>
              </Link>
            </div>

            <div className="pt-2 border-t flex justify-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
