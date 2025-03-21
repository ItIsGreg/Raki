"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSettings } from "@/contexts/SettingsContext";

export default function Navbar() {
  const { setIsSettingsOpen } = useSettings();
  const currentPathname = usePathname();

  const routes = [
    { path: "/", label: "Home" },
    { path: "/profiles", label: "Profiles" },
    { path: "/datasets", label: "Datasets" },
    { path: "/aiAnnotation", label: "AI-Annotation" },
    { path: "/annotation", label: "Manual Annotation" },
  ];

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
