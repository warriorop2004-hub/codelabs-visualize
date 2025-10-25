import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, CheckCircle2, PlayCircle } from "lucide-react";
import { courseApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

type Experiment = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'not-started' | 'in-progress' | 'completed';
  submissionCount?: number;
  completionRate?: number;
};

type CourseDetails = {
  id: string;
  code: string;
  name: string;
  description: string;
  instructor: string;
  experiments: Experiment[];
};

const Course = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { profile } = useAuth();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await courseApi.getCourseById(courseId);
        setCourse(response.data);
      } catch (error) {
        console.error("Error fetching course details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  if (loading) return <div>Loading...</div>;
  if (!course) return <div>Course not found</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">← Back to Dashboard</Link>
            </Button>
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {course.code}: {course.name}
              </h1>
              <p className="text-muted-foreground">{course.description}</p>
            </div>
            {profile?.role === 'instructor' && (
              <Button variant="hero">Add Experiment</Button>
            )}
          </div>

          <div className="flex gap-4 mt-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <PlayCircle className="h-4 w-4" />
              {course.experiments.length} Experiments
            </Badge>
          </div>
        </div>

        <div className="grid gap-6">
          {course.experiments.map((experiment) => (
            <Card key={experiment.id} className="hover:shadow-md transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{experiment.title}</CardTitle>
                    <CardDescription>{experiment.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Due: {experiment.dueDate}
                    </span>
                    {profile?.role === 'instructor' && (
                      <>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          {experiment.submissionCount} submissions
                        </span>
                        <span>
                          {experiment.completionRate}% completion rate
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {profile?.role === 'instructor' ? (
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/course/${courseId}/experiment/${experiment.id}/submissions`}>
                          View Submissions
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="hero" size="sm" asChild>
                        <Link to={`/experiment/${experiment.id}`}>
                          {experiment.status === 'not-started' ? 'Start' : 'Continue'}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Course;
