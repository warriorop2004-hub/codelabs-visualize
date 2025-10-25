import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type UserProfile = {
  id: string;
  full_name: string;
  role: "student" | "instructor";
  avatar_url?: string;
};

type AuthContextType = {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (
    email: string,
    password: string,
    full_name?: string,
    role?: string
  ) => Promise<any>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data && !error) {
      setProfile(data as UserProfile);
    }
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setUser(data.session?.user ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      data?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    } else {
      setProfile(null);
    }
  }, [user]);

  const signIn = async (email: string, password: string) => {
    const res = await supabase.auth.signInWithPassword({ email, password });
    if (res.error) throw res.error;
    setUser(res.data.session?.user ?? null);
    return res;
  };

  const signUp = async (
    email: string,
    password: string,
    full_name?: string,
    role: string = "student"
  ) => {
    const { data: data, error: error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role: role,
        },
      },
    });

    if (error) throw error;

    if (data) {
      console.log("User signed up:", data.user.id);
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: full_name || "",
        role: role,
      });

      if (profileError) {
        console.error("Profile creation failed:", profileError);
      }
    }
    return data.user;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
