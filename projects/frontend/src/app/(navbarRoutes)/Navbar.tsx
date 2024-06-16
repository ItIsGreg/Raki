"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const currentPathname = usePathname();

  const routes = [
    { path: "/", label: "Home" },
    { path: "/profiles", label: "Profiles" },
    { path: "/datasets", label: "Datasets" },
    { path: "/aiAnnotation", label: "AI-Annotation" },
    { path: "/annotation", label: "Manual Annotation" },
  ];

  return (
    <div className="navbar">
      <Card>
        <CardContent className="flex flex-row gap-2">
          <div className="flex-grow"></div>
          {routes.map(({ path, label }) => (
            <Link key={path} href={path}>
              <Button disabled={currentPathname === path}>{label}</Button>
            </Link>
          ))}
          <div className="flex-grow"></div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Navbar;
