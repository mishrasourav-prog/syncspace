export function SocialAuthButtons() {
    return (
      <div className="flex flex-col gap-2.5 mb-6">
        <button
          type="button"
          className="flex items-center justify-center gap-2.5 w-full text-sm font-medium text-foreground bg-border/30 border border-border hover:bg-border/50 hover:border-muted/40 transition-colors duration-200 rounded-md py-2.5"
        >
          <GoogleIcon />
          Continue with Google
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2.5 w-full text-sm font-medium text-foreground bg-border/30 border border-border hover:bg-border/50 hover:border-muted/40 transition-colors duration-200 rounded-md py-2.5"
        >
          <GitHubIcon />
          Continue with GitHub
        </button>
      </div>
    );
  }
  
  export function AuthDivider() {
    return (
      <div className="flex items-center gap-3 mb-6" role="separator">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>
    );
  }
  
  function GoogleIcon() {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.7-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
        <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1C3.3 21.3 7.3 24 12 24z" />
        <path fill="#FBBC05" d="M5.4 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.6.4-2.4V6.5H1.4C.5 8.2 0 10.1 0 12s.5 3.8 1.4 5.5l4-3.1z" />
        <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.7l3.4-3.4C17.9 1.2 15.2 0 12 0 7.3 0 3.3 2.7 1.4 6.5l4 3.1c.9-2.8 3.5-4.8 6.6-4.8z" />
      </svg>
    );
  }
  
  function GitHubIcon() {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 0C5.4 0 0 5.4 0 12c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 3.5 18.3 3.8 18.3 3.8c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6C20.6 21.8 24 17.3 24 12c0-6.6-5.4-12-12-12z" />
      </svg>
    );
  }