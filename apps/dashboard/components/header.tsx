"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { AuthButton } from "@/components/auth-button";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full px-6 py-4 flex justify-between items-center bg-background border-b">
      <NavigationMenu>
        <NavigationMenuList className="flex-wrap">
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link className={navigationMenuTriggerStyle()} href="/">
                Home
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="flex items-center gap-2">
        <AuthButton />
        <ModeToggle />
      </div>
    </header>
  );
}
