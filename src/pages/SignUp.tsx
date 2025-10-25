import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const SignUp = () => {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "instructor">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await signUp(email, password, fullName, role);
      toast.success(
        "Account created. Please verify your email before signing in."
      );
      navigate("/signin");
    } catch (err: any) {
      toast.error(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <div>
                <label className="text-sm mb-2 block">Role</label>
                <Select
                  value={role}
                  onValueChange={(v) => setRole(v as "student" | "instructor")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                variant="hero"
                type="submit"
                className="w-full"
                disabled={loading}
              >
                Create Account
              </Button>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link to="/signin" className="text-primary underline">
                  Sign in
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default SignUp;
