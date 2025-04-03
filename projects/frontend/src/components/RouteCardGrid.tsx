"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon, ArrowLeft } from "lucide-react";

// Define the route interface
export interface Route {
  path: string;
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
}

interface RouteCardGridProps {
  routes: Route[];
  maxWidth?: string;
}

export default function RouteCardGrid({
  routes,
  maxWidth = "max-w-md",
}: RouteCardGridProps) {
  return (
    <div className="flex justify-center w-full">
      <div
        className="self-center mr-4 cursor-pointer transform transition-all duration-200 hover:scale-110 hover:shadow-lg rounded-full p-2"
        onClick={() => (window.location.href = "/")}
        data-cy="back-arrow"
      >
        <ArrowLeft size={96} />
      </div>
      <div className={`flex flex-col w-full ${maxWidth}`}>
        {routes.map((route) => (
          <RouteCard key={route.path} route={route} />
        ))}
      </div>
    </div>
  );
}

// Separate component for each route card
function RouteCard({ route }: { route: Route }) {
  const { path, label, icon: Icon, onClick } = route;
  const dataCy = `${label.toLowerCase().replace(/\s+/g, "-")}-card`;

  const cardContent = (
    <Card
      className="hover:bg-gray-100 transform hover:shadow-md"
      onClick={onClick}
      data-cy={dataCy}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-center">{label}</CardTitle>
        <Icon className="h-8 w-8" />
      </CardHeader>
    </Card>
  );

  return onClick ? (
    <div className="m-10">{cardContent}</div>
  ) : (
    <Link href={path} className="m-10">
      {cardContent}
    </Link>
  );
}
