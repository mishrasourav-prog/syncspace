// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { AnimatePresence, motion } from "framer-motion";
// import { ArrowLeft, Mail, Lock, CheckCircle2 } from "lucide-react";
// import { AuthLayout } from "@/layouts/AuthLayout";
// import { Input } from "@/components/ui/input";
// import { FormField } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { forgotPasswordSchema, type ForgotPasswordFormValues } from "../schemas/auth.schemas";
// import { useForgotPasswordMutation } from "../hooks/useAuthMutations";
// import { useNavigate } from "react-router-dom";

// interface ForgotPasswordPageProps {
//   onNavigateToLogin?: () => void;
// }



// export function ForgotPasswordPage({ onNavigateToLogin }: ForgotPasswordPageProps) {
//   const forgotPasswordMutation = useForgotPasswordMutation();
//   const navigate = useNavigate();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

//  const onSubmit = (values: ForgotPasswordFormValues) => {
//   forgotPasswordMutation.mutate(values, {
//     onSuccess: () => {
//       navigate("/otp-verification", {
//         state: {
//           email: values.email,
//         },
//       });
//     },
//   });
// };


//   return (
//     <AuthLayout>
//       <button
//         type="button"
//         onClick={onNavigateToLogin}
//         className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors duration-150 mb-5"
//       >
//         <ArrowLeft className="w-3.5 h-3.5" />
//         Back to login
//       </button>

//       <AnimatePresence mode="wait">
//         {!isSent ? (
//           <motion.div
//             key="form"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.2 }}
//           >
//             <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
//               <Lock className="w-5 h-5 text-primary" />
//             </div>
//             <h1 className="text-h1 text-foreground mb-1">Reset your password</h1>
//             <p className="text-body mb-6">
//               Enter your email and we&apos;ll send you a reset link.
//             </p>

//             {forgotPasswordMutation.isError && (
//               <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
//                 {forgotPasswordMutation.error?.message ?? "Unable to send reset link."}
//               </div>
//             )}

//             <form onSubmit={handleSubmit(onSubmit)} noValidate>
//               <FormField label="Email" htmlFor="email">
//                 <Input
//                   id="email"
//                   type="email"
//                   icon={Mail}
//                   placeholder="you@company.com"
//                   error={errors.email?.message}
//                   {...register("email")}
//                 />
//               </FormField>

//               <Button type="submit" className="w-full" disabled={forgotPasswordMutation.isPending}>
//                 {forgotPasswordMutation.isPending ? "Sending..." : "Send reset link"}
//               </Button>
//             </form>
//           </motion.div>
//         ) : (
//           <motion.div
//             key="success"
//             initial={{ opacity: 0, scale: 0.96 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
//             className="text-center py-2"
//           >
//             <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center mb-4 mx-auto">
//               <CheckCircle2 className="w-5 h-5 text-success" />
//             </div>
//             <h1 className="text-h2 text-foreground mb-1">Check your inbox</h1>
//             <p className="text-body">We&apos;ve sent a password reset link to your email.</p>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </AuthLayout>
//   );
// }

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "../schemas/auth.schemas";
import { useForgotPasswordMutation } from "../hooks/useAuthMutations";

interface ForgotPasswordPageProps {
  onNavigateToLogin?: () => void;
}

export function ForgotPasswordPage({ onNavigateToLogin }: ForgotPasswordPageProps) {
  const forgotPasswordMutation = useForgotPasswordMutation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (values: ForgotPasswordFormValues) => {
    forgotPasswordMutation.mutate(values, {
      onSuccess: () => {
        navigate("/otp-verification", {
          state: {
            email: values.email,
            purpose: "PASSWORD_RESET",
          },
        });
      },
    });
  };

  return (
    <AuthLayout>
      <button
        type="button"
        onClick={onNavigateToLogin}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors duration-150 mb-5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to login
      </button>

      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        <Lock className="w-5 h-5 text-primary" />
      </div>
      <h1 className="text-h1 text-foreground mb-1">Reset your password</h1>
      <p className="text-sm text-muted-foreground">
    Enter your email address and we&apos;ll send you a
    six-digit verification code.
</p>

      {forgotPasswordMutation.isError && (
        <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {forgotPasswordMutation.error?.message ?? "Unable to send reset link."}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            icon={Mail}
            placeholder="you@company.com"
            error={errors.email?.message}
            {...register("email")}
          />
        </FormField>

        <Button
    type="submit"
    disabled={
        forgotPasswordMutation
            .isPending
    }
>
    {
        forgotPasswordMutation
            .isPending
            ? "Sending code..."
            : "Send verification code"
    }
</Button>
      </form>
    </AuthLayout>
  );
}