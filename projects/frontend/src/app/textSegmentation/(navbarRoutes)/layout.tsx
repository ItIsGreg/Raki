"use client";

import Navbar, { NavRoute } from "@/components/Navbar";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const routes: NavRoute[] = [
    { path: "/", label: "Home" },
    { path: "/textSegmentation/profiles", label: "Profiles" },
    { path: "/textSegmentation/datasets", label: "Datasets" },
    { path: "/textSegmentation/aiAnnotation", label: "AI-Annotation" },
    { path: "/textSegmentation/annotation", label: "Manual Annotation" },
  ];

  return (
    <div className="h-full overflow-hidden pb-10">
      <Navbar routes={routes} />
      {children}
    </div>
  );
}
