export type ContentStatus = "draft" | "published";

export type About = {
  id: string;
  name: string;
  role: string;
  location: string;
  bio: string;
  profile_image_path: string | null;
  availability_status: string;
  email: string;
  updated_at: string;
};

export type SiteSettings = {
  id: string;
  site_title: string;
  site_description: string;
  default_og_image_path: string | null;
  updated_at: string;
};

export type SocialLinks = {
  id: string;
  email: string;
  linkedin_url: string | null;
  x_url: string | null;
  other_links: { label: string; url: string }[];
  updated_at: string;
};

export type Skill = {
  id: string;
  label: string;
  display_order: number;
  created_at: string;
};

export type ToolTag = {
  id: string;
  label: string;
  display_order: number;
  created_at: string;
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  start_date: string | null;
  end_date: string | null;
  description: string;
  display_order: number;
  created_at: string;
};

export type Media = {
  id: string;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  alt_text: string | null;
  kind: "image" | "video";
  created_at: string;
};

export type Project = {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  long_description: string;
  category: string | null;
  year: number | null;
  role: string | null;
  tools: string[];
  thumbnail_media_id: string | null;
  hero_media_id: string | null;
  project_url: string | null;
  featured: boolean;
  status: ContentStatus;
  display_order: number;
  seo_title: string | null;
  seo_description: string | null;
  seo_og_media_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectGalleryImage = {
  id: string;
  project_id: string;
  media_id: string;
  display_order: number;
};

export type CaseStudyBlockType =
  | "heading"
  | "paragraph"
  | "image"
  | "image_gallery"
  | "video"
  | "quote"
  | "statistics"
  | "process"
  | "timeline"
  | "feature"
  | "before_after"
  | "design_decision"
  | "text_image"
  | "full_width_image"
  | "two_column";

export type CaseStudy = {
  id: string;
  project_id: string | null;
  title: string;
  slug: string;
  summary: string;
  cover_media_id: string | null;
  status: ContentStatus;
  seo_title: string | null;
  seo_description: string | null;
  seo_og_media_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CaseStudySection = {
  id: string;
  case_study_id: string;
  block_type: CaseStudyBlockType;
  data: Record<string, unknown>;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type UiShot = {
  id: string;
  title: string;
  description: string;
  project_id: string | null;
  media_id: string | null;
  tags: string[];
  featured: boolean;
  status: ContentStatus;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type UseCase = {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  problem: string;
  solution: string;
  related_project_id: string | null;
  tags: string[];
  status: ContentStatus;
  display_order: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
};

export type UseCaseImage = {
  id: string;
  use_case_id: string;
  media_id: string;
  display_order: number;
};

export type ActivityLogEntry = {
  id: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string;
};

// Minimal `Database` shape so `createBrowserClient<Database>` /
// `createServerClient<Database>` type-check. Extend per-table `Row`
// generics further if you want full Insert/Update inference from
// Supabase's generator later (`supabase gen types typescript`).
export type Database = {
  public: {
    Tables: {
      about: { Row: About; Insert: Partial<About>; Update: Partial<About>; Relationships: [] };
      site_settings: { Row: SiteSettings; Insert: Partial<SiteSettings>; Update: Partial<SiteSettings>; Relationships: [] };
      social_links: { Row: SocialLinks; Insert: Partial<SocialLinks>; Update: Partial<SocialLinks>; Relationships: [] };
      skills: { Row: Skill; Insert: Partial<Skill>; Update: Partial<Skill>; Relationships: [] };
      tools: { Row: ToolTag; Insert: Partial<ToolTag>; Update: Partial<ToolTag>; Relationships: [] };
      experience: { Row: Experience; Insert: Partial<Experience>; Update: Partial<Experience>; Relationships: [] };
      media: { Row: Media; Insert: Partial<Media>; Update: Partial<Media>; Relationships: [] };
      projects: { Row: Project; Insert: Partial<Project>; Update: Partial<Project>; Relationships: [] };
      project_gallery_images: { Row: ProjectGalleryImage; Insert: Partial<ProjectGalleryImage>; Update: Partial<ProjectGalleryImage>; Relationships: [] };
      case_studies: { Row: CaseStudy; Insert: Partial<CaseStudy>; Update: Partial<CaseStudy>; Relationships: [] };
      case_study_sections: { Row: CaseStudySection; Insert: Partial<CaseStudySection>; Update: Partial<CaseStudySection>; Relationships: [] };
      ui_shots: { Row: UiShot; Insert: Partial<UiShot>; Update: Partial<UiShot>; Relationships: [] };
      use_cases: { Row: UseCase; Insert: Partial<UseCase>; Update: Partial<UseCase>; Relationships: [] };
      use_case_images: { Row: UseCaseImage; Insert: Partial<UseCaseImage>; Update: Partial<UseCaseImage>; Relationships: [] };
      activity_log: { Row: ActivityLogEntry; Insert: Partial<ActivityLogEntry>; Update: Partial<ActivityLogEntry>; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
