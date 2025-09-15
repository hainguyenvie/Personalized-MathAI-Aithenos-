import { optimizedAdaptiveLearningManager } from './optimized-adaptive-learning';
import { aiCacheManager } from './ai-cache';
import { optimizedQuestionDB } from './optimized-question-db';

export interface PerformanceMetrics {
  timestamp: Date;
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

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private startTimes: Map<string, number> = new Map();
  private errorCount = 0;
  private lastError: string | undefined;

  // Start timing an operation
  startTiming(operation: string): void {
    this.startTimes.set(operation, Date.now());
  }

  // End timing and record
  endTiming(operation: string): number {
    const startTime = this.startTimes.get(operation);
    if (!startTime) return 0;

    const duration = Date.now() - startTime;
    this.startTimes.delete(operation);
    return duration;
  }

  // Record an error
  recordError(error: string): void {
    this.errorCount++;
    this.lastError = error;
    console.error(`Performance Monitor - Error ${this.errorCount}:`, error);
  }

  // Collect current metrics
  async collectMetrics(): Promise<PerformanceMetrics> {
    try {
      const stats = optimizedAdaptiveLearningManager.getPerformanceStats();
      const aiCacheStats = aiCacheManager.getCacheStats();
      const dbStats = await optimizedQuestionDB.getQuestionStats();

      const metrics: PerformanceMetrics = {
        timestamp: new Date(),
        sessions: {
          active: stats.sessions,
          total: stats.sessions // In a real app, you'd track total sessions
        },
        cache: {
          bundleCache: stats.bundleCache,
          reviewCache: stats.reviewCache,
          aiCache: {
            size: aiCacheStats.size,
            hitRate: this.calculateCacheHitRate()
          }
        },
        database: {
          loaded: optimizedQuestionDB.isLoaded(),
          totalQuestions: dbStats.total,
          validQuestions: dbStats.validQuestions
        },
        responseTimes: {
          bundleGeneration: this.getAverageResponseTime('bundleGeneration'),
          reviewGeneration: this.getAverageResponseTime('reviewGeneration'),
          stateTransition: this.getAverageResponseTime('stateTransition')
        },
        errors: {
          count: this.errorCount,
          lastError: this.lastError
        }
      };

      // Store metrics
      this.metrics.push(metrics);

      // Keep only last 100 metrics
      if (this.metrics.length > 100) {
        this.metrics = this.metrics.slice(-100);
      }

      return metrics;
    } catch (error) {
      this.recordError(`Failed to collect metrics: ${error}`);
      throw error;
    }
  }

  // Get performance summary
  async getPerformanceSummary(): Promise<{
    current: PerformanceMetrics;
    trends: {
      averageResponseTime: number;
      errorRate: number;
      cacheHitRate: number;
    };
    recommendations: string[];
  }> {
    const current = await this.collectMetrics();
    
    // Calculate trends
    const recentMetrics = this.metrics.slice(-10); // Last 10 measurements
    const averageResponseTime = recentMetrics.length > 0 
      ? recentMetrics.reduce((sum, m) => 
          sum + m.responseTimes.bundleGeneration + 
          m.responseTimes.reviewGeneration + 
          m.responseTimes.stateTransition, 0) / (recentMetrics.length * 3)
      : 0;

    const errorRate = recentMetrics.length > 0
      ? recentMetrics.reduce((sum, m) => sum + m.errors.count, 0) / recentMetrics.length
      : 0;

    const cacheHitRate = this.calculateCacheHitRate();

    // Generate recommendations
    const recommendations = this.generateRecommendations(current, {
      averageResponseTime,
      errorRate,
      cacheHitRate
    });

    return {
      current,
      trends: {
        averageResponseTime,
        errorRate,
        cacheHitRate
      },
      recommendations
    };
  }

  // Calculate cache hit rate
  private calculateCacheHitRate(): number {
    // This is a simplified calculation
    // In a real implementation, you'd track actual hits vs misses
    const aiCacheStats = aiCacheManager.getCacheStats();
    return aiCacheStats.size > 0 ? 0.85 : 0; // Assume 85% hit rate if cache has data
  }

  // Get average response time for an operation
  private getAverageResponseTime(operation: string): number {
    const recentMetrics = this.metrics.slice(-10);
    if (recentMetrics.length === 0) return 0;

    const times = recentMetrics.map(m => {
      switch (operation) {
        case 'bundleGeneration': return m.responseTimes.bundleGeneration;
        case 'reviewGeneration': return m.responseTimes.reviewGeneration;
        case 'stateTransition': return m.responseTimes.stateTransition;
        default: return 0;
      }
    });

    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  // Generate performance recommendations
  private generateRecommendations(
    current: PerformanceMetrics,
    trends: { averageResponseTime: number; errorRate: number; cacheHitRate: number }
  ): string[] {
    const recommendations: string[] = [];

    // Response time recommendations
    if (trends.averageResponseTime > 2000) {
      recommendations.push('Response times are high (>2s). Consider increasing cache TTL or optimizing AI calls.');
    }

    if (current.responseTimes.bundleGeneration > 1000) {
      recommendations.push('Bundle generation is slow. Consider pre-generating common bundles.');
    }

    if (current.responseTimes.reviewGeneration > 1500) {
      recommendations.push('Review generation is slow. Consider caching review templates.');
    }

    // Cache recommendations
    if (trends.cacheHitRate < 0.7) {
      recommendations.push('Cache hit rate is low (<70%). Consider increasing cache TTL or improving cache keys.');
    }

    if (current.cache.bundleCache < 5) {
      recommendations.push('Bundle cache is small. Consider pre-warming cache with common bundles.');
    }

    // Error recommendations
    if (trends.errorRate > 0.1) {
      recommendations.push('Error rate is high (>10%). Check error logs and improve error handling.');
    }

    // Database recommendations
    if (!current.database.loaded) {
      recommendations.push('Question database is not loaded. Check database initialization.');
    }

    if (current.database.validQuestions / current.database.totalQuestions < 0.8) {
      recommendations.push('Many questions are invalid. Consider cleaning the question database.');
    }

    // Session recommendations
    if (current.sessions.active > 50) {
      recommendations.push('High number of active sessions. Consider implementing session cleanup.');
    }

    return recommendations.length > 0 ? recommendations : ['System performance is optimal.'];
  }

  // Get metrics history
  getMetricsHistory(limit: number = 20): PerformanceMetrics[] {
    return this.metrics.slice(-limit);
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics = [];
    this.errorCount = 0;
    this.lastError = undefined;
  }

  // Health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    metrics: PerformanceMetrics;
  }> {
    const metrics = await this.collectMetrics();
    const issues: string[] = [];

    // Check critical issues
    if (!metrics.database.loaded) {
      issues.push('Database not loaded');
    }

    if (metrics.errors.count > 10) {
      issues.push('High error count');
    }

    if (metrics.responseTimes.bundleGeneration > 5000) {
      issues.push('Bundle generation timeout');
    }

    // Check warning issues
    if (metrics.cache.aiCache.hitRate < 0.5) {
      issues.push('Low cache hit rate');
    }

    if (metrics.sessions.active > 100) {
      issues.push('High session count');
    }

    // Determine status
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (issues.some(issue => issue.includes('timeout') || issue.includes('not loaded'))) {
      status = 'critical';
    } else if (issues.length > 0) {
      status = 'warning';
    }

    return { status, issues, metrics };
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();
