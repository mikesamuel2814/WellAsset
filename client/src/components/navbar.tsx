import { Link, useLocation } from "wouter";
import { Building2, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { useI18n } from "@/lib/i18n";

export function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useI18n();

  const isActive = (path: string) => location === path;

  const navLinks = [
    { path: "/", label: t("nav.home") },
    { path: "/properties", label: t("nav.properties") },
    { path: "/about", label: t("nav.about") },
    { path: "/contact", label: t("nav.contact") },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/40 shadow-lg shadow-black/5">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer hover-elevate rounded-md px-2 py-1" data-testid="link-home">
              <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
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
