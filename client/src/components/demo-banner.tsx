import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function DemoBanner() {
  const [resetting, setResetting] = useState(false);
  const [done, setDone] = useState(false);

  const resetDemo = async () => {
    try {
      setResetting(true);
      await fetch('/api/demo/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'sample-user-1' })
      });
      localStorage.removeItem('onboarding');
      setDone(true);
      setTimeout(() => window.location.reload(), 500);
    } catch (e) {
      window.location.href = '/onboarding';
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
        <div>
          <span className="font-semibold">Demo Mode</span>
          <span className="opacity-90 ml-2">Thử nhanh toàn bộ tính năng với dữ liệu mẫu.</span>
        </div>
        <div className="flex items-center gap-2">
          {done && <span className="text-white/90">Đã reset ✓</span>}
          <Button size="sm" className="bg-white text-purple-700 hover:bg-white/90" onClick={resetDemo} disabled={resetting}>
            {resetting ? 'Đang reset...' : 'Reset demo'}
          </Button>
        </div>
      </div>
    </div>
  );
}



