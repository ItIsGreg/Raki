"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const Links = {
    Profiles: "/profiles",
    Datasets: "/datasets",
    "AI-Annotation": "/aiAnnotation",
    "Manual Annotation": "/annotation",
  };

  return (
    <div className="grid grid-cols-3">
      <div></div>
      <div className="flex flex-col">
        {/* <div className="flex-grow"></div> */}
        {Object.entries(Links).map(([key, value]) => {
          return (
            <Link key={key} href={value} className="m-10">
              <Card className=" hover:bg-gray-100 transform hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-center">{key}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
      <div></div>
    </div>
  );
}
