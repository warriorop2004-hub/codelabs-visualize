import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { courseApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

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
  student?: any;
  files?: Array<{ url: string; name: string; type?: string }>;
};

const SubmissionView = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { experimentId } = useParams<{ experimentId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState<string | null>(null);

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
        const res = await courseApi.getSubmissions(courseId,experimentId);
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Submissions</h1>
          <p className="text-muted-foreground">Course: {courseId}</p>
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
          <CardContent className="space-y-4">
            {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
            {error && <div className="text-sm text-destructive">{error}</div>}

            {!loading && !error && submissions.length === 0 && (
              <div className="text-sm text-muted-foreground">No submissions found.</div>
            )}

            {!loading &&
              submissions.map((s) => {
                const pdfFile = s.files?.find(
                  (f) =>
                    f.type === "application/pdf" ||
                    (f.name && f.name.toLowerCase().endsWith(".pdf"))
                );
                const otherFiles = s.files?.filter((f) => f !== pdfFile) ?? [];

                return (
                  <div key={s.id} className="p-4 rounded-lg border bg-card flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{s.student?.full_name ?? s.user_id ?? "Unknown Student"}</h3>
                      <p className="text-sm text-muted-foreground">
                        Submitted: {s.submitted_at ?? "—"}
                      </p>
                      {typeof s.grade === "number" && (
                        <p className="text-sm text-muted-foreground">Score: {s.grade}</p>
                      )}
                      {s.feedback && <p className="text-sm mt-1">{s.feedback}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      {pdfFile ? (
                        <>
                          <a href={pdfFile.url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="ghost">View PDF</Button>
                          </a>
                          {otherFiles.map((f) => (
                            <a key={f.url} href={f.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                              <Button size="sm" variant="ghost">{f.name}</Button>
                            </a>
                          ))}
                        </>
                      ) : s.files && s.files.length > 0 ? (
                        s.files.map((f) => (
                          <a
                            key={f.url}
                            href={f.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2"
                          >
                            <Button size="sm" variant="ghost">{f.name}</Button>
                          </a>
                        ))
                      ) : (
                        <Badge variant="secondary">No files</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubmissionView;
