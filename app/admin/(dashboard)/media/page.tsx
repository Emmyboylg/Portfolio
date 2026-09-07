import { MediaLibraryGrid } from "@/components/admin/MediaLibraryGrid";

export default function MediaLibraryPage() {
  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-2xl text-ink">Media library</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Upload once, reuse everywhere — projects, case studies, and UI shots
        all reference files from here.
      </p>
      <div className="mt-6">
        <MediaLibraryGrid />
      </div>
    </div>
  );
}
