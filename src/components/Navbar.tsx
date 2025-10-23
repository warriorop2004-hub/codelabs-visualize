import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, User } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-gradient-hero rounded-lg shadow-md group-hover:shadow-glow transition-all duration-300">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            CodeLabs Interactive
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className="text-foreground/80 hover:text-primary transition-colors flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Dashboard
          </Link>
          <Link to="/library" className="text-foreground/80 hover:text-primary transition-colors">
            Experiment Library
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <User className="h-4 w-4" />
              Sign In
            </Link>
          </Button>
          <Button variant="hero" size="sm" asChild>
            <Link to="/dashboard">Get Started</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};
