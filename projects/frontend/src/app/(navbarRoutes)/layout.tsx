import Navbar from "./Navbar";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-full overflow-hidden">
      <Navbar />
      {children}
    </div>
  );
}
