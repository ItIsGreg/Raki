"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const currentPathname = usePathname();

  const routes = [
    { path: "/annotation", label: "Annotation" },
    { path: "/profiles", label: "Profiles" },
    { path: "/datasets", label: "Datasets" },
    { path: "/llmAnnotation", label: "LLM Annotation" },
  ];

  return (
    <div className="navbar">
      <Card>
        <CardContent className="flex flex-row gap-2">
          {routes.map(({ path, label }) => (
            <Link key={path} href={path}>
              <Button disabled={currentPathname === path}>{label}</Button>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Navbar;
