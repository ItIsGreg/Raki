"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSettings } from "@/contexts/SettingsContext";

export interface NavRoute {
  path: string;
  label: string;
}

interface NavbarProps {
  routes: NavRoute[];
}

export default function Navbar({ routes }: NavbarProps) {
  const { setIsSettingsOpen } = useSettings();
  const currentPathname = usePathname();

  return (
    <div className="navbar" data-cy="navbar">
      <Card>
        <CardContent className="flex flex-row gap-2">
          <div className="flex-grow"></div>
          {routes.map(({ path, label }) => (
            <Link key={path} href={path}>
              <Button
                data-cy={`nav-${label.toLowerCase().replace(" ", "-")}-button`}
                disabled={currentPathname === path}
              >
                {label}
              </Button>
            </Link>
          ))}
          <Button
            data-cy="nav-setup-button"
            onClick={() => setIsSettingsOpen(true)}
          >
            Setup
          </Button>
          <div className="flex-grow"></div>
        </CardContent>
      </Card>
    </div>
  );
}
