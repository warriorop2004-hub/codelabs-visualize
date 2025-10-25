import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/signin");
  };

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
          {!user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/signin">
                  <User className="h-4 w-4" />
                  Sign In
                </Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="text-sm text-foreground/90">{user.email}</div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
