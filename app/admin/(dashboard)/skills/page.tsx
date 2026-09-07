import { createClient } from "@/lib/supabase/server";
import { LabelListEditor } from "@/components/admin/LabelListEditor";
import {
  addSkill,
  renameSkill,
  deleteSkill,
  reorderSkills,
  addTool,
  renameTool,
  deleteTool,
  reorderTools,
} from "./actions";

export default async function SkillsPage() {
  const supabase = await createClient();
  const [{ data: skills }, { data: tools }] = await Promise.all([
    supabase.from("skills").select("*").order("display_order"),
    supabase.from("tools").select("*").order("display_order"),
  ]);

  return (
    <div className="max-w-lg space-y-10">
      <div>
        <h1 className="font-display text-2xl text-ink">Skills</h1>
        <p className="mt-1 text-sm text-ink-soft">Shown on the About section, in this order.</p>
        <div className="mt-4">
          <LabelListEditor
            items={skills ?? []}
            placeholder="Add a skill…"
            onAdd={addSkill}
            onRename={renameSkill}
            onDelete={deleteSkill}
            onReorder={reorderSkills}
          />
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl text-ink">Tools</h2>
        <p className="mt-1 text-sm text-ink-soft">Also shown on the About section.</p>
        <div className="mt-4">
          <LabelListEditor
            items={tools ?? []}
            placeholder="Add a tool…"
            onAdd={addTool}
            onRename={renameTool}
            onDelete={deleteTool}
            onReorder={reorderTools}
          />
        </div>
      </div>
    </div>
  );
}
