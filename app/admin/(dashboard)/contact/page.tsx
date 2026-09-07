import { createClient } from "@/lib/supabase/server";
import { ContactForm } from "./ContactForm";

export default async function ContactPage() {
  const supabase = await createClient();
  const { data: socialLinks } = await supabase.from("social_links").select("*").limit(1).single();

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Contact</h1>
      <p className="mt-1 text-sm text-ink-soft">
        The public contact section uses these values automatically.
      </p>
      <div className="mt-6">
        <ContactForm socialLinks={socialLinks!} />
      </div>
    </div>
  );
}
