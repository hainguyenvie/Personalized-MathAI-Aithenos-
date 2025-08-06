import { mockKnowledgeMap } from "@/data/mock-data";

export default function KnowledgeMap() {
  const getColorForStrength = (strength: string) => {
    switch (strength) {
      case "strong": return "bg-green-400";
      case "medium": return "bg-yellow-400";  
      case "weak": return "bg-red-400";
      case "current": return "bg-teal";
      case "locked": return "bg-gray-300";
      default: return "bg-gray-300";
    }
  };

  const getTextColorForStrength = (strength: string) => {
    switch (strength) {
      case "locked": return "text-gray-600";
      default: return "text-white";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="font-bold text-navy mb-4">Bản đồ tri thức</h3>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {mockKnowledgeMap.map((topic) => (
          <div
            key={topic.id}
            className={`aspect-square ${getColorForStrength(topic.strength)} rounded-lg flex items-center justify-center ${getTextColorForStrength(topic.strength)} text-sm font-medium transition-all duration-300 hover:scale-105 cursor-pointer`}
            title={topic.name}
          >
            {topic.id}
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500 mb-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-400 rounded"></div>
            <span>Vững</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-400 rounded"></div>
            <span>Yếu</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-400 rounded"></div>
            <span>Lỗ hổng</span>
          </div>
        </div>
      </div>
      <button className="w-full text-teal font-semibold text-sm hover:underline">
        Xem chi tiết →
      </button>
    </div>
  );
}
