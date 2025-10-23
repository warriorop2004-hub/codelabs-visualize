import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { BSTVisualizer } from "@/components/BSTVisualizer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Play, RotateCcw, Send } from "lucide-react";
import { toast } from "sonner";

const Experiment = () => {
  const [submissionText, setSubmissionText] = useState("");

  const handleSubmit = () => {
    if (!submissionText.trim()) {
      toast.error("Please provide your analysis before submitting");
      return;
    }
    toast.success("Lab report submitted successfully!");
    setSubmissionText("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 animate-fade-in-up">
          <h1 className="text-3xl font-bold mb-2">Binary Search Tree Visualizer</h1>
          <p className="text-muted-foreground">Interactive visualization of BST operations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Instructions */}
          <div className="lg:col-span-1 space-y-6 animate-fade-in">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Learning Objectives:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Understand BST structure</li>
                    <li>Master insertion operations</li>
                    <li>Learn search algorithms</li>
                    <li>Practice deletion cases</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Tasks:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Insert nodes: 50, 30, 70, 20, 45, 60, 80</li>
                    <li>Search for node with value 45</li>
                    <li>Delete node 30 and observe restructuring</li>
                    <li>Analyze the time complexity</li>
                  </ol>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>Due Date:</span>
                    <span className="font-semibold text-foreground">Tomorrow, 11:59 PM</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Course:</span>
                    <span className="font-semibold text-foreground">CS201: Data Structures</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Visualization */}
          <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <BSTVisualizer />
          </div>

          {/* Right Panel - Controls & Submission */}
          <div className="lg:col-span-1 space-y-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Submit Analysis</CardTitle>
                <CardDescription>Answer the questions below</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    1. What is the time complexity of BST insertion in the average case?
                  </label>
                  <Textarea
                    placeholder="Your answer..."
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    2. Explain the node deletion process when the node has two children.
                  </label>
                  <Textarea
                    placeholder="Your answer..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="pt-4 space-y-2">
                  <Button variant="hero" className="w-full" onClick={handleSubmit}>
                    <Send className="h-4 w-4" />
                    Submit Lab Report
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Tree snapshot will be automatically attached
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Experiment;
