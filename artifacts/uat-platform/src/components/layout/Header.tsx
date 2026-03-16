import { Search, Bell, HelpCircle } from "lucide-react";
import { Link } from "wouter";

export function Header() {
  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 pl-72">
      <div className="flex items-center flex-1">
        <div className="relative w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search cases, defects, releases..." 
            className="w-full bg-muted/50 border border-transparent focus:border-primary/50 focus:bg-background h-10 rounded-full pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/70 focus:ring-4 focus:ring-primary/10"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>
        <Link href="/seed" className="text-xs font-medium text-primary hover:underline ml-2">
          Dev: Seed Data
        </Link>
      </div>
    </header>
  );
}
