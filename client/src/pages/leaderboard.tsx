import { Crown, Medal, Star, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockLeaderboard, mockUser } from "@/data/mock-data";

const topThreeColors = ["gold", "gray-300", "orange-400"];
const podiumHeights = ["py-10", "py-8", "py-6"];

export default function Leaderboard() {
  const topThree = mockLeaderboard.slice(0, 3);
  const others = mockLeaderboard.slice(3);
  const userRank = mockLeaderboard.find(user => user.id === mockUser.id);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-gold to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="text-navy" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-navy mb-2">Bảng Xếp Hạng</h1>
          <p className="text-gray-600">Top học sinh xuất sắc nhất tuần này</p>
        </div>

        {/* Time Period Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-lg p-1 flex">
            <Button className="px-6 py-2 bg-teal text-white rounded-lg">Tuần này</Button>
            <Button variant="ghost" className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              Tháng này
            </Button>
            <Button variant="ghost" className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              Tất cả
            </Button>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="flex justify-center items-end space-x-4 mb-12">
          {[1, 0, 2].map((index) => {
            const user = topThree[index];
            if (!user) return null;
            
            const isFirst = user.rank === 1;
            const podiumColor = topThreeColors[user.rank - 1];
            const avatarSize = isFirst ? "w-24 h-24" : "w-20 h-20";
            
            return (
              <div key={user.id} className="text-center">
                <div className={`${avatarSize} bg-${podiumColor} rounded-full mx-auto mb-3 flex items-center justify-center relative`}>
                  <span className="text-white font-bold text-xl">{user.initials}</span>
                  {isFirst && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Crown className="text-yellow-600" size={16} />
                    </div>
                  )}
                </div>
                <div className={`bg-${podiumColor} px-4 ${podiumHeights[user.rank - 1]} rounded-t-lg`}>
                  <div className={`text-3xl font-bold mb-1 ${
                    isFirst ? 'text-navy' : user.rank === 2 ? 'text-gray-600' : 'text-orange-700'
                  }`}>
                    {user.rank}
                  </div>
                  <div className={`font-semibold ${
                    isFirst ? 'text-navy' : user.rank === 2 ? 'text-gray-800' : 'text-orange-800'
                  }`}>
                    {user.name}
                  </div>
                  <div className={`text-sm ${
                    isFirst ? 'text-navy/80' : user.rank === 2 ? 'text-gray-600' : 'text-orange-700'
                  }`}>
                    {user.points.toLocaleString()} điểm
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Rankings */}
        <Card className="shadow-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h3 className="font-bold text-navy">Bảng xếp hạng chi tiết</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {/* Current User */}
            {userRank && (
              <div className="px-6 py-4 bg-teal/5 border-l-4 border-teal">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-teal rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {userRank.rank}
                    </div>
                    <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center">
                      <span className="text-navy font-semibold">{userRank.initials}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-navy">{userRank.name} (Bạn)</div>
                      <div className="text-sm text-gray-600">{userRank.grade} • Toán học</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-teal">{userRank.points.toLocaleString()} điểm</div>
                    <div className="text-sm text-gray-600">{userRank.lessonsCompleted} bài hoàn thành</div>
                  </div>
                </div>
              </div>
            )}

            {/* Other Rankings */}
            {others.map((user) => {
              if (user.id === mockUser.id) return null; // Skip user's own ranking
              
              const avatarColors = ['blue-400', 'pink-400', 'green-400', 'purple-400'];
              const colorIndex = (user.rank - 4) % avatarColors.length;
              
              return (
                <div key={user.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm">
                        {user.rank}
                      </div>
                      <div className={`w-10 h-10 bg-${avatarColors[colorIndex]} rounded-full flex items-center justify-center`}>
                        <span className="text-white font-semibold">{user.initials}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-navy">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.grade} • Toán học</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-navy">{user.points.toLocaleString()} điểm</div>
                      <div className="text-sm text-gray-600">{user.lessonsCompleted} bài hoàn thành</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Achievement Progress */}
        <Card className="shadow-lg mt-8">
          <CardContent className="p-6">
            <h3 className="font-bold text-navy mb-4">Thành tích cần chinh phục</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Medal className="text-gold" size={20} />
                </div>
                <div className="font-semibold text-sm">Top 5</div>
                <div className="text-xs text-gray-600">Cần thêm 200 điểm</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Flame className="text-purple-600" size={20} />
                </div>
                <div className="font-semibold text-sm">Chuỗi 10 ngày</div>
                <div className="text-xs text-gray-600">Còn 3 ngày nữa</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="text-blue-600" size={20} />
                </div>
                <div className="font-semibold text-sm">Học giả</div>
                <div className="text-xs text-gray-600">Hoàn thành 50 bài</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
