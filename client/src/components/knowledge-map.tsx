import { mockKnowledgeMap } from "@/data/mock-data";

interface KnowledgeMapProps {
  knowledgeMap?: any;
}

export default function KnowledgeMap({ knowledgeMap }: KnowledgeMapProps = {}) {
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

  const dataSource = knowledgeMap ? Object.entries(knowledgeMap) : mockKnowledgeMap.map(t => [t.id, t]);
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="font-bold text-navy mb-4">Bản đồ tri thức</h3>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {dataSource.map(([key, data]: any) => {
          const topicData = knowledgeMap ? data : data;
          const strength = knowledgeMap 
            ? (topicData.score >= 80 ? "strong" : topicData.score >= 60 ? "medium" : "weak")
            : topicData.strength;
          const displayName = knowledgeMap ? key.slice(0, 3).toUpperCase() : topicData.id;
          const title = knowledgeMap ? `${key}: ${topicData.level} (${topicData.score}%)` : topicData.name;
          
          return (
            <div
              key={key}
              className={`aspect-square ${getColorForStrength(strength)} rounded-lg flex items-center justify-center ${getTextColorForStrength(strength)} text-sm font-medium transition-all duration-300 hover:scale-105 cursor-pointer`}
              title={title}
            >
              {displayName}
            </div>
          );
        })}
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
