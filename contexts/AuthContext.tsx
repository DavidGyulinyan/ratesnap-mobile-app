import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getSupabaseClient } from "@/lib/supabase-safe";
import { Session, User, AuthError } from "@supabase/supabase-js";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getSupabaseOAuthRedirectUrl,
  logDevExpoOAuthRedirectHint,
  parseOAuthReturnUrl,
} from "@/lib/oauthRedirect";
import alertCheckerService from "@/lib/alertCheckerService";
import { clearPersistedFormDraftsAfterSignOut } from "@/lib/amScreensDraft";

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    username?: string
  ) => Promise<{ error?: AuthError; needsEmailConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error?: AuthError }>;
  signInWithApple: () => Promise<{ error?: AuthError }>;
  resetPassword: (email: string) => Promise<{ error?: AuthError }>;
  resendConfirmationEmail: (email: string) => Promise<{ error?: AuthError }>;
  /** After sign-up, confirm the email using the OTP/code from the message (Supabase email template must include the token). */
  confirmSignupWithOtp: (
    email: string,
    token: string
  ) => Promise<{ error?: AuthError }>;
  /** Increments when local form drafts are cleared (e.g. after sign-out). */
  formDraftResetEpoch: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [formDraftResetEpoch, setFormDraftResetEpoch] = useState(0);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error("Supabase client not available");
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session } }: { data: { session: Session | null } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((error: any) => {
        console.warn("Failed to get initial session:", error);
        setLoading(false);
      });

    // Listen for auth changes
    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(
        (event: any, session: Session | null) => {
          console.log(
            "Auth state changed:",
            event,
            session ? "User authenticated" : "No user"
          );

          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);

          if (session?.user) {
            console.log("User authenticated:", session.user.email);
            // Start alert checking for authenticated users
            alertCheckerService.startChecking(60); // Check every 60 minutes
          } else {
            console.log("User signed out");
            // Stop alert checking when user signs out
            alertCheckerService.stopChecking();
          }

          if (event === "SIGNED_OUT" || event === "USER_DELETED") {
            void clearPersistedFormDraftsAfterSignOut()
              .catch((e) =>
                console.warn("clearPersistedFormDraftsAfterSignOut:", e)
              )
              .finally(() => {
                setFormDraftResetEpoch((n) => n + 1);
              });
          }
        }
      );

      return () => subscription.unsubscribe();
    } catch (error) {
      console.warn("Failed to set up auth state listener:", error);
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, username?: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        error: { message: "Authentication service not available" } as AuthError,
      };
    }

    try {
      setLoading(true);
      console.log("Starting sign up process for email:", email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split("@")[0],
          },
        },
      });

      if (error) {
        console.error("Sign up error:", error);
        return { error };
      }

      const needsEmailConfirmation = Boolean(
        data.user && !data.session
      );

      console.log(
        "Sign up successful, user data:",
        data.user ? "User created" : "Confirmation pending",
        needsEmailConfirmation ? "(email confirmation required)" : ""
      );

      // Clear potentially conflicting local storage data on successful sign up
      try {
        const keysToRemove = [
          "cachedExchangeRates", // Clear cached rates for new user
          "onboardingCompleted", // Reset onboarding for new user
          // Keep: 'hasSignedInBefore', 'rememberMe', 'language', 'theme' - these are user preferences
        ];

        await AsyncStorage.multiRemove(keysToRemove);
        console.log("Cleared local storage data after successful sign up");
      } catch (storageError) {
        console.warn(
          "Failed to clear local storage after sign up:",
          storageError
        );
      }

      return { needsEmailConfirmation };
    } catch (error) {
      console.error("Sign up catch error:", error);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        error: { message: "Authentication service not available" } as AuthError,
      };
    }

    try {
      setLoading(true);
      console.log("Starting sign in process for email:", email);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const errCode =
          typeof (error as { code?: string }).code === "string"
            ? (error as { code?: string }).code
            : "";
        // Handle email confirmation error specifically
        if (
          errCode === "email_not_confirmed" ||
          error.message.includes("Email not confirmed") ||
          error.message.includes("email_not_confirmed") ||
          error.message.includes("not confirmed") ||
          error.message.includes("Email link is invalid or has expired")
        ) {
          // Don't log email confirmation errors to console since we handle them gracefully
          return {
            error: {
              message:
                "Please check your email and click the confirmation link before signing in. Didn't receive the email?",
              name: "EmailNotConfirmedError",
            } as AuthError,
          };
        }

        // Handle invalid credentials
        if (
          errCode === "invalid_credentials" ||
          errCode === "invalid_grant" ||
          error.message.includes("Invalid login credentials") ||
          error.message.includes("User not found") ||
          error.message.includes("Invalid email or password")
        ) {
          // Don't log invalid credentials errors to console since we handle them gracefully
          return {
            error: {
              message:
                "Invalid email or password. Please check your credentials and try again.",
              name: "InvalidCredentialsError",
            } as AuthError,
          };
        }

        // Log other unexpected errors
        console.error("Sign in error:", error);
        return { error };
      }

      console.log("Sign in successful");

      // Clear potentially conflicting local storage data on successful authentication
      try {
        const keysToRemove = [
          "cachedExchangeRates", // Clear cached rates to ensure fresh data for this account session
          // Do not remove onboarding flags here — first-login guide is per-user and persists across sign-ins.
          // Keep: 'hasSignedInBefore', 'rememberMe', 'language', 'theme' - these are user preferences
        ];

        await AsyncStorage.multiRemove(keysToRemove);
        console.log("Cleared local storage data after successful sign in");
      } catch (storageError) {
        console.warn(
          "Failed to clear local storage after sign in:",
          storageError
        );
      }

      // Mark that user has signed in before for future sign-in screens
      AsyncStorage.setItem("hasSignedInBefore", "true").catch((error) => {
        console.warn("Failed to set hasSignedInBefore flag:", error);
      });
      return {};
    } catch (error) {
      console.error("Sign in catch error:", error);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error("Authentication service not available for sign out");
      return;
    }

    try {
      setLoading(true);
      console.log("Starting sign out process");

      await supabase.auth.signOut();

      console.log("Sign out successful");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        error: { message: "Authentication service not available" } as AuthError,
      };
    }

    try {
      setLoading(true);
      console.log("Starting Google sign in");

      const redirectTo = getSupabaseOAuthRedirectUrl();
      logDevExpoOAuthRedirectHint(redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        console.log("Google sign-in error:", error.message);
        return { error };
      }

      if (!data?.url) {
        return {
          error: {
            message: "Unable to start Google sign-in flow.",
            name: "OAuthStartError",
          } as AuthError,
        };
      }

      const authResult = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo
      );

      if (authResult.type !== "success" || !authResult.url) {
        return {
          error: {
            message:
              authResult.type === "cancel"
                ? "Google sign-in was cancelled."
                : "Google sign-in did not complete. Please try again.",
            name: "OAuthCancelled",
          } as AuthError,
        };
      }

      const parsed = parseOAuthReturnUrl(authResult.url);
      if (parsed.error) {
        return {
          error: {
            message:
              parsed.errorDescription?.replace(/\+/g, " ") ??
              `Google sign-in failed: ${parsed.error}`,
            name: "OAuthError",
          } as AuthError,
        };
      }

      if (parsed.access_token && parsed.refresh_token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: parsed.access_token,
          refresh_token: parsed.refresh_token,
        });
        if (sessionError) {
          return { error: sessionError };
        }
        console.log("Google sign in completed successfully (session tokens)");
        return {};
      }

      if (parsed.code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(parsed.code);
        if (exchangeError) {
          const msg = exchangeError.message ?? "";
          const { data: existing } = await supabase.auth.getSession();
          if (
            existing.session &&
            (msg.includes("code verifier") || msg.includes("auth code"))
          ) {
            console.log(
              "Google sign in: session already established (duplicate PKCE exchange skipped)"
            );
            return {};
          }
          return { error: exchangeError };
        }
        console.log("Google sign in completed successfully (PKCE code)");
        return {};
      }

      return {
        error: {
          message:
            "Google sign-in did not return a code or session. Check Supabase Redirect URLs include: " +
            redirectTo,
          name: "OAuthCodeMissing",
        } as AuthError,
      };
    } catch (error) {
      console.error("Google sign in catch error:", error);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signInWithApple = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        error: { message: "Authentication service not available" } as AuthError,
      };
    }

    try {
      setLoading(true);
      console.log("Starting Apple sign in");

      const redirectTo = getSupabaseOAuthRedirectUrl();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo,
        },
      });

      if (error) {
        console.log("Apple sign-in error:", error.message);
        return { error };
      }

      console.log("Apple sign in initiated successfully");
      return {};
    } catch (error) {
      console.error("Apple sign in catch error:", error);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        error: { message: "Authentication service not available" } as AuthError,
      };
    }

    try {
      const redirectTo = getSupabaseOAuthRedirectUrl();

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        return { error };
      }

      return {};
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        error: { message: "Authentication service not available" } as AuthError,
      };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) {
        return { error };
      }

      return {};
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const confirmSignupWithOtp = async (email: string, token: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        error: { message: "Authentication service not available" } as AuthError,
      };
    }

    try {
      const cleanToken = token.trim().replace(/\s+/g, "");
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: cleanToken,
        type: "signup",
      });

      if (error) {
        return { error };
      }

      return {};
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    signInWithApple,
    resetPassword,
    resendConfirmationEmail,
    confirmSignupWithOtp,
    formDraftResetEpoch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
