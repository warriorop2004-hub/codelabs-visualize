import { useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { BSTVisualizer } from "@/components/BSTVisualizer";
import { SortingVisualizer } from "@/components/SortingVisualizer";
import { TCPVisualizer } from "@/components/TCPVisualizer";
import { CPUSchedulingVisualizer } from "@/components/CPUSchedulingVisualizer";
import { HashTableVisualizer } from "@/components/HashTableVisualizer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Send } from "lucide-react";
import { toast } from "sonner";

const experimentData = {
  bst: {
    title: "Binary Search Tree Visualizer",
    course: "CS201: Data Structures",
    objectives: [
      "Understand BST structure",
      "Master insertion operations",
      "Learn search algorithms",
      "Practice deletion cases",
    ],
    tasks: [
      "Insert nodes: 50, 30, 70, 20, 45, 60, 80",
      "Search for node with value 45",
      "Delete node 30 and observe restructuring",
      "Analyze the time complexity",
    ],
    questions: [
      "What is the time complexity of BST insertion in the average case?",
      "Explain the node deletion process when the node has two children.",
    ],
  },
  sorting: {
    title: "Sorting Algorithms Visualizer",
    course: "CS301: Algorithms",
    objectives: [
      "Compare different sorting algorithms",
      "Understand time complexity differences",
      "Observe algorithm behavior on various inputs",
      "Identify best and worst case scenarios",
    ],
    tasks: [
      "Run Bubble Sort and observe the number of comparisons",
      "Compare Bubble Sort with Quick Sort performance",
      "Test with already sorted and reverse sorted arrays",
      "Analyze space complexity of each algorithm",
    ],
    questions: [
      "Which algorithm performs best on nearly sorted data?",
      "Explain why Quick Sort is generally faster than Bubble Sort.",
    ],
  },
  "tcp-handshake": {
    title: "TCP Three-Way Handshake",
    course: "CS305: Computer Networks",
    objectives: [
      "Understand TCP connection establishment",
      "Learn the purpose of each handshake step",
      "Identify sequence and acknowledgment numbers",
      "Recognize connection states",
    ],
    tasks: [
      "Run the handshake simulation",
      "Observe the SYN, SYN-ACK, ACK sequence",
      "Note the sequence and acknowledgment numbers",
      "Identify when the connection is established",
    ],
    questions: [
      "Why does TCP use a three-way handshake instead of two-way?",
      "What happens if the ACK packet is lost?",
    ],
  },
  "cpu-scheduling": {
    title: "CPU Scheduling Simulator",
    course: "CS302: Operating Systems",
    objectives: [
      "Compare different scheduling algorithms",
      "Calculate waiting and turnaround times",
      "Understand context switching overhead",
      "Analyze algorithm fairness",
    ],
    tasks: [
      "Run FCFS and observe the execution order",
      "Compare with SJF and Round Robin",
      "Calculate average waiting time for each",
      "Identify which algorithm minimizes waiting time",
    ],
    questions: [
      "Which algorithm can lead to starvation?",
      "Explain the trade-offs of Round Robin scheduling.",
    ],
  },
  "hash-tables": {
    title: "Hash Table Operations",
    course: "CS201: Data Structures",
    objectives: [
      "Understand hash function behavior",
      "Learn collision resolution techniques",
      "Observe load factor effects",
      "Practice search, insert, delete operations",
    ],
    tasks: [
      "Insert multiple key-value pairs",
      "Observe collision resolution with linear probing",
      "Search for existing and non-existing keys",
      "Monitor load factor as table fills",
    ],
    questions: [
      "What is the average time complexity for hash table operations?",
      "Explain how linear probing resolves collisions.",
    ],
  },
};

const Experiment = () => {
  const { id } = useParams<{ id: string }>();
  const [submissionText, setSubmissionText] = useState("");

  const experiment = experimentData[id as keyof typeof experimentData];

  if (!experiment) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-bold mb-4">Experiment Not Found</h1>
          <p className="text-muted-foreground">This experiment hasn't been implemented yet.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!submissionText.trim()) {
      toast.error("Please provide your analysis before submitting");
      return;
    }
    toast.success("Lab report submitted successfully!");
    setSubmissionText("");
  };

  const renderVisualizer = () => {
    switch (id) {
      case "bst":
        return <BSTVisualizer />;
      case "sorting":
        return <SortingVisualizer />;
      case "tcp-handshake":
        return <TCPVisualizer />;
      case "cpu-scheduling":
        return <CPUSchedulingVisualizer />;
      case "hash-tables":
        return <HashTableVisualizer />;
      default:
        return <BSTVisualizer />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 animate-fade-in-up">
          <h1 className="text-3xl font-bold mb-2">{experiment.title}</h1>
          <p className="text-muted-foreground">{experiment.course}</p>
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
                    {experiment.objectives.map((obj, idx) => (
                      <li key={idx}>{obj}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Tasks:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    {experiment.tasks.map((task, idx) => (
                      <li key={idx}>{task}</li>
                    ))}
                  </ol>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>Due Date:</span>
                    <span className="font-semibold text-foreground">Tomorrow, 11:59 PM</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Course:</span>
                    <span className="font-semibold text-foreground">{experiment.course}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Visualization */}
          <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            {renderVisualizer()}
          </div>

          {/* Right Panel - Controls & Submission */}
          <div className="lg:col-span-1 space-y-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Submit Analysis</CardTitle>
                <CardDescription>Answer the questions below</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {experiment.questions.map((question, idx) => (
                  <div key={idx}>
                    <label className="text-sm font-medium mb-2 block">
                      {idx + 1}. {question}
                    </label>
                    <Textarea
                      placeholder="Your answer..."
                      value={idx === 0 ? submissionText : ""}
                      onChange={idx === 0 ? (e) => setSubmissionText(e.target.value) : undefined}
                      className="min-h-[100px]"
                    />
                  </div>
                ))}

                <div className="pt-4 space-y-2">
                  <Button variant="hero" className="w-full" onClick={handleSubmit}>
                    <Send className="h-4 w-4" />
                    Submit Lab Report
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Experiment snapshot will be automatically attached
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
