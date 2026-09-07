import type { SocialLinks } from "@/types/database";

export function Footer({ socialLinks }: { socialLinks: SocialLinks | null }) {
  return (
    <footer id="contact" className="mt-24 border-t border-line">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-ink-soft">
            Let&rsquo;s work together —{" "}
            {socialLinks?.email ? (
              <a href={`mailto:${socialLinks.email}`} className="text-accent hover:underline">
                {socialLinks.email}
              </a>
            ) : (
              "get in touch"
            )}
          </p>
          <div className="flex gap-4 text-sm text-ink-soft">
            {socialLinks?.linkedin_url && (
              <a href={socialLinks.linkedin_url} target="_blank" rel="noreferrer" className="hover:text-ink">
                LinkedIn
              </a>
            )}
            {socialLinks?.x_url && (
              <a href={socialLinks.x_url} target="_blank" rel="noreferrer" className="hover:text-ink">
                X
              </a>
            )}
            {socialLinks?.other_links?.map((link) => (
              <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="hover:text-ink">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
