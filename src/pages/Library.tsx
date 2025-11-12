import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Layers, GitBranch, Network, Cpu, Play } from "lucide-react";
import { courseApi } from "@/lib/api";
import { Experiment } from "@/types";

const Library = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const { slug } = useParams<{ slug?: string }>();
  const routeSlug = slug ? decodeURIComponent(slug) : undefined;

  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        const { data } = await courseApi.getExperiments(routeSlug);
        setExperiments(data);
      } catch (error) {
        console.error("Error fetching experiments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiments();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-success/10 text-success border-success/20";
      case "intermediate":
        return "bg-accent/10 text-accent border-accent/20";
      case "advanced":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getIcon = (iconName: string) => {
    const icons = {
      GitBranch,
      Layers,
      Network,
      Cpu,
      Play,
    };
    return icons[iconName as keyof typeof icons] || Layers;
  };

  // Filter experiments by search query
  const getFilteredExperiments = () => {
    if (!searchQuery.trim()) return experiments;
    const query = searchQuery.toLowerCase();
    return experiments.filter(
      (exp) =>
        exp.title?.toLowerCase().includes(query) ||
        exp.description?.toLowerCase().includes(query)
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold mb-2">Experiment Library</h1>
          <p className="text-muted-foreground">
            Explore interactive CS visualizations and simulations
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search experiments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Experiments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredExperiments().map((experiment, index) => {
            const Icon = getIcon(experiment.icon);
            return (
              <Card
                key={experiment.id}
                className="shadow-md hover:shadow-lg transition-all animate-fade-in-up group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-3 bg-gradient-hero rounded-lg shadow-md group-hover:shadow-glow transition-all duration-300">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <Badge
                      className={getDifficultyColor(experiment.difficulty)}
                      variant="outline"
                    >
                      {experiment.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{experiment.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {experiment.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="hero"
                    className="w-full group-hover:shadow-md"
                    asChild
                  >
                    <Link to={`/experiment/${experiment.slug}`}>
                      <Play className="h-4 w-4" />
                      Launch Experiment
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {getFilteredExperiments().length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <p className="text-muted-foreground text-lg">
              No experiments found matching your criteria
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
