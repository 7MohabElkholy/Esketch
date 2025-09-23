import { useRouter } from "expo-router";
import { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "./supabase";

export const AuthContext = createContext({
  session: {},
  logIn: () => {},
  logOut: () => {},
  signup: async () => {},
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // load session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // listen for changes
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.subscription.unsubscribe();
  }, []);

  if (loading) {
    // temporary splash / spinner while checking AsyncStorage
    return null;
  }

  const logIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert(error.message);
      return;
    }
    setSession(data.session);
    router.replace("/");
  };

  const logOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    router.replace("/login");
  };

  const signup = async (email, password) => {
    console.log("Signing up with", email, password);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      alert(error.message);
      console.log(error);
      return;
    }
    // If confirmation email is OFF, session exists now
    if (data.session) {
      console.log("User signed up and logged in:", data.user);

      setSession(data.session);
      router.replace("/");
    } else {
      alert("Check your email to confirm your account!");
    }
  };

  return (
    <AuthContext.Provider value={{ session, logIn, logOut, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
