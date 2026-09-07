import type { CaseStudyBlockType } from "@/types/database";

export interface BlockDefinition {
  type: CaseStudyBlockType;
  label: string;
  description: string;
  defaultData: Record<string, unknown>;
}

// Adding a new block type: add one entry here, one editor form in
// admin/_components/blocks/editors/*, and one render case in
// components/case-study/BlockRenderer.tsx. Nothing else needs to change.
export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    type: "heading",
    label: "Heading",
    description: "A section heading.",
    defaultData: { text: "New heading", level: 2 },
  },
  {
    type: "paragraph",
    label: "Paragraph",
    description: "A block of body text.",
    defaultData: { text: "" },
  },
  {
    type: "image",
    label: "Image",
    description: "A single image with an optional caption.",
    defaultData: { media_id: null, caption: "" },
  },
  {
    type: "image_gallery",
    label: "Image gallery",
    description: "A row of multiple images.",
    defaultData: { media_ids: [] as string[] },
  },
  {
    type: "video",
    label: "Video",
    description: "An embedded or uploaded video.",
    defaultData: { media_id: null, embed_url: "", caption: "" },
  },
  {
    type: "quote",
    label: "Quote",
    description: "A pull quote with attribution.",
    defaultData: { text: "", attribution: "" },
  },
  {
    type: "statistics",
    label: "Statistics",
    description: "A row of number + label stats.",
    defaultData: { items: [{ label: "", value: "" }] },
  },
  {
    type: "process",
    label: "Process",
    description: "Ordered steps describing an approach.",
    defaultData: { steps: [{ title: "", description: "" }] },
  },
  {
    type: "timeline",
    label: "Timeline",
    description: "Dated milestones.",
    defaultData: { items: [{ date: "", title: "", description: "" }] },
  },
  {
    type: "feature",
    label: "Feature",
    description: "A highlighted feature with image and text.",
    defaultData: { title: "", description: "", media_id: null },
  },
  {
    type: "before_after",
    label: "Before / After",
    description: "A side-by-side comparison.",
    defaultData: { before_media_id: null, after_media_id: null, caption: "" },
  },
  {
    type: "design_decision",
    label: "Design decision",
    description: "Call out a key decision and its rationale.",
    defaultData: { title: "", description: "" },
  },
  {
    type: "text_image",
    label: "Text + image",
    description: "Text alongside a supporting image.",
    defaultData: { text: "", media_id: null, image_position: "right" },
  },
  {
    type: "full_width_image",
    label: "Full-width image",
    description: "An edge-to-edge image.",
    defaultData: { media_id: null, caption: "" },
  },
  {
    type: "two_column",
    label: "Two-column content",
    description: "Two independent text columns.",
    defaultData: { left: "", right: "" },
  },
];

export function getBlockDefinition(type: CaseStudyBlockType) {
  const def = BLOCK_DEFINITIONS.find((b) => b.type === type);
  if (!def) throw new Error(`Unknown block type: ${type}`);
  return def;
}
