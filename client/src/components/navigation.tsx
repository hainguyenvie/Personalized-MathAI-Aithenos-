import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Crown, Home, ClipboardCheck, PlayCircle, Trophy, Medal, Coins } from "lucide-react";
import { mockUser } from "@/data/mock-data";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Trang chủ", icon: Home, view: "dashboard" },
    { path: "/assessment", label: "Đánh giá", icon: ClipboardCheck, view: "assessment" },
    { path: "/learning", label: "Học tập", icon: PlayCircle, view: "learning" },
    { path: "/gameshow", label: "Game Show", icon: Trophy, view: "gameshow" },
    { path: "/leaderboard", label: "Xếp hạng", icon: Medal, view: "leaderboard" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-navy text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src="/logo.svg" alt="Aithenos Logo" className="h-8 w-auto" />
            </div>
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link 
                  key={item.path}
                  href={item.path}
                  className={`hover:text-white transition-colors cursor-pointer ${
                    isActive(item.path) ? 'text-white font-semibold' : 'text-white/80'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-teal/20 px-3 py-1 rounded-full">
                <Coins className="text-gold" size={16} />
                <span className="text-gold font-semibold">{mockUser.points.toLocaleString()}</span>
              </div>
              <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
                <span className="text-navy font-semibold text-sm">{mockUser.fullName.split(' ').map(n => n[0]).join('')}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden bg-navy/90 backdrop-blur-sm">
          <div className="flex justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link 
                  key={item.path}
                  href={item.path}
                  className={`flex flex-col items-center space-y-1 p-2 rounded cursor-pointer transition-colors ${
                    isActive(item.path) ? 'text-white bg-white/10' : 'text-white/80 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
