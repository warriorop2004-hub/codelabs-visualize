import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Play, CheckCircle2, Clock, Users, BarChart3 } from "lucide-react";
import { courseApi, userApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Course, RecentLab } from "@/types";

const Dashboard = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [studentCourses, setStudentCourses] = useState<Course[]>([]);
  const [instructorCourses, setInstructorCourses] = useState<Course[]>([]);
  const [recentLabs, setRecentLabs] = useState<RecentLab[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (profile?.role === "student") {
          const [coursesRes, progressRes] = await Promise.all([
            courseApi.getEnrolled(),
            userApi.getProgress(),
          ]);

          setStudentCourses(coursesRes.data);
          setRecentLabs(progressRes.data.recentLabs || []);
        } else if (profile?.role === "instructor") {
          const coursesRes = await courseApi.getCourseByInstructor(profile.id);
          setInstructorCourses(coursesRes.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile]);

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {profile.full_name}! 👋
          </h1>
          <p className="text-muted-foreground">
            {profile.role === "student"
              ? "Continue your learning journey"
              : "Manage your courses and students"}
          </p>
        </div>

        {profile.role === "student" ? (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              <Card className="bg-gradient-card border-0 shadow-md hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Active Courses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{studentCourses.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">This semester</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0 shadow-md hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Labs Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground mt-1">Out of 24 total</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0 shadow-md hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-accent" />
                    Upcoming Deadlines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">2</div>
                  <p className="text-xs text-muted-foreground mt-1">This week</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Labs */}
            <Card className="shadow-md animate-fade-in-up">
              <CardHeader>
                <CardTitle>Recent Labs</CardTitle>
                <CardDescription>Continue where you left off</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentLabs.map((lab) => (
                  <div
                    key={lab.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Play className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{lab.name}</h3>
                        <p className="text-sm text-muted-foreground">{lab.course}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={lab.status === "in-progress" ? "default" : "secondary"}>
                        {lab.dueDate}
                      </Badge>
                      <Button variant="hero" size="sm" asChild>
                        <Link to="/experiment/bst">Continue</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* My Courses */}
            <Card className="shadow-md animate-fade-in-up">
              <CardHeader>
                <CardTitle>My Courses</CardTitle>
                <CardDescription>Track your progress across all courses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {studentCourses.map((course) => (
                  <div key={course.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">
                          {course.code}: {course.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {course.completed} of {course.labs} labs completed
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/course/${course.id}`}>View Course</Link>
                      </Button>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-accent h-2 rounded-full transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{course.progress}% complete</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Instructor Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              <Card className="bg-gradient-card border-0 shadow-md hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Active Courses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{instructorCourses.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">This semester</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0 shadow-md hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-secondary" />
                    Total Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">80</div>
                  <p className="text-xs text-muted-foreground mt-1">Across all courses</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0 shadow-md hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-accent" />
                    Avg Completion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">72%</div>
                  <p className="text-xs text-muted-foreground mt-1">Across all labs</p>
                </CardContent>
              </Card>
            </div>

            {/* Instructor Courses */}
            <Card className="shadow-md animate-fade-in-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Courses</CardTitle>
                    <CardDescription>Manage and monitor student progress</CardDescription>
                  </div>
                  <Button variant="hero">Create New Lab</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {instructorCourses.map((course) => (
                  <div key={course.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {course.code}: {course.name}
                        </h3>
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {course.students} students
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            {course.submissions} submissions
                          </span>
                          <span className="flex items-center gap-1">
                            <BarChart3 className="h-4 w-4" />
                            {course.avgCompletion}% avg completion
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/course/${course.id}`}>View Course</Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/course/${course.id}/settings`}>Settings</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
