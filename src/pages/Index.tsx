import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  GraduationCap, 
  Zap, 
  Users, 
  BarChart3, 
  BookOpen, 
  Play,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const Index = () => {
  const features = [
    {
      icon: Zap,
      title: "Interactive Visualizations",
      description: "Real-time animations make complex algorithms and data structures easy to understand",
    },
    {
      icon: BookOpen,
      title: "Comprehensive Library",
      description: "Access experiments covering algorithms, data structures, OS, and networking concepts",
    },
    {
      icon: Users,
      title: "Dual Interface",
      description: "Separate views for students to learn and instructors to manage and grade",
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description: "Monitor learning progress with detailed analytics and completion metrics",
    },
  ];

  const categories = [
    { name: "Algorithms", count: "12 experiments", color: "bg-primary" },
    { name: "Data Structures", count: "15 experiments", color: "bg-secondary" },
    { name: "Operating Systems", count: "8 experiments", color: "bg-accent" },
    { name: "Networks", count: "10 experiments", color: "bg-success" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
        
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-gradient-card px-4 py-2 rounded-full mb-6 shadow-md">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Cloud-Based CS Education Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
              Make CS Concepts Come Alive
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              CodeLabs Interactive transforms abstract computer science theories into 
              tangible, visual experiences. No setup required - just open and explore.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" className="shadow-lg" asChild>
                <Link to="/dashboard">
                  <Play className="h-5 w-5" />
                  Start Learning
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/library">
                  Explore Library
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose CodeLabs?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A complete educational ecosystem designed to bridge theory and practice
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="bg-card shadow-md hover:shadow-lg transition-all animate-fade-in-up border-0"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="p-3 bg-gradient-hero rounded-lg w-fit shadow-md mb-3">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Explore by Category
            </h2>
            <p className="text-muted-foreground text-lg">
              Comprehensive coverage of core CS topics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div
                key={index}
                className="group p-6 rounded-lg bg-gradient-card border hover:shadow-lg transition-all cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-12 h-12 ${category.color} rounded-lg mb-4 group-hover:scale-110 transition-transform`} />
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                <p className="text-muted-foreground text-sm">{category.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Choose an Experiment",
                description: "Browse our library and select the concept you want to explore",
              },
              {
                step: "02",
                title: "Interact & Learn",
                description: "Manipulate visualizations in real-time and observe the results",
              },
              {
                step: "03",
                title: "Submit & Track",
                description: "Complete assessments and track your progress over time",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-hero text-primary-foreground text-2xl font-bold mb-4 shadow-glow">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-hero border-0 shadow-lg text-primary-foreground overflow-hidden">
            <CardContent className="p-12 text-center relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Transform Your Learning?
                </h2>
                <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
                  Join thousands of students and educators making CS education more engaging and effective
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="secondary" size="lg" asChild>
                    <Link to="/dashboard">
                      Get Started Free
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                    asChild
                  >
                    <Link to="/library">View Demo</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-hero rounded-lg">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">CodeLabs Interactive</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2025 CodeLabs Interactive. Making CS education interactive.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
