"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

const Back = () => {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/dashboard") return;
  return (
    <div
      onClick={() => router.back()}
      className="px-2 py-1 bg-gray-200 cursor-pointer inline-flex text-xs items-center capitalize rounded-xl space-x-1"
    >
      <ArrowLeft className="w-3 h-3 text-primary" />
      <span>back</span>
    </div>
  );
};

export default Back;
