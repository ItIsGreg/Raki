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
    { path: "/dataPointExtraction/datasets", label: "Datasets" },
    // { path: "/dataPointExtraction/aiAnnotation", label: "AI-Annotation" },
    { path: "/dataPointExtraction/annotation", label: "Annotation" },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar routes={routes} />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
