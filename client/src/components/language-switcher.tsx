import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-testid="button-language-switcher"
        >
          <Globe className="w-5 h-5" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-32">
        <DropdownMenuItem
          onClick={() => setLanguage("en")}
          className={language === "en" ? "bg-accent" : ""}
          data-testid="dropdown-language-en"
        >
          <motion.div
            className="flex items-center gap-2 w-full"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <span className="font-medium">EN</span>
            <span className="text-muted-foreground">English</span>
            {language === "en" && (
              <Check className="w-4 h-4 ml-auto text-primary" />
            )}
          </motion.div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("bn")}
          className={language === "bn" ? "bg-accent" : ""}
          data-testid="dropdown-language-bn"
        >
          <motion.div
            className="flex items-center gap-2 w-full"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <span className="font-medium">BN</span>
            <span className="text-muted-foreground">বাংলা</span>
            {language === "bn" && (
              <Check className="w-4 h-4 ml-auto text-primary" />
            )}
          </motion.div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
