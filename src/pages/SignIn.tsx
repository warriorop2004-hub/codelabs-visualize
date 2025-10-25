import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Signed in");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button variant="hero" type="submit" className="w-full" disabled={loading}>
                Sign In
              </Button>
              <div className="text-center text-sm">
                Don't have an account? <Link to="/signup" className="text-primary underline">Sign up</Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default SignIn;
