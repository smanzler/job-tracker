"use client";

import { Button } from "./ui/button";
import Link from "next/link";

interface MenuItem {
  title: string;
  links: {
    text: string;
    url: string;
  }[];
}

interface FooterProps {
  tagline?: string;
  menuItems?: MenuItem[];
  copyright?: string;
}

const Footer = ({
  tagline = "Job Search Dashboard",
  menuItems = [
    {
      title: "Dashboard",
      links: [{ text: "Home", url: "/" }],
    },
  ],
  copyright = `© ${new Date().getFullYear()} Simon Manzler. All rights reserved.`,
}: FooterProps) => {
  return (
    <section className="py-32 px-6">
      <footer>
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-6">
          <div className="col-span-2 mb-8 lg:mb-0">
            <p className="font-bold">{tagline}</p>
          </div>

          <div className="col-span-1 lg:col-span-3" />

          {menuItems.map((section, sectionIdx) => (
            <div key={sectionIdx} className="lg:text-right">
              <h3 className="mb-4 font-bold">{section.title}</h3>
              <ul className="space-y-4">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Button
                      className="p-0 h-auto text-muted-foreground hover:text-primary font-medium"
                      variant="link"
                      asChild
                    >
                      <Link href={link.url}>{link.text}</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-muted-foreground mt-24 flex flex-col justify-between gap-4 border-t pt-8 text-sm font-medium md:flex-row md:items-center">
          <p>{copyright}</p>
          <ul className="flex gap-4">
            <li className="hover:text-primary underline">
              <Link href="/">Home</Link>
            </li>
          </ul>
        </div>
      </footer>
    </section>
  );
};

export { Footer };
