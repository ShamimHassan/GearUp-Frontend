import Link from "next/link";
import { cn } from "@/lib/utils";

function SocialIcon({ label, children, href }: { label: string; href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all",
        "hover:border-emerald-200 hover:text-emerald-700 hover:-translate-y-0.5 hover:shadow"
      )}
    >
      {children}
    </a>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "Careers", href: "/careers" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "/help" },
        { label: "FAQs", href: "/faqs" },
        { label: "Safety", href: "/safety" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms of Service", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Cookie Policy", href: "/cookies" },
      ],
    },
  ];

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900"
            >
              <span aria-hidden="true">GearUp 🏋️</span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-slate-500">
              Rent premium sports and outdoor gear from trusted local providers.
              Adventure awaits — no purchase required.
            </p>
            <div className="flex items-center gap-2.5 pt-2">
              <SocialIcon href="https://facebook.com" label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
                  <path fillRule="evenodd" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95Z" clipRule="evenodd" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://instagram.com" label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
                  <path d="M16.5 8a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1Z" />
                  <path fillRule="evenodd" d="M14.5 3h-5A6.5 6.5 0 0 0 3 9.5v5A6.5 6.5 0 0 0 9.5 21h5a6.5 6.5 0 0 0 6.5-6.5v-5A6.5 6.5 0 0 0 14.5 3Zm1.4 3.4a.8.8 0 1 1-1.6 0 .8.8 0 0 1 1.6 0ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-5 3a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z" clipRule="evenodd" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://twitter.com" label="Twitter / X">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
                  <path d="M18.244 2H21.5l-7.5 8.57L22.5 22h-6.828l-5.356-6.996L4.21 22H.955l8.02-9.166L1.5 2h6.914l4.844 6.386L18.244 2Zm-1.195 18h1.889L7.07 4H5.085l11.964 16Z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://youtube.com" label="YouTube">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
                  <path fillRule="evenodd" d="M21.582 7.096a3 3 0 0 0-2.108-2.111C17.648 4.5 12 4.5 12 4.5s-5.648 0-7.474.485A3 3 0 0 0 2.418 7.1 31 31 0 0 0 1.94 12 31 31 0 0 0 2.42 16.904a3 3 0 0 0 2.108 2.111C6.352 19.5 12 19.5 12 19.5s5.648 0 7.474-.485a3 3 0 0 0 2.108-2.111 31 31 0 0 0 .477-4.904 31 31 0 0 0-.476-4.904ZM9.75 15V9l5.2 3-5.2 3Z" clipRule="evenodd" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://linkedin.com" label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
                  <path fillRule="evenodd" d="M4 3a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4Zm3.5 7.25v7.25h-2v-7.25h2Zm-1-2.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm5.25 2.75v7.25h-2V13c0-1.325-.475-2.05-1.6-2.05-.9 0-1.4.575-1.65 1.15-.1.225-.1.55-.1.9v4.5h-2v-7.25h2v.95c.375-.7 1.225-1.7 3-1.7 2.1 0 3.35 1.3 3.35 4.05v3.95h-2V13c0-.95-.125-1.7-.775-2.3-.575-.525-1.325-.775-2.225-.775Z" clipRule="evenodd" />
                </svg>
              </SocialIcon>
            </div>
          </div>

          {footerLinks.map((col) => (
            <div key={col.title} className="space-y-4">
              <h3 className="text-sm font-semibold tracking-wide text-slate-900">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-emerald-700 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col-reverse items-start justify-between gap-4 border-t border-slate-200 py-6 sm:flex-row sm:items-center">
          <p className="text-xs text-slate-500">
            © {currentYear} GearUp Rental Inc. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <Link href="/terms" className="hover:text-emerald-700 transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-emerald-700 transition-colors">
              Privacy
            </Link>
            <Link href="/cookies" className="hover:text-emerald-700 transition-colors">
              Cookies
            </Link>
            <a href="mailto:support@gearup.com" className="hover:text-emerald-700 transition-colors">
              support@gearup.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
