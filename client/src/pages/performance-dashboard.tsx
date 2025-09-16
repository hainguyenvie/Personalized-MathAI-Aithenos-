import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Clock, 
  Database, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';

interface PerformanceMetrics {
  timestamp: string;
  sessions: {
    active: number;
    total: number;
  };
  cache: {
    bundleCache: number;
    reviewCache: number;
    aiCache: {
      size: number;
      hitRate: number;
    };
  };
  database: {
    loaded: boolean;
    totalQuestions: number;
    validQuestions: number;
  };
  responseTimes: {
    bundleGeneration: number;
    reviewGeneration: number;
    stateTransition: number;
  };
  errors: {
    count: number;
    lastError?: string;
  };
}

interface PerformanceSummary {
  current: PerformanceMetrics;
  trends: {
    averageResponseTime: number;
    errorRate: number;
    cacheHitRate: number;
  };
  recommendations: string[];
}

export default function PerformanceDashboard() {
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/performance/summary');
      const data = await response.json();
      
      if (data.success) {
        setSummary(data.summary);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch performance data');
      }
    } catch (err) {
      setError('Failed to connect to performance API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPerformanceData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'critical': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading && !summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg">Loading performance data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={fetchPerformanceData} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const { current, trends, recommendations } = summary;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
            <Button onClick={fetchPerformanceData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">System Status</p>
                  <p className="text-2xl font-bold text-green-600">Healthy</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Sessions</p>
                  <p className="text-2xl font-bold text-blue-600">{current.sessions.active}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cache Hit Rate</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(trends.cacheHitRate * 100).toFixed(1)}%
                  </p>
                </div>
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {trends.averageResponseTime.toFixed(0)}ms
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Response Times */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Response Times
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Bundle Generation</span>
                  <span className="text-sm text-gray-600">{current.responseTimes.bundleGeneration}ms</span>
                </div>
                <Progress 
                  value={Math.min((current.responseTimes.bundleGeneration / 2000) * 100, 100)} 
                  className="h-2"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Review Generation</span>
                  <span className="text-sm text-gray-600">{current.responseTimes.reviewGeneration}ms</span>
                </div>
                <Progress 
                  value={Math.min((current.responseTimes.reviewGeneration / 3000) * 100, 100)} 
                  className="h-2"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">State Transition</span>
                  <span className="text-sm text-gray-600">{current.responseTimes.stateTransition}ms</span>
                </div>
                <Progress 
                  value={Math.min((current.responseTimes.stateTransition / 1000) * 100, 100)} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Cache Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Cache Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Bundle Cache</span>
                <Badge variant="outline">{current.cache.bundleCache} items</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Review Cache</span>
                <Badge variant="outline">{current.cache.reviewCache} items</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">AI Cache</span>
                <Badge variant="outline">{current.cache.aiCache.size} items</Badge>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Cache Hit Rate</span>
                  <span className="text-sm text-gray-600">{(current.cache.aiCache.hitRate * 100).toFixed(1)}%</span>
                </div>
                <Progress value={current.cache.aiCache.hitRate * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Database Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Database Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant={current.database.loaded ? "default" : "destructive"}>
                  {current.database.loaded ? "Loaded" : "Not Loaded"}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Questions</span>
                <span className="text-sm text-gray-600">{current.database.totalQuestions.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Valid Questions</span>
                <span className="text-sm text-gray-600">{current.database.validQuestions.toLocaleString()}</span>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Data Quality</span>
                  <span className="text-sm text-gray-600">
                    {((current.database.validQuestions / current.database.totalQuestions) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={(current.database.validQuestions / current.database.totalQuestions) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Error Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Error Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Error Count</span>
                <Badge variant={current.errors.count > 0 ? "destructive" : "default"}>
                  {current.errors.count}
                </Badge>
              </div>
              
              {current.errors.lastError && (
                <div>
                  <span className="text-sm font-medium">Last Error</span>
                  <p className="text-xs text-gray-600 mt-1 bg-red-50 p-2 rounded">
                    {current.errors.lastError}
                  </p>
                </div>
              )}
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Error Rate</span>
                  <span className="text-sm text-gray-600">{(trends.errorRate * 100).toFixed(2)}%</span>
                </div>
                <Progress 
                  value={Math.min(trends.errorRate * 100, 100)} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Performance Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                  <span className="text-sm text-blue-800">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
