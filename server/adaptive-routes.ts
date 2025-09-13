import { Router } from 'express';
import { adaptiveLearningManager, Question, Answer, Session } from './adaptive-learning';
import { aiTutor, TutorContext, TutorSession } from './ai-tutor';

const router = Router();

// Create new learning session
router.post('/sessions', async (req, res) => {
  try {
    const { student_name, grade } = req.body;
    
    if (!student_name || !grade) {
      return res.status(400).json({ error: 'Student name and grade are required' });
    }

    const session = adaptiveLearningManager.createSession(student_name, grade);
    
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
    const session = adaptiveLearningManager.getSession(sessionId);
    
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

// Start initial bundle (N difficulty)
router.post('/sessions/:sessionId/start', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const bundle = adaptiveLearningManager.startBundle(sessionId, 'N');
    
    res.json({
      success: true,
      bundle: bundle.map(q => ({
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

    // Process state transition
    const result = await adaptiveLearningManager.processStateTransition(sessionId, answerObjects);
    
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
    
    const session = adaptiveLearningManager.getSession(sessionId);
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
    const tutorSession = await aiTutor.createTutorSession(tutorContext);
    
    // Store tutor session in main session
    session.tutor_sessions.push(tutorSession);
    adaptiveLearningManager.updateSession(sessionId, session);

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
    
    const session = adaptiveLearningManager.getSession(sessionId);
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
        max_steps: tutorSession.max_steps,
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
    
    const session = adaptiveLearningManager.getSession(sessionId);
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
    
    const session = adaptiveLearningManager.getSession(sessionId);
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

// Generate mastery report
router.get('/sessions/:sessionId/report', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const report = adaptiveLearningManager.generateMasteryReport(sessionId);
    
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
    const session = adaptiveLearningManager.getSession(sessionId);
    
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

export default router;
