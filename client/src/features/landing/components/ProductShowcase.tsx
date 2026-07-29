import { Reveal } from "./Reveal";

interface StoryItem {
  heading: string;
  points: string[];
  image: string;
  alt: string;
  width: number;
  height: number;
}

const STORY_ITEMS: StoryItem[] = [
  {
    heading: "See what is moving, blocked, and waiting for attention.",
    points: [
      "Board and list views for tasks and issues",
      "Assignees and admin-assignment requests",
      "Comments, priorities, and due dates",
      "Realtime updates as work changes",
    ],
    image: "/landing/tasks-and-issues.png",
    alt: "SyncSpace tasks and issues board with filters and project summary",
    width: 1800,
    height: 1035,
  },
  {
    heading: "Keep project knowledge beside the work.",
    points: [
      "Rich project documents with revisions",
      "Preview before publishing changes",
      "Export, archive, and restore controls",
      "Shared project context for the whole team",
    ],
    image: "/landing/document-editor.png",
    alt: "SyncSpace rich-text project document editor",
    width: 1800,
    height: 1032,
  },
  {
    heading: "Turn project conversations into visible decisions.",
    points: [
      "Threaded discussions and replies",
      "Participants and moderation controls",
      "Realtime updates as conversations move",
      "Notifications that open the related discussion or reply",
    ],
    image: "/landing/discussions.png",
    alt: "SyncSpace project discussions with replies, participants, and activity",
    width: 1800,
    height: 1036,
  },
];

export function ProductShowcase() {
  return (
    <div className="border-t border-border">
      {STORY_ITEMS.map((item, index) => {
        const imageFirst = index % 2 === 0;

        return (
          <section
            key={item.heading}
            className={`px-4 py-16 sm:px-6 sm:py-20 lg:py-24 ${index > 0 ? "border-t border-border" : ""}`}
          >
            <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
              <Reveal className={imageFirst ? "lg:order-1" : "lg:order-2"}>
                <div className="overflow-hidden rounded-lg border border-border bg-surface">
                  <img
                    src={item.image}
                    alt={item.alt}
                    className="h-auto w-full"
                    width={item.width}
                    height={item.height}
                    loading="lazy"
                  />
                </div>
              </Reveal>

              <Reveal delay={80} className={imageFirst ? "lg:order-2" : "lg:order-1"}>
                <h2 className="text-h1 text-foreground">{item.heading}</h2>
                <ul className="mt-6 flex flex-col gap-3">
                  {item.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-sm leading-relaxed text-muted sm:text-base">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </section>
        );
      })}
    </div>
  );
}
