import { Router } from 'express';
import { optimizedAdaptiveLearningManager, Session, TutorSession, SupplementaryRound, ReviewSession, Answer } from './optimized-adaptive-learning';
import { Question } from './optimized-question-db';
import { aiTutor, TutorContext } from './ai-tutor';

const router = Router();

// Create new learning session
router.post('/sessions', async (req, res) => {
  try {
    const { student_name, grade } = req.body;
    
    if (!student_name || !grade) {
      return res.status(400).json({ error: 'Student name and grade are required' });
    }

    const session = optimizedAdaptiveLearningManager.createSession(student_name, grade);
    
    res.json({
      success: true,
      session: {
        id: session.id,
        student_name: session.student_name,
        grade: session.grade,
        current_state: session.current_state,
        created_at: session.created_at
      }
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Get session details
router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = optimizedAdaptiveLearningManager.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      success: true,
      session: {
        id: session.id,
        student_name: session.student_name,
        grade: session.grade,
        current_state: session.current_state,
        current_difficulty: session.current_difficulty,
        current_question_index: session.current_question_index,
        total_questions: session.answers.length,
        correct_answers: session.answers.filter(a => a.is_correct).length,
        created_at: session.created_at,
        updated_at: session.updated_at
      }
    });
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

// Start initial bundle or specific difficulty
router.post('/sessions/:sessionId/start', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { difficulty } = req.body;
    
    // Use provided difficulty or default to 'N'
    const targetDifficulty = difficulty || 'N';
    const bundle = await optimizedAdaptiveLearningManager.startBundle(sessionId, targetDifficulty as 'N' | 'H' | 'V');
    
    console.log('Generated bundle:', bundle.length, 'questions');
    
    res.json({
      success: true,
      bundle: bundle.map(q => ({
        id: q.id,
        content: q.content,
        type: q.type,
        choices: q.choices || [],
        difficulty: q.difficulty,
        difficulty_name: q.difficulty_name,
        lesson_id: q.lesson_id
      }))
    });
  } catch (error) {
    console.error('Error starting bundle:', error);
    res.status(500).json({ error: 'Failed to start bundle' });
  }
});

// Submit answers for current bundle
router.post('/sessions/:sessionId/answers', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { answers } = req.body;
    
    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers must be an array' });
    }

    // Convert answers to Answer objects
    const answerObjects: Answer[] = answers.map((a: any) => ({
      question_id: a.question_id,
      student_answer: a.student_answer,
      is_correct: a.is_correct,
      time_spent: a.time_spent || 0,
      timestamp: new Date()
    }));

    // Process state transition with optimization
    const result = await optimizedAdaptiveLearningManager.processStateTransition(sessionId, answerObjects);
    
    console.log('State transition result:', {
      current_state: result.session.current_state,
      current_difficulty: result.session.current_difficulty,
      hasNextBundle: !!result.nextBundle,
      needsTutor: result.needsTutor,
      needsReview: result.needsReview,
      wrongAnswersCount: result.wrongAnswers?.length || 0
    });
    
    const response: any = {
      success: true,
      session: {
        id: result.session.id,
        current_state: result.session.current_state,
        current_difficulty: result.session.current_difficulty,
        weak_lessons: result.session.weak_lessons
      }
    };

    // Add next bundle if available
    if (result.nextBundle) {
      response.next_bundle = result.nextBundle.map(q => ({
        id: q.id,
        content: q.content,
        type: q.type,
        choices: q.choices,
        difficulty: q.difficulty,
        difficulty_name: q.difficulty_name,
        lesson_id: q.lesson_id
      }));
    }

    // Add tutor flag if needed
    if (result.needsTutor) {
      response.needs_tutor = true;
      response.wrong_answers = result.wrongAnswers?.map(a => ({
        question_id: a.question_id,
        student_answer: a.student_answer,
        is_correct: a.is_correct,
        time_spent: a.time_spent
      }));
    }

    // Add review flag if in review state
    if (result.needsReview) {
      response.needs_review = true;
    }

    res.json(response);
  } catch (error) {
    console.error('Error submitting answers:', error);
    res.status(500).json({ error: 'Failed to submit answers' });
  }
});

// Start tutor session
router.post('/sessions/:sessionId/tutor/start', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { question_id, student_answer } = req.body;
    
    const session = optimizedAdaptiveLearningManager.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Find the question
    const question = session.current_bundle.find(q => q.id === question_id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Create tutor context
    const tutorContext: TutorContext = {
      lesson_id: question.lesson_id,
      difficulty: session.current_difficulty,
      problem_type: question.problem_type || 'general',
      student_answer: student_answer,
      correct_answer: question.choices[question.correct_answer],
      question_content: question.content,
      explanation: question.explanation
    };

    // Create tutor session
    const tutorSession = await aiTutor.startTutorSession(tutorContext);
    
    // Store tutor session in main session
    session.tutor_sessions.push(tutorSession);
    optimizedAdaptiveLearningManager.updateSession(sessionId, session);

    res.json({
      success: true,
      tutor_session: {
        id: tutorSession.id,
        context: {
          lesson_id: tutorContext.lesson_id,
          difficulty: tutorContext.difficulty,
          problem_type: tutorContext.problem_type
        }
      }
    });
  } catch (error) {
    console.error('Error starting tutor session:', error);
    res.status(500).json({ error: 'Failed to start tutor session' });
  }
});

// Get tutor hint
router.post('/sessions/:sessionId/tutor/:tutorSessionId/hint', async (req, res) => {
  try {
    const { sessionId, tutorSessionId } = req.params;
    const { student_response } = req.body;
    
    const session = optimizedAdaptiveLearningManager.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Find tutor session
    const tutorSession = session.tutor_sessions.find(ts => ts.id === tutorSessionId);
    if (!tutorSession) {
      return res.status(404).json({ error: 'Tutor session not found' });
    }

    // Generate hint
    const hint = await aiTutor.generateHint(tutorSession, student_response);
    
    res.json({
      success: true,
      hint: {
        id: hint.id,
        level: hint.level,
        content: hint.content,
        type: hint.type,
        is_final: hint.is_final
      },
      tutor_session: {
        current_step: tutorSession.current_step,
        max_steps: 4, // Default max steps
        completed: tutorSession.completed
      }
    });
  } catch (error) {
    console.error('Error getting tutor hint:', error);
    res.status(500).json({ error: 'Failed to get tutor hint' });
  }
});

// Check student response in tutor session
router.post('/sessions/:sessionId/tutor/:tutorSessionId/check', async (req, res) => {
  try {
    const { sessionId, tutorSessionId } = req.params;
    const { student_response } = req.body;
    
    const session = optimizedAdaptiveLearningManager.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Find tutor session
    const tutorSession = session.tutor_sessions.find(ts => ts.id === tutorSessionId);
    if (!tutorSession) {
      return res.status(404).json({ error: 'Tutor session not found' });
    }

    // Check student response
    const result = await aiTutor.checkStudentResponse(tutorSession, student_response);
    
    res.json({
      success: true,
      result: result
    });
  } catch (error) {
    console.error('Error checking student response:', error);
    res.status(500).json({ error: 'Failed to check student response' });
  }
});

// Generate retest questions after tutor session
router.post('/sessions/:sessionId/tutor/:tutorSessionId/retest', async (req, res) => {
  try {
    const { sessionId, tutorSessionId } = req.params;
    
    const session = optimizedAdaptiveLearningManager.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Find tutor session
    const tutorSession = session.tutor_sessions.find(ts => ts.id === tutorSessionId);
    if (!tutorSession) {
      return res.status(404).json({ error: 'Tutor session not found' });
    }

    // Generate retest questions
    const retestQuestions = await aiTutor.generateRetestQuestions(tutorSession, 5);
    
    res.json({
      success: true,
      retest_questions: retestQuestions.map(q => ({
        id: q.id,
        content: q.content,
        type: q.type,
        choices: q.choices,
        difficulty: q.difficulty,
        difficulty_name: q.difficulty_name,
        lesson_id: q.lesson_id
      }))
    });
  } catch (error) {
    console.error('Error generating retest questions:', error);
    res.status(500).json({ error: 'Failed to generate retest questions' });
  }
});

// ===== NEW ROUND-BASED SUPPLEMENTARY SYSTEM ROUTES =====

// Get current supplementary round
router.get('/sessions/:sessionId/supplementary/current-round', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const currentRound = optimizedAdaptiveLearningManager.getCurrentSupplementaryRound(sessionId);
    
    if (!currentRound) {
      return res.status(404).json({ error: 'No current supplementary round found' });
    }

    res.json({
      success: true,
      round: {
        id: currentRound.id,
        round_number: currentRound.round_number,
        original_question: {
          content: currentRound.original_question.content,
          explanation: currentRound.original_question.explanation
        },
        supplementary_questions: currentRound.supplementary_questions.map(q => ({
          id: q.id,
          content: q.content,
          type: q.type,
          choices: q.choices,
          difficulty: q.difficulty,
          difficulty_name: q.difficulty_name,
          lesson_id: q.lesson_id
        })),
        round_completed: currentRound.round_completed
      }
    });
  } catch (error) {
    console.error('Error getting current supplementary round:', error);
    res.status(500).json({ error: 'Failed to get current supplementary round' });
  }
});

// Submit answers for current supplementary round
router.post('/sessions/:sessionId/supplementary/submit-round', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Valid answers array is required' });
    }

    const submittedRound = await optimizedAdaptiveLearningManager.submitSupplementaryRoundAnswers(sessionId, answers);

    res.json({
      success: true,
      round: {
        id: submittedRound.id,
        round_number: submittedRound.round_number,
        round_completed: submittedRound.round_completed,
        performance: {
          total_questions: submittedRound.round_answers.length,
          correct_answers: submittedRound.round_answers.filter(a => a.is_correct).length,
          accuracy: submittedRound.round_answers.length > 0 
            ? (submittedRound.round_answers.filter(a => a.is_correct).length / submittedRound.round_answers.length) * 100 
            : 0
        }
      }
    });
  } catch (error) {
    console.error('Error submitting supplementary round answers:', error);
    res.status(500).json({ error: 'Failed to submit supplementary round answers' });
  }
});

// Generate review for specific supplementary round
router.post('/sessions/:sessionId/supplementary/round/:roundId/review', async (req, res) => {
  try {
    const { sessionId, roundId } = req.params;

    const reviewSession = await optimizedAdaptiveLearningManager.generateSupplementaryRoundReview(sessionId, roundId);

    res.json({
      success: true,
      review: {
        id: reviewSession.id,
        difficulty: reviewSession.difficulty,
        lesson_summary: reviewSession.lesson_summary,
        overall_performance: reviewSession.overall_performance,
        recommendations: reviewSession.recommendations,
        next_difficulty_preparation: reviewSession.next_difficulty_preparation
      }
    });
  } catch (error) {
    console.error('Error generating supplementary round review:', error);
    res.status(500).json({ error: 'Failed to generate supplementary round review' });
  }
});

// Continue after supplementary round review
router.post('/sessions/:sessionId/supplementary/round/:roundId/continue', async (req, res) => {
  try {
    const { sessionId, roundId } = req.params;

    const result = await optimizedAdaptiveLearningManager.continueAfterRoundReview(sessionId);

    res.json({
      success: true,
      hasMoreRounds: result.hasMoreRounds,
      nextRound: result.nextRound ? {
        id: result.nextRound.id,
        round_number: result.nextRound.round_number,
        supplementary_questions: result.nextRound.supplementary_questions.map(q => ({
          id: q.id,
          content: q.content,
          type: q.type,
          choices: q.choices,
          difficulty: q.difficulty,
          difficulty_name: q.difficulty_name,
          lesson_id: q.lesson_id
        }))
      } : null,
      completed: result.completed || false
    });
  } catch (error) {
    console.error('Error continuing after round review:', error);
    res.status(500).json({ error: 'Failed to continue after round review' });
  }
});

// Generate final supplementary review (when all rounds are completed)
router.post('/sessions/:sessionId/supplementary/final-review', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { difficulty } = req.body;

    if (!difficulty || !['N', 'H', 'V'].includes(difficulty)) {
      return res.status(400).json({ error: 'Valid difficulty (N, H, V) is required' });
    }

    const reviewSession = await optimizedAdaptiveLearningManager.generateDetailedSupplementaryReview(sessionId, difficulty);

    res.json({
      success: true,
      review: {
        id: reviewSession.id,
        difficulty: reviewSession.difficulty,
        lesson_summary: reviewSession.lesson_summary,
        overall_performance: reviewSession.overall_performance,
        recommendations: reviewSession.recommendations,
        next_difficulty_preparation: reviewSession.next_difficulty_preparation
      }
    });
  } catch (error) {
    console.error('Error generating final supplementary review:', error);
    res.status(500).json({ error: 'Failed to generate final supplementary review' });
  }
});

// Get theory summary for a lesson
router.get('/theory/:lessonId/summary', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { problem_type } = req.query;
    
    const summary = await aiTutor.generateTheorySummary(
      parseInt(lessonId), 
      problem_type as string || 'general'
    );
    
    res.json({
      success: true,
      summary: summary
    });
  } catch (error) {
    console.error('Error getting theory summary:', error);
    res.status(500).json({ error: 'Failed to get theory summary' });
  }
});

// Get worked example for a lesson
router.get('/theory/:lessonId/example', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { problem_type } = req.query;
    
    const example = await aiTutor.generateWorkedExample(
      parseInt(lessonId), 
      problem_type as string || 'general'
    );
    
    res.json({
      success: true,
      example: example
    });
  } catch (error) {
    console.error('Error getting worked example:', error);
    res.status(500).json({ error: 'Failed to get worked example' });
  }
});

// Generate review session with optimization
router.post('/sessions/:sessionId/review', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { difficulty } = req.body;
    
    if (!difficulty || !['N', 'H', 'V'].includes(difficulty)) {
      return res.status(400).json({ error: 'Valid difficulty (N, H, V) is required' });
    }

    const reviewSession = await optimizedAdaptiveLearningManager.generateReviewSession(sessionId, difficulty);
    
    res.json({
      success: true,
      review_session: reviewSession
    });
  } catch (error) {
    console.error('Error generating review session:', error);
    res.status(500).json({ error: 'Failed to generate review session' });
  }
});

// Generate detailed supplementary review session
router.post('/sessions/:sessionId/review/detailed-supplementary', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { difficulty } = req.body;
    
    if (!difficulty || !['N', 'H', 'V'].includes(difficulty)) {
      return res.status(400).json({ error: 'Valid difficulty (N, H, V) is required' });
    }

    const reviewSession = await optimizedAdaptiveLearningManager.generateDetailedSupplementaryReview(sessionId, difficulty);
    
    res.json({
      success: true,
      review_session: reviewSession
    });
  } catch (error) {
    console.error('Error generating detailed supplementary review session:', error);
    res.status(500).json({ error: 'Failed to generate detailed supplementary review session' });
  }
});

// Get review session
router.get('/sessions/:sessionId/review/:reviewId', async (req, res) => {
  try {
    const { sessionId, reviewId } = req.params;
    const session = optimizedAdaptiveLearningManager.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const reviewSession = session.review_sessions.find(rs => rs.id === reviewId);
    if (!reviewSession) {
      return res.status(404).json({ error: 'Review session not found' });
    }

    res.json({
      success: true,
      review_session: reviewSession
    });
  } catch (error) {
    console.error('Error getting review session:', error);
    res.status(500).json({ error: 'Failed to get review session' });
  }
});

// Continue to next difficulty after review
router.post('/sessions/:sessionId/review/:reviewId/continue', async (req, res) => {
  try {
    const { sessionId, reviewId } = req.params;
    const { difficulty } = req.body;
    
    if (!difficulty || !['N', 'H', 'V'].includes(difficulty)) {
      return res.status(400).json({ error: 'Valid difficulty (N, H, V) is required' });
    }

    const session = optimizedAdaptiveLearningManager.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const reviewSession = session.review_sessions.find(rs => rs.id === reviewId);
    if (!reviewSession) {
      return res.status(404).json({ error: 'Review session not found' });
    }

    // Use the optimized continueAfterReview method
    const result = await optimizedAdaptiveLearningManager.continueAfterReview(sessionId, difficulty);

    res.json({
      success: true,
      session: {
        id: result.session.id,
        current_state: result.session.current_state,
        current_difficulty: result.session.current_difficulty
      },
      next_bundle: result.nextBundle ? result.nextBundle.map(q => ({
        id: q.id,
        content: q.content,
        type: q.type,
        choices: q.choices,
        difficulty: q.difficulty,
        difficulty_name: q.difficulty_name,
        lesson_id: q.lesson_id
      })) : null
    });
  } catch (error) {
    console.error('Error continuing after review:', error);
    res.status(500).json({ error: 'Failed to continue after review' });
  }
});

// Continue to supplementary questions after fail review
router.post('/sessions/:sessionId/review/:reviewId/continue-fail', async (req, res) => {
  try {
    const { sessionId, reviewId } = req.params;
    const { difficulty } = req.body;
    
    if (!difficulty || !['N', 'H', 'V'].includes(difficulty)) {
      return res.status(400).json({ error: 'Valid difficulty (N, H, V) is required' });
    }

    const session = optimizedAdaptiveLearningManager.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const reviewSession = session.review_sessions.find(rs => rs.id === reviewId);
    if (!reviewSession) {
      return res.status(404).json({ error: 'Review session not found' });
    }

    // Use the optimized continueAfterFailReview method
    const result = await optimizedAdaptiveLearningManager.continueAfterFailReview(sessionId, difficulty);

    res.json({
      success: true,
      session: {
        id: result.session.id,
        current_state: result.session.current_state,
        current_difficulty: result.session.current_difficulty
      },
      next_bundle: result.nextBundle ? result.nextBundle.map(q => ({
        id: q.id,
        content: q.content,
        type: q.type,
        choices: q.choices,
        difficulty: q.difficulty,
        difficulty_name: q.difficulty_name,
        lesson_id: q.lesson_id
      })) : null
    });
  } catch (error) {
    console.error('Error continuing after fail review:', error);
    res.status(500).json({ error: 'Failed to continue after fail review' });
  }
});

// Continue after supplementary review (both success and fail)
router.post('/sessions/:sessionId/review/:reviewId/continue-supplementary', async (req, res) => {
  try {
    const { sessionId, reviewId } = req.params;
    const { difficulty } = req.body;
    
    if (!difficulty || !['N', 'H', 'V'].includes(difficulty)) {
      return res.status(400).json({ error: 'Valid difficulty (N, H, V) is required' });
    }

    const session = optimizedAdaptiveLearningManager.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const reviewSession = session.review_sessions.find(rs => rs.id === reviewId);
    if (!reviewSession) {
      return res.status(404).json({ error: 'Review session not found' });
    }

    // Use the optimized continueAfterSupplementaryReview method
    const result = await optimizedAdaptiveLearningManager.continueAfterSupplementaryReview(sessionId, difficulty);

    res.json({
      success: true,
      session: {
        id: result.session.id,
        current_state: result.session.current_state,
        current_difficulty: result.session.current_difficulty
      },
      next_bundle: result.nextBundle ? result.nextBundle.map(q => ({
        id: q.id,
        content: q.content,
        type: q.type,
        choices: q.choices,
        difficulty: q.difficulty,
        difficulty_name: q.difficulty_name,
        lesson_id: q.lesson_id
      })) : null
    });
  } catch (error) {
    console.error('Error continuing after supplementary review:', error);
    res.status(500).json({ error: 'Failed to continue after supplementary review' });
  }
});

// Generate mastery report
router.get('/sessions/:sessionId/report', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const report = optimizedAdaptiveLearningManager.generateMasteryReport(sessionId);
    
    res.json({
      success: true,
      report: report
    });
  } catch (error) {
    console.error('Error generating mastery report:', error);
    res.status(500).json({ error: 'Failed to generate mastery report' });
  }
});

// Get session progress
router.get('/sessions/:sessionId/progress', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = optimizedAdaptiveLearningManager.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const progress = {
      session_id: sessionId,
      current_state: session.current_state,
      current_difficulty: session.current_difficulty,
      total_questions: session.answers.length,
      correct_answers: session.answers.filter(a => a.is_correct).length,
      accuracy: session.answers.length > 0 ? 
        (session.answers.filter(a => a.is_correct).length / session.answers.length) * 100 : 0,
      weak_lessons: session.weak_lessons,
      tutor_sessions_count: session.tutor_sessions.length,
      mastery_map: session.mastery_map
    };
    
    res.json({
      success: true,
      progress: progress
    });
  } catch (error) {
    console.error('Error getting session progress:', error);
    res.status(500).json({ error: 'Failed to get session progress' });
  }
});

// Performance monitoring endpoints
router.get('/performance/stats', async (req, res) => {
  try {
    const stats = optimizedAdaptiveLearningManager.getPerformanceStats();
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Error getting performance stats:', error);
    res.status(500).json({ error: 'Failed to get performance stats' });
  }
});

// Clear caches endpoint (for development)
router.post('/performance/clear-caches', async (req, res) => {
  try {
    optimizedAdaptiveLearningManager.clearCaches();
    res.json({
      success: true,
      message: 'Caches cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing caches:', error);
    res.status(500).json({ error: 'Failed to clear caches' });
  }
});

export default router;
