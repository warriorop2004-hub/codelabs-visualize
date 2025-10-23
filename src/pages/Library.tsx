import { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Layers, GitBranch, Network, Cpu, Play } from "lucide-react";

const experiments = [
  {
    id: "bst",
    name: "Binary Search Tree Visualizer",
    description: "Interactive visualization of BST operations including insert, delete, and search",
    category: "data-structures",
    difficulty: "intermediate",
    icon: GitBranch,
  },
  {
    id: "sorting",
    name: "Sorting Algorithms",
    description: "Compare and visualize bubble sort, merge sort, quick sort, and more",
    category: "algorithms",
    difficulty: "beginner",
    icon: Layers,
  },
  {
    id: "dijkstra",
    name: "Dijkstra's Algorithm",
    description: "Pathfinding visualization with weighted graphs and shortest path calculation",
    category: "algorithms",
    difficulty: "advanced",
    icon: Network,
  },
  {
    id: "cpu-scheduling",
    name: "CPU Scheduling",
    description: "Simulate FCFS, Round Robin, and other scheduling algorithms",
    category: "operating-systems",
    difficulty: "intermediate",
    icon: Cpu,
  },
  {
    id: "hash-tables",
    name: "Hash Table Operations",
    description: "Visualize hashing, collision resolution, and load factor effects",
    category: "data-structures",
    difficulty: "intermediate",
    icon: Layers,
  },
  {
    id: "tcp-handshake",
    name: "TCP Three-Way Handshake",
    description: "Interactive simulation of TCP connection establishment",
    category: "networks",
    difficulty: "beginner",
    icon: Network,
  },
];

const categories = [
  { id: "all", name: "All Experiments" },
  { id: "algorithms", name: "Algorithms" },
  { id: "data-structures", name: "Data Structures" },
  { id: "operating-systems", name: "Operating Systems" },
  { id: "networks", name: "Networks" },
];

const Library = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredExperiments = experiments.filter((exp) => {
    const matchesSearch = exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || exp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold mb-2">Experiment Library</h1>
          <p className="text-muted-foreground">Explore interactive CS visualizations and simulations</p>
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
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full md:w-auto">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
                {categories.map((cat) => (
                  <TabsTrigger key={cat.id} value={cat.id} className="text-xs md:text-sm">
                    {cat.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Experiments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperiments.map((experiment, index) => {
            const Icon = experiment.icon;
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
                    <Badge className={getDifficultyColor(experiment.difficulty)} variant="outline">
                      {experiment.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{experiment.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{experiment.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="hero" className="w-full group-hover:shadow-md" asChild>
                    <Link to={`/experiment/${experiment.id}`}>
                      <Play className="h-4 w-4" />
                      Launch Experiment
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredExperiments.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <p className="text-muted-foreground text-lg">No experiments found matching your criteria</p>
            <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
