"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TasksPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/projekty");
  }, [router]);

  return (
    <main className="dashboard-shell py-6">
      <div className="panel p-6 text-lg text-textMuted">Przekierowanie do projektów...</div>
    </main>
  );
}
