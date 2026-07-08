import { useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, User, AtSign, Camera, ArrowRight } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { SocialAuthButtons, AuthDivider } from "../components/SocialAuthButtons";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signupSchema, type SignupFormValues } from "../schemas/auth.schemas";
import { useSignupMutation, useUploadAvatarMutation } from "../hooks/useAuthMutations";

interface SignupPageProps {
  onSuccess?: (email: string) => void;
  onNavigateToLogin?: () => void;
}

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

export function SignupPage({ onSuccess, onNavigateToLogin }: SignupPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const signupMutation = useSignupMutation();
  const uploadAvatarMutation = useUploadAvatarMutation();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { agreedToTerms: false as unknown as true },
  });

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select an image file");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError("Image must be under 2MB");
      return;
    }

    setAvatarError(null);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSubmit = (values: SignupFormValues) => {
    const payload = {
      name: values.name,
      username: values.username,
      email: values.email,
      password: values.password,
    };

    signupMutation.mutate(payload, {
      onSuccess: async (data) => {
        if (avatarFile) {
          try {
            await uploadAvatarMutation.mutateAsync({ email: data.email, file: avatarFile });
          } catch {
            // Non-fatal — account exists; avatar can be added later from profile settings.
          }
        }
        onSuccess?.(data.email);
      },
    });
  };

  const isSubmitting = signupMutation.isPending || uploadAvatarMutation.isPending;

  return (
    <AuthLayout>
      <h1 className="text-h1 text-foreground mb-1">Create your account</h1>
      <p className="text-body mb-4">Sign up for free</p>

      <SocialAuthButtons />
      <AuthDivider />

      {signupMutation.isError && (
        <div className="mb-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {signupMutation.error?.message ?? "Unable to create account. Please try again."}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex justify-center mb-4">
          <div className="relative">
            <button
              type="button"
              onClick={handleAvatarClick}
              className="w-16 h-16 rounded-full bg-background border border-border overflow-hidden flex items-center justify-center hover:border-muted/60 transition-colors duration-150"
              aria-label="Upload avatar"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-muted" />
              )}
            </button>
            <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center border-2 border-surface">
              <Camera className="w-2.5 h-2.5 text-primary-foreground" />
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>
        {avatarError && (
          <p className="text-xs text-danger text-center -mt-3 mb-3">{avatarError}</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Full name" htmlFor="fullName">
            <Input
              id="fullName"
              icon={User}
              placeholder="Alan Turing"
              error={errors.name?.message}
              {...register("name")}
            />
          </FormField>

          <FormField label="Username" htmlFor="username">
            <Input
              id="username"
              icon={AtSign}
              placeholder="alanturing"
              error={errors.username?.message}
              {...register("username")}
            />
          </FormField>
        </div>

        <FormField label="Work email" htmlFor="email">
          <Input
            id="email"
            type="email"
            icon={Mail}
            placeholder="you@company.com"
            error={errors.email?.message}
            {...register("email")}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Password" htmlFor="password">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              icon={Lock}
              placeholder="8+ characters"
              error={errors.password?.message}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors duration-150"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              {...register("password")}
            />
          </FormField>

          <FormField label="Confirm password" htmlFor="confirmPassword">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              icon={Lock}
              placeholder="Repeat password"
              error={errors.confirmPassword?.message}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors duration-150"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              {...register("confirmPassword")}
            />
          </FormField>
        </div>

        <Controller
          name="agreedToTerms"
          control={control}
          render={({ field }) => (
            <label className="flex items-start gap-2 mb-1 cursor-pointer">
              <input
                type="checkbox"
                checked={field.value === true}
                onChange={(e) => field.onChange(e.target.checked)}
                className="mt-0.5 accent-primary"
              />
              <span className="text-xs text-muted leading-relaxed">
                I agree to the{" "}
                <a href="/terms" className="text-primary hover:text-primary/80">Terms of Service</a>{" "}
                and{" "}
                <a href="/privacy" className="text-primary hover:text-primary/80">Privacy Policy</a>
              </span>
            </label>
          )}
        />
        {errors.agreedToTerms && (
          <p className="text-xs text-danger mb-3">{errors.agreedToTerms.message}</p>
        )}

        <div className="mt-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
            {!isSubmitting && <ArrowRight className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </form>

      <p className="text-center text-caption mt-5">
        Already have an account?{" "}
        <button
          onClick={onNavigateToLogin}
          className="text-primary hover:text-primary/80 font-medium transition-colors duration-150"
        >
          Log in
        </button>
      </p>
    </AuthLayout>
  );
}