import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Navbar } from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { courseApi, experimentApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Submission = {
  id: string;
  experiment_id?: string;
  user_id?: string;
  answers: Array<{ question_id: string; answer: string }>;
  experiment_state?: any;
  status: string;
  grade: number | string;
  feedback?: string;
  submitted_at?: string;
  graded_at?: string;
  pdf_url?: string;
  student?: any;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  try {
    return format(new Date(dateString), "PPp"); // Format as "Apr 29, 2021, 1:23 PM"
  } catch (err) {
    return dateString;
  }
};

const SubmissionView = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { experimentId } = useParams<{ experimentId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(
    null
  );
  const [isGrading, setIsGrading] = useState(false);
  const [score, setScore] = useState<string>("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!profile) return;
    if (profile.role !== "instructor") {
      // simple guard: redirect students to dashboard
      navigate("/");
      return;
    }

    const fetchSubmissions = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!courseId) throw new Error("Missing course id");
        const res = await courseApi.getSubmissions(courseId, experimentId);
        setSubmissions(res?.data || []);
      } catch (err) {
        console.error("Failed to fetch submissions:", err);
        setError("Could not load submissions. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [courseId, profile, navigate]);

  const handleGrade = async () => {
    if (!selectedSubmission) return;

    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 10) {
      toast.error("Invalid score. Please enter a number between 0 and 10");
      return;
    }

    try {
      await experimentApi.gradeSubmission(selectedSubmission.id, {
        score: numScore,
        feedback: feedback.trim() || undefined,
      });

      // Update the submissions list
      setSubmissions(
        submissions.map((s) =>
          s.id === selectedSubmission.id
            ? { ...s, grade: numScore, feedback: feedback.trim() || undefined }
            : s
        )
      );
      toast.success("Submission graded successfully");

      // Reset and close dialog
      setIsGrading(false);
      setSelectedSubmission(null);
      setScore("");
      setFeedback("");
    } catch (error) {
      toast.error("Failed to save grade. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Submissions</h1>
          <p className="text-muted-foreground">Course: {}</p>
        </div>

        <div className="flex gap-2 mb-4">
          <Button asChild variant="ghost" size="sm">
            <Link to={`/course/${courseId}`}>Back to Course</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Student Submissions</CardTitle>
            <CardDescription>Review and download student work</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="text-sm text-muted-foreground">Loading...</div>
            )}
            {error && <div className="text-sm text-destructive">{error}</div>}

            {!loading && !error && submissions.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No submissions found.
              </div>
            )}

            {!loading && submissions.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Feedback</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">
                        {s.student?.full_name ?? s.user_id ?? "Unknown Student"}
                      </TableCell>
                      <TableCell>{formatDate(s.submitted_at)}</TableCell>
                      <TableCell>
                        {typeof s.grade === "number" ? s.grade : "—"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {s.feedback || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {s.pdf_url ? (
                            <a
                              href={s.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button size="sm" variant="ghost">
                                View PDF
                              </Button>
                            </a>
                          ) : (
                            <Badge variant="secondary">No files</Badge>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedSubmission(s);
                              setScore(s.grade?.toString() || "");
                              setFeedback(s.feedback || "");
                              setIsGrading(true);
                            }}
                          >
                            Grade
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog
          open={isGrading}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedSubmission(null);
              setScore("");
              setFeedback("");
            }
            setIsGrading(open);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Grade Submission</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="score" className="text-sm font-medium">
                  Score (0-10)*
                </label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="Enter score"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="feedback" className="text-sm font-medium">
                  Feedback (optional)
                </label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter feedback"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsGrading(false)}>
                Cancel
              </Button>
              <Button onClick={handleGrade}>Save Grade</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SubmissionView;
