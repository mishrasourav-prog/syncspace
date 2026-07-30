interface DocumentEditorReadOnlyBannerProps {
  message: string | null;
}

export function DocumentEditorReadOnlyBanner({
  message,
}: DocumentEditorReadOnlyBannerProps) {
  if (!message) return null;

  return (
    <div
      role="status"
      className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm text-warning"
    >
      {message}
    </div>
  );
}
