import { Fragment } from "react";

const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

function renderWithLinks(text: string) {
  const parts = text.split(URL_PATTERN);
  return parts.map((part, index) =>
    part.startsWith("http://") || part.startsWith("https://") ? (
      <a
        key={index}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2 hover:text-primary/80"
      >
        {part}
      </a>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}

interface TaskDescriptionPanelProps {
  description: string;
}

export function TaskDescriptionPanel({
  description,
}: TaskDescriptionPanelProps) {
  const trimmed = description.trim();

  return (
    <div>
      <h2 className="text-h3 mb-2 text-foreground">Description</h2>
      {trimmed ? (
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90">
          {renderWithLinks(description)}
        </p>
      ) : (
        <p className="text-sm text-muted">No description has been added.</p>
      )}
    </div>
  );
}
