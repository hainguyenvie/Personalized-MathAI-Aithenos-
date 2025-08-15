import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function UnitQuiz() {
  const [topic, setTopic] = useState<string>("linear-function");
  const [qs, setQs] = useState<any[]>([]);
  const [i, setI] = useState(0);
  const [ans, setAns] = useState("");
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/questions/math?topic=${encodeURIComponent(topic)}`);
        const data = await res.json();
        const norm = (Array.isArray(data) ? data : []).slice(0, 6).map((q: any) => ({
          ...q,
          options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]'),
        }));
        setQs(norm);
        setI(0);
        setAns("");
        setCorrect(0);
        setDone(false);
      } catch {}
    };
    load();
  }, [topic]);

  const submit = () => {
    if (!qs[i]) return;
    const ok = ans === qs[i].correctAnswer;
    if (ok) setCorrect((c) => c + 1);
    if (i < qs.length - 1) {
      setI(i + 1);
      setAns("");
    } else {
      setDone(true);
    }
  };

  const score = qs.length ? Math.round((correct / qs.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-navy">Unit Quiz</h1>
              <select className="border rounded px-3 h-10" value={topic} onChange={(e) => setTopic(e.target.value)}>
                <option value="linear-function">Hàm số bậc nhất</option>
                <option value="quadratic-function">Hàm số bậc hai</option>
                <option value="linear-equation">Phương trình bậc nhất</option>
              </select>
            </div>

            {!done && qs[i] && (
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="text-sm text-gray-600 mb-2">Câu {i + 1} / {qs.length}</div>
                <h3 className="text-lg font-semibold text-navy mb-4">{qs[i].question}</h3>
                <RadioGroup value={ans} onValueChange={setAns}>
                  <div className="space-y-3">
                    {qs[i].options.map((opt: string, idx: number) => (
                      <div key={idx} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-white transition-colors">
                        <RadioGroupItem value={opt} id={`uq-${idx}`} className="text-teal" />
                        <Label htmlFor={`uq-${idx}`} className="cursor-pointer flex-1">{String.fromCharCode(65 + idx)}. {opt}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
                <Button className="mt-4 bg-teal" disabled={!ans} onClick={submit}>Xác nhận</Button>
              </div>
            )}

            {done && (
              <div className="text-center py-12">
                <div className="text-5xl font-bold text-teal mb-4">{score}%</div>
                <p className="text-gray-700 mb-6">Bạn đã hoàn thành bài kiểm tra đơn vị. {score >= 80 ? 'Đạt chuẩn thành thạo.' : 'Cần luyện tập thêm.'}</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setTopic(topic)}>Làm lại</Button>
                  <Button variant="outline" onClick={() => (window.location.href = '/learning')}>Quay lại lộ trình</Button>
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}



