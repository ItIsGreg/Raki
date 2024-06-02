import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Link href={"/annotation"}>Annotation</Link>
      <Link href={"/profiles"}>Profiles</Link>
      <Link href={"/datasets"}>Datasets</Link>
    </div>
  );
}
