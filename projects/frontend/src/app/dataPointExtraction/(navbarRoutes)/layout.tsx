"use client";

import Navbar, { NavRoute } from "@/components/Navbar";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const routes: NavRoute[] = [
    { path: "/", label: "Task Selection" },
    { path: "/dataPointExtraction", label: "Home" },
    { path: "/dataPointExtraction/profiles", label: "Profiles" },
    { path: "/dataPointExtraction/datasets", label: "Datasets" },
    // { path: "/dataPointExtraction/aiAnnotation", label: "AI-Annotation" },
    { path: "/dataPointExtraction/annotation", label: "Annotation" },
  ];

  return (
    <div className="h-full overflow-hidden pb-10">
      <Navbar routes={routes} />
      {children}
    </div>
  );
}
