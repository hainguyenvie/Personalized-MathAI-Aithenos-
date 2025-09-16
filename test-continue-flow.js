#!/usr/bin/env node

const BASE_URL = 'http://localhost:3001';

async function testContinueFlow() {
  console.log('🧪 Testing Continue Flow...\n');
  
  try {
    // Step 1: Create session
    console.log('1. Creating session...');
    const sessionResponse = await fetch(`${BASE_URL}/api/adaptive-optimized/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_name: 'Test Student', grade: '12' })
    });
    
    const sessionData = await sessionResponse.json();
    if (!sessionData.success) {
      throw new Error('Failed to create session');
    }
    
    const sessionId = sessionData.session.id;
    console.log(`✅ Session created: ${sessionId}`);
    
    // Step 2: Start bundle
    console.log('\n2. Starting bundle...');
    const bundleResponse = await fetch(`${BASE_URL}/api/adaptive-optimized/sessions/${sessionId}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ difficulty: 'N' })
    });
    
    const bundleData = await bundleResponse.json();
    if (!bundleData.success) {
      throw new Error('Failed to start bundle');
    }
    
    console.log(`✅ Bundle started: ${bundleData.bundle.length} questions`);
    
    // Step 3: Submit answers (fail some to trigger supplementary)
    console.log('\n3. Submitting answers...');
    const mockAnswers = [
      { question_id: bundleData.bundle[0].id, student_answer: 0, is_correct: true, time_spent: 30 },
      { question_id: bundleData.bundle[1].id, student_answer: 1, is_correct: true, time_spent: 30 },
      { question_id: bundleData.bundle[2].id, student_answer: 2, is_correct: false, time_spent: 30 },
      { question_id: bundleData.bundle[3].id, student_answer: 0, is_correct: false, time_spent: 30 },
      { question_id: bundleData.bundle[4].id, student_answer: 3, is_correct: false, time_spent: 30 }
    ];
    
    const answersResponse = await fetch(`${BASE_URL}/api/adaptive-optimized/sessions/${sessionId}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: mockAnswers })
    });
    
    const answersData = await answersResponse.json();
    if (!answersData.success) {
      throw new Error('Failed to submit answers');
    }
    
    console.log(`✅ Answers submitted. State: ${answersData.session.current_state}`);
    console.log(`   Needs review: ${answersData.needs_review}`);
    
    // Step 4: Generate review
    console.log('\n4. Generating review...');
    const reviewResponse = await fetch(`${BASE_URL}/api/adaptive-optimized/sessions/${sessionId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ difficulty: 'N' })
    });
    
    const reviewData = await reviewResponse.json();
    if (!reviewData.success) {
      throw new Error('Failed to generate review');
    }
    
    const reviewId = reviewData.review_session.id;
    console.log(`✅ Review generated: ${reviewId}`);
    
    // Step 5: Continue after fail review (should generate supplementary questions)
    console.log('\n5. Continuing after fail review...');
    const continueResponse = await fetch(`${BASE_URL}/api/adaptive-optimized/sessions/${sessionId}/review/${reviewId}/continue-fail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ difficulty: 'N' })
    });
    
    const continueData = await continueResponse.json();
    if (!continueData.success) {
      throw new Error('Failed to continue after fail review');
    }
    
    console.log(`✅ Continue after fail review. State: ${continueData.session.current_state}`);
    console.log(`   Next bundle: ${continueData.next_bundle ? continueData.next_bundle.length + ' questions' : 'None'}`);
    
    // Step 6: Submit supplementary answers
    if (continueData.next_bundle) {
      console.log('\n6. Submitting supplementary answers...');
      const suppAnswers = continueData.next_bundle.map((q, index) => ({
        question_id: q.id,
        student_answer: index % 4,
        is_correct: index < 2, // First 2 correct, rest wrong
        time_spent: 30
      }));
      
      const suppResponse = await fetch(`${BASE_URL}/api/adaptive-optimized/sessions/${sessionId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: suppAnswers })
      });
      
      const suppData = await suppResponse.json();
      if (!suppData.success) {
        throw new Error('Failed to submit supplementary answers');
      }
      
      console.log(`✅ Supplementary answers submitted. State: ${suppData.session.current_state}`);
      
      // Step 7: Generate supplementary review
      console.log('\n7. Generating supplementary review...');
      const suppReviewResponse = await fetch(`${BASE_URL}/api/adaptive-optimized/sessions/${sessionId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty: 'N' })
      });
      
      const suppReviewData = await suppReviewResponse.json();
      if (!suppReviewData.success) {
        throw new Error('Failed to generate supplementary review');
      }
      
      const suppReviewId = suppReviewData.review_session.id;
      console.log(`✅ Supplementary review generated: ${suppReviewId}`);
      
      // Step 8: Continue after supplementary review
      console.log('\n8. Continuing after supplementary review...');
      const continueSuppResponse = await fetch(`${BASE_URL}/api/adaptive-optimized/sessions/${sessionId}/review/${suppReviewId}/continue-supplementary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty: 'N' })
      });
      
      const continueSuppData = await continueSuppResponse.json();
      if (!continueSuppData.success) {
        throw new Error('Failed to continue after supplementary review');
      }
      
      console.log(`✅ Continue after supplementary review. State: ${continueSuppData.session.current_state}`);
      console.log(`   Next bundle: ${continueSuppData.next_bundle ? continueSuppData.next_bundle.length + ' questions' : 'None'}`);
    }
    
    console.log('\n🎉 All tests passed! Continue flow is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testContinueFlow().catch(console.error);

export default testContinueFlow;
