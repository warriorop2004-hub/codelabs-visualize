import { useState, useEffect , useRef} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { BSTState, BSTVisualizer } from "@/components/BSTVisualizer";
import { SortingVisualizer, SortingVisualizerHandle } from "@/components/SortingVisualizer";
import { TCPVisualizer, TCPVisualizerHandle } from "@/components/TCPVisualizer";
import { CPUSchedulingState, CPUSchedulingVisualizer } from "@/components/CPUSchedulingVisualizer";
import { HashTableState, HashTableVisualizer } from "@/components/HashTableVisualizer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Send } from "lucide-react";
import { toast } from "sonner";
import { experimentApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { sub } from "date-fns";

const Experiment = () => {
  const { slug } = useParams<{ slug: string }>();
  const bstRef = useRef<BSTState>(null);
  const hashTableRef = useRef<HashTableState>(null);
  const cpuStateRef = useRef<CPUSchedulingState>(null);
  const sortingRef = useRef<SortingVisualizerHandle>(null);
  const tcpRef = useRef<TCPVisualizerHandle>(null);
  const [experimentInfo, setExperimentInfo] = useState<any>(null);
  const [submissionText, setSubmissionText] = useState<string[]>(
    Array(experimentInfo?.questions.length).fill("")
  );

  useEffect(() => {
    const fetchExperiment = async () => {
      try {
        const { data } = await experimentApi.getExperimentBySlug(slug!);
        setExperimentInfo(data);
      } catch (error) {
        console.error("Error fetching experiment:", error);
      }
    };

    fetchExperiment();
  }, [slug]);

  const id = experimentInfo?.id;
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile?.role === "instructor") {
      navigate("/dashboard");
    }
  }, [profile, navigate]);

  if (!profile || profile.role !== "student") return null;

  if (!experimentInfo) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-bold mb-4">Experiment Not Found</h1>
          <p className="text-muted-foreground">
            This experiment hasn't been implemented yet.
          </p>
        </div>
      </div>
    );
  }

  // --- new helper: produce a serializable snapshot for diverse visualizers ---
  const serializeState = (rawState: any) => {
    if (rawState == null) return null;

    // DOM nodes / SVG: already returned as outerHTML in getCurrentState for BST
    if (typeof rawState === "string") {
      // could be outerHTML or JSON string
      return rawState;
    }

    // If the visualizer exposed a getState() with complex objects, strip functions and circular refs
    try {
      return JSON.parse(JSON.stringify(rawState));
    } catch {
      // fallback: toString
      try {
        return String(rawState);
      } catch {
        return null;
      }
    }
  };

  // Build a consistent submission document that the backend can use to render a PDF
  const buildSubmissionDocument = (answers: string[], rawExperimentState: any) => {
    const timestamp = new Date().toISOString();
    const student = {
      id: profile?.id ?? "unknown",
      name: profile?.full_name ?? "Unknown Student",
    };

    // include canonical experiment metadata (instructions, tasks, questions) if available from server
    const metadata = {
      experimentId: id,
      title: experimentInfo?.title,
      course: experimentInfo?.course,
      objectives: experimentInfo?.objectives,
      tasks: experimentInfo?.tasks,
      questions: experimentInfo?.questions,
    };

    const snapshot = serializeState(rawExperimentState);

    return {
      meta: {
        generatedAt: timestamp,
        student,
        metadata,
      },
      answers: answers.map((a, idx) => ({
        questionIndex: idx,
        questionText: metadata.questions?.[idx] ?? null,
        answerText: a,
      })),
      experimentState: snapshot,
    };
  };

  const handleSubmit = async () => {
    if (
      !submissionText.length ||
      submissionText.some((text) => text.trim() === "")
    ) {
      toast.error("Please provide your analysis before submitting");
      return;
    }

    try {
      const currentState = getCurrentState();
      const documentPayload = buildSubmissionDocument(submissionText, currentState);

      console.log("Submitting lab report with document:", documentPayload);

      // send full normalized submission document to backend - backend can create PDF + store
      await experimentApi.submit(id!, documentPayload);

      toast.success("Lab report submitted successfully!");
      setSubmissionText(Array(experimentInfo.questions.length).fill(""));
    } catch (error) {
      toast.error("Failed to submit lab report");
      console.error(error);
    }
  };

  const getCurrentState = () => {
    // Get current state of the visualizer based on experiment type
    switch (slug) {
      case "bst":
        return {
          type: "bst",
          tree: bstRef.current?.getTreeSnapshot?.() ?? null,
          logs: bstRef.current?.logs ?? [],
          nodeCount: bstRef.current?.nodeCount ?? 0,
          depth: bstRef.current?.depth,
          pan: bstRef.current?.pan,
          zoom: bstRef.current?.zoom,
          highlighted: bstRef.current?.highlighted|| [],
        };
      case "sorting":
        return {
          type: "sorting",
          arrayState: serializeState(sortingRef.current?.getState?.() ?? sortingRef.current),
        };
      case "hash-tables":
        return {
          type: "hash-tables",
          tableState: serializeState({
            table: hashTableRef.current?.table,
            loadFactor: hashTableRef.current?.loadFactor,
            operationsCount: hashTableRef.current?.operationsCount,
            logs: hashTableRef.current?.logs,
          }),
        };
      case "cpu-scheduling":
        return {
          type: "cpu-scheduling",
          cpuState: serializeState(cpuStateRef.current),
        };
      case "tcp-handshake":
        return {
          type: "tcp-handshake",
          state: serializeState(tcpRef.current?.getState?.() ?? tcpRef.current),
        };
      default:
        return {};
    }
  };

  const renderVisualizer = () => {
    switch (slug) {
      case "bst":
        return <BSTVisualizer ref={bstRef} />;
      case "sorting":
        return <SortingVisualizer ref={sortingRef}/>;
      case "tcp-handshake":
        return <TCPVisualizer ref={tcpRef}/>;
      case "cpu-scheduling":
        return <CPUSchedulingVisualizer ref={cpuStateRef}/>;
      case "hash-tables":
        return <HashTableVisualizer ref={hashTableRef} />;
      default:
        return <BSTVisualizer ref={bstRef}/>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 animate-fade-in-up">
          <h1 className="text-3xl font-bold mb-2">{experimentInfo.title}</h1>
          <p className="text-muted-foreground">{experimentInfo.course}</p>
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
                    {experimentInfo.objectives.map((obj, idx) => (
                      <li key={idx}>{obj}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Tasks:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    {experimentInfo.tasks.map((task, idx) => (
                      <li key={idx}>{task}</li>
                    ))}
                  </ol>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>Due Date:</span>
                    <span className="font-semibold text-foreground">
                      Tomorrow, 11:59 PM
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Course:</span>
                    <span className="font-semibold text-foreground">
                      {experimentInfo.course}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Visualization */}
          <div
            className="lg:col-span-2 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            {renderVisualizer()}
          </div>

          {/* Right Panel - Controls & Submission */}
          <div
            className="lg:col-span-1 space-y-6 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Submit Analysis</CardTitle>
                <CardDescription>Answer the questions below</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {experimentInfo.questions.map((question, idx) => (
                  <div key={idx}>
                    <label className="text-sm font-medium mb-2 block">
                      {idx + 1}. {question}
                    </label>
                    <Textarea
                      placeholder="Your answer..."
                      value={submissionText[idx] || ""}
                      onChange={(e) => {
                        const updated = [...submissionText];
                        updated[idx] = e.target.value;
                        setSubmissionText(updated);
                      }}
                      className="min-h-[100px]"
                    />
                  </div>
                ))}

                <div className="pt-4 space-y-2">
                  <Button
                    variant="hero"
                    className="w-full"
                    onClick={handleSubmit}
                  >
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
