#!/usr/bin/env node

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

// Performance test configuration
const TEST_CONFIG = {
  iterations: 10,
  endpoints: [
    { path: '/api/adaptive-optimized/sessions', method: 'POST', data: { student_name: 'Test Student', grade: '12' } },
    { path: '/api/performance/metrics', method: 'GET' },
    { path: '/api/performance/summary', method: 'GET' },
    { path: '/api/performance/health', method: 'GET' }
  ]
};

class PerformanceTester {
  constructor() {
    this.results = [];
    this.sessionId = null;
  }

  async runTest() {
    console.log('🚀 Starting Performance Tests...\n');
    
    // Test 1: Create session
    await this.testCreateSession();
    
    // Test 2: Start bundle
    await this.testStartBundle();
    
    // Test 3: Submit answers
    await this.testSubmitAnswers();
    
    // Test 4: Generate review
    await this.testGenerateReview();
    
    // Test 5: Performance metrics
    await this.testPerformanceMetrics();
    
    // Generate report
    this.generateReport();
  }

  async testCreateSession() {
    console.log('📝 Testing Session Creation...');
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${BASE_URL}/api/adaptive-optimized/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_name: 'Performance Test', grade: '12' })
      });
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      if (data.success) {
        this.sessionId = data.session.id;
        this.recordResult('Create Session', duration, true);
        console.log(`✅ Session created in ${duration}ms`);
      } else {
        this.recordResult('Create Session', duration, false, data.error);
        console.log(`❌ Session creation failed: ${data.error}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordResult('Create Session', duration, false, error.message);
      console.log(`❌ Session creation error: ${error.message}`);
    }
  }

  async testStartBundle() {
    if (!this.sessionId) {
      console.log('⏭️ Skipping bundle test - no session ID');
      return;
    }

    console.log('📦 Testing Bundle Generation...');
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${BASE_URL}/api/adaptive-optimized/sessions/${this.sessionId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty: 'N' })
      });
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      if (data.success) {
        this.recordResult('Start Bundle', duration, true);
        console.log(`✅ Bundle generated in ${duration}ms (${data.bundle.length} questions)`);
      } else {
        this.recordResult('Start Bundle', duration, false, data.error);
        console.log(`❌ Bundle generation failed: ${data.error}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordResult('Start Bundle', duration, false, error.message);
      console.log(`❌ Bundle generation error: ${error.message}`);
    }
  }

  async testSubmitAnswers() {
    if (!this.sessionId) {
      console.log('⏭️ Skipping answers test - no session ID');
      return;
    }

    console.log('📝 Testing Answer Submission...');
    const startTime = Date.now();
    
    try {
      const mockAnswers = [
        { question_id: 'test_1', student_answer: 0, is_correct: true, time_spent: 30 },
        { question_id: 'test_2', student_answer: 1, is_correct: false, time_spent: 45 },
        { question_id: 'test_3', student_answer: 2, is_correct: true, time_spent: 25 },
        { question_id: 'test_4', student_answer: 0, is_correct: true, time_spent: 40 },
        { question_id: 'test_5', student_answer: 3, is_correct: false, time_spent: 35 }
      ];

      const response = await fetch(`${BASE_URL}/api/adaptive-optimized/sessions/${this.sessionId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: mockAnswers })
      });
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      if (data.success) {
        this.recordResult('Submit Answers', duration, true);
        console.log(`✅ Answers submitted in ${duration}ms`);
      } else {
        this.recordResult('Submit Answers', duration, false, data.error);
        console.log(`❌ Answer submission failed: ${data.error}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordResult('Submit Answers', duration, false, error.message);
      console.log(`❌ Answer submission error: ${error.message}`);
    }
  }

  async testGenerateReview() {
    if (!this.sessionId) {
      console.log('⏭️ Skipping review test - no session ID');
      return;
    }

    console.log('📊 Testing Review Generation...');
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${BASE_URL}/api/adaptive-optimized/sessions/${this.sessionId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty: 'N' })
      });
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      if (data.success) {
        this.recordResult('Generate Review', duration, true);
        console.log(`✅ Review generated in ${duration}ms`);
      } else {
        this.recordResult('Generate Review', duration, false, data.error);
        console.log(`❌ Review generation failed: ${data.error}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordResult('Generate Review', duration, false, error.message);
      console.log(`❌ Review generation error: ${error.message}`);
    }
  }

  async testPerformanceMetrics() {
    console.log('📈 Testing Performance Metrics...');
    
    const endpoints = [
      '/api/performance/metrics',
      '/api/performance/summary',
      '/api/performance/health'
    ];

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      
      try {
        const response = await fetch(`${BASE_URL}${endpoint}`);
        const data = await response.json();
        const duration = Date.now() - startTime;
        
        if (data.success || data.health) {
          this.recordResult(`Performance ${endpoint.split('/').pop()}`, duration, true);
          console.log(`✅ ${endpoint} responded in ${duration}ms`);
        } else {
          this.recordResult(`Performance ${endpoint.split('/').pop()}`, duration, false, data.error);
          console.log(`❌ ${endpoint} failed: ${data.error}`);
        }
      } catch (error) {
        const duration = Date.now() - startTime;
        this.recordResult(`Performance ${endpoint.split('/').pop()}`, duration, false, error.message);
        console.log(`❌ ${endpoint} error: ${error.message}`);
      }
    }
  }

  recordResult(testName, duration, success, error = null) {
    this.results.push({
      test: testName,
      duration,
      success,
      error,
      timestamp: new Date()
    });
  }

  generateReport() {
    console.log('\n📊 Performance Test Report');
    console.log('='.repeat(50));
    
    const successfulTests = this.results.filter(r => r.success);
    const failedTests = this.results.filter(r => !r.success);
    
    console.log(`\n✅ Successful Tests: ${successfulTests.length}`);
    console.log(`❌ Failed Tests: ${failedTests.length}`);
    
    if (successfulTests.length > 0) {
      const avgDuration = successfulTests.reduce((sum, r) => sum + r.duration, 0) / successfulTests.length;
      const minDuration = Math.min(...successfulTests.map(r => r.duration));
      const maxDuration = Math.max(...successfulTests.map(r => r.duration));
      
      console.log(`\n⏱️ Response Times:`);
      console.log(`   Average: ${avgDuration.toFixed(2)}ms`);
      console.log(`   Min: ${minDuration}ms`);
      console.log(`   Max: ${maxDuration}ms`);
    }
    
    console.log(`\n📋 Detailed Results:`);
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const errorInfo = result.error ? ` (${result.error})` : '';
      console.log(`   ${status} ${result.test}: ${result.duration}ms${errorInfo}`);
    });
    
    if (failedTests.length > 0) {
      console.log(`\n🚨 Failed Tests:`);
      failedTests.forEach(result => {
        console.log(`   ❌ ${result.test}: ${result.error}`);
      });
    }
    
    // Performance recommendations
    console.log(`\n💡 Performance Recommendations:`);
    const slowTests = this.results.filter(r => r.success && r.duration > 1000);
    if (slowTests.length > 0) {
      console.log(`   - ${slowTests.length} tests took longer than 1 second`);
      console.log(`   - Consider optimizing: ${slowTests.map(t => t.test).join(', ')}`);
    } else {
      console.log(`   - All tests completed within acceptable time limits`);
    }
    
    if (failedTests.length > 0) {
      console.log(`   - Fix ${failedTests.length} failing tests before deployment`);
    }
    
    console.log(`\n🎯 Overall Performance: ${this.getPerformanceRating()}`);
  }

  getPerformanceRating() {
    const successRate = this.results.filter(r => r.success).length / this.results.length;
    const avgDuration = this.results.filter(r => r.success).reduce((sum, r) => sum + r.duration, 0) / this.results.filter(r => r.success).length;
    
    if (successRate >= 0.95 && avgDuration < 500) return 'Excellent ⭐⭐⭐⭐⭐';
    if (successRate >= 0.9 && avgDuration < 1000) return 'Good ⭐⭐⭐⭐';
    if (successRate >= 0.8 && avgDuration < 2000) return 'Fair ⭐⭐⭐';
    if (successRate >= 0.7) return 'Poor ⭐⭐';
    return 'Critical ⭐';
  }
}

// Run the performance test
async function main() {
  const tester = new PerformanceTester();
  await tester.runTest();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = PerformanceTester;
