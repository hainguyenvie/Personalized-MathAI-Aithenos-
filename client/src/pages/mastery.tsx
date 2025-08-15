import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const pool = [
  "basic-arithmetic",
  "linear-equation",
  "linear-function",
  "quadratic-function",
  "system-equations",
  "geometry",
];

function pickMixed(n: number) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export default function Mastery() {
  const [topics, setTopics] = useState<string[]>(pickMixed(3));
  const [qs, setQs] = useState<any[]>([]);
  const [i, setI] = useState(0);
  const [ans, setAns] = useState("");
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const all: any[] = [];
        for (const t of topics) {
          const res = await fetch(`/api/questions/math?topic=${encodeURIComponent(t)}`);
          const data = await res.json();
          const one = (Array.isArray(data) ? data : [])[0];
          if (one) {
            all.push({
              ...one,
              options: Array.isArray(one.options) ? one.options : JSON.parse(one.options || '[]'),
            });
          }
        }
        setQs(all);
        setI(0);
        setAns("");
        setCorrect(0);
        setDone(false);
      } catch {}
    };
    load();
  }, [topics]);

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
              <h1 className="text-2xl font-bold text-navy">Mastery Challenge</h1>
              <Button variant="outline" onClick={() => setTopics(pickMixed(3))}>Đổi đề</Button>
            </div>

            {!done && qs[i] && (
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="text-sm text-gray-600 mb-2">Câu {i + 1} / {qs.length}</div>
                <h3 className="text-lg font-semibold text-navy mb-4">{qs[i].question}</h3>
                <RadioGroup value={ans} onValueChange={setAns}>
                  <div className="space-y-3">
                    {qs[i].options.map((opt: string, idx: number) => (
                      <div key={idx} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-white transition-colors">
                        <RadioGroupItem value={opt} id={`m-${idx}`} className="text-teal" />
                        <Label htmlFor={`m-${idx}`} className="cursor-pointer flex-1">{String.fromCharCode(65 + idx)}. {opt}</Label>
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
                <p className="text-gray-700 mb-6">{score >= 80 ? 'Giữ vững phong độ! Kỹ năng đã bền vững.' : 'Hãy luyện tập thêm các kỹ năng gần đây để củng cố.'}</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setTopics(pickMixed(3))}>Làm thử thách khác</Button>
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



