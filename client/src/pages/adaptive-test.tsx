import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import ProtectedRoute from '@/components/protected-route'
import { 
  adaptiveQuestionBank, 
  testConfig, 
  aiSupportContent,
  algebraTopics,
  type AdaptiveQuestion, 
  type TestSession 
} from '@/data/adaptive-test-data'
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Brain,
  Target,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  RotateCcw
} from 'lucide-react'
import { useLocation } from 'wouter'

type DifficultyLevel = 'recognition' | 'understanding' | 'application'
type TestPhase = 'intro' | 'testing' | 'ai_support' | 'results'

interface TestState {
  phase: TestPhase
  currentDifficulty: DifficultyLevel
  currentQuestions: AdaptiveQuestion[]
  currentQuestionIndex: number
  answers: Array<{
    questionId: string
    userAnswer: string
    isCorrect: boolean
    timeSpent: number
  }>
  failedLessons: number[]
  supplementaryQuestions: AdaptiveQuestion[]
  needsAISupport: boolean
  currentAITopic?: string
  startTime?: Date
}

const difficultyLabels = {
  recognition: 'Nhận biết',
  understanding: 'Thông hiểu', 
  application: 'Vận dụng'
}

const difficultyColors = {
  recognition: 'bg-green-100 text-green-800',
  understanding: 'bg-yellow-100 text-yellow-800',
  application: 'bg-red-100 text-red-800'
}

function AdaptiveTestContent() {
  const { user } = useAuth()
  const [, navigate] = useLocation()
  const [testState, setTestState] = useState<TestState>({
    phase: 'intro',
    currentDifficulty: 'recognition',
    currentQuestions: [],
    currentQuestionIndex: 0,
    answers: [],
    failedLessons: [],
    supplementaryQuestions: [],
    needsAISupport: false
  })
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date())
  const [showExplanation, setShowExplanation] = useState(false)

  // Initialize test with questions for current difficulty
  const initializeTest = () => {
    const questionsForDifficulty = adaptiveQuestionBank
      .filter(q => q.difficulty === testState.currentDifficulty)
      .slice(0, testConfig.questionsPerDifficulty)
    
    setTestState(prev => ({
      ...prev,
      phase: 'testing',
      currentQuestions: questionsForDifficulty,
      currentQuestionIndex: 0,
      startTime: new Date()
    }))
    setQuestionStartTime(new Date())
  }

  // Handle answer submission
  const handleAnswerSubmit = () => {
    if (!selectedAnswer) return

    const currentQuestion = testState.currentQuestions[testState.currentQuestionIndex]
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer
    const timeSpent = Date.now() - questionStartTime.getTime()

    const newAnswer = {
      questionId: currentQuestion.id,
      userAnswer: selectedAnswer,
      isCorrect,
      timeSpent
    }

    setTestState(prev => ({
      ...prev,
      answers: [...prev.answers, newAnswer]
    }))

    setShowExplanation(true)

    // Add failed lesson if answer is wrong
    if (!isCorrect) {
      setTestState(prev => ({
        ...prev,
        failedLessons: Array.from(new Set([...prev.failedLessons, currentQuestion.lesson]))
      }))
    }
  }

  // Move to next question or evaluate difficulty group
  const handleNextQuestion = () => {
    setShowExplanation(false)
    setSelectedAnswer('')
    
    const nextIndex = testState.currentQuestionIndex + 1
    
    if (nextIndex < testState.currentQuestions.length) {
      // Move to next question in current difficulty
      setTestState(prev => ({
        ...prev,
        currentQuestionIndex: nextIndex
      }))
      setQuestionStartTime(new Date())
    } else {
      // Evaluate current difficulty group
      evaluateDifficultyGroup()
    }
  }

  // Evaluate if user passed current difficulty group
  const evaluateDifficultyGroup = () => {
    const currentGroupAnswers = testState.answers.slice(-testConfig.questionsPerDifficulty)
    const correctCount = currentGroupAnswers.filter(a => a.isCorrect).length
    
    if (correctCount >= testConfig.passThreshold) {
      // Passed current difficulty, move to next
      moveToNextDifficulty()
    } else {
      // Failed, need supplementary questions
      generateSupplementaryQuestions()
    }
  }

  // Move to next difficulty level
  const moveToNextDifficulty = () => {
    const difficulties: DifficultyLevel[] = ['recognition', 'understanding', 'application']
    const currentIndex = difficulties.indexOf(testState.currentDifficulty)
    
    if (currentIndex < difficulties.length - 1) {
      const nextDifficulty = difficulties[currentIndex + 1]
      const questionsForNextDifficulty = adaptiveQuestionBank
        .filter(q => q.difficulty === nextDifficulty)
        .slice(0, testConfig.questionsPerDifficulty)
      
      setTestState(prev => ({
        ...prev,
        currentDifficulty: nextDifficulty,
        currentQuestions: questionsForNextDifficulty,
        currentQuestionIndex: 0,
        failedLessons: []
      }))
      setQuestionStartTime(new Date())
    } else {
      // Completed all difficulties
      setTestState(prev => ({ ...prev, phase: 'results' }))
    }
  }

  // Generate supplementary questions for failed lessons
  const generateSupplementaryQuestions = () => {
    const supplementary = adaptiveQuestionBank
      .filter(q => 
        q.difficulty === testState.currentDifficulty && 
        testState.failedLessons.includes(q.lesson)
      )
      .slice(0, testConfig.supplementaryQuestionsCount)
    
    if (supplementary.length > 0) {
      setTestState(prev => ({
        ...prev,
        currentQuestions: supplementary,
        currentQuestionIndex: 0,
        supplementaryQuestions: supplementary
      }))
      setQuestionStartTime(new Date())
    } else {
      // No supplementary questions available, activate AI support
      activateAISupport()
    }
  }

  // Activate AI support for failed topics
  const activateAISupport = () => {
    const currentQuestion = testState.currentQuestions[testState.currentQuestionIndex]
    setTestState(prev => ({
      ...prev,
      phase: 'ai_support',
      needsAISupport: true,
      currentAITopic: currentQuestion.topic
    }))
  }

  // Continue after AI support
  const continueAfterAISupport = () => {
    setTestState(prev => ({
      ...prev,
      phase: 'testing'
    }))
    
    // Reset failed questions for retry
    const failedQuestions = testState.currentQuestions.filter(q => {
      const userAnswer = testState.answers.find(a => a.questionId === q.id)
      return userAnswer && !userAnswer.isCorrect
    })
    
    if (failedQuestions.length > 0) {
      setTestState(prev => ({
        ...prev,
        currentQuestions: failedQuestions,
        currentQuestionIndex: 0
      }))
      setQuestionStartTime(new Date())
    }
  }

  // Calculate progress
  const calculateProgress = () => {
    const difficulties: DifficultyLevel[] = ['recognition', 'understanding', 'application']
    const currentDifficultyIndex = difficulties.indexOf(testState.currentDifficulty)
    const totalQuestions = difficulties.length * testConfig.questionsPerDifficulty
    const completedQuestions = currentDifficultyIndex * testConfig.questionsPerDifficulty + testState.currentQuestionIndex
    return (completedQuestions / totalQuestions) * 100
  }

  const currentQuestion = testState.currentQuestions[testState.currentQuestionIndex]

  // Intro Phase
  if (testState.phase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-blue-900 mb-4">
                Kiểm tra thích ứng - Đại số lớp 12
              </CardTitle>
              <div className="flex justify-center mb-6">
                <Brain className="h-16 w-16 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-green-800">15 câu hỏi</h3>
                    <p className="text-sm text-green-600">5 câu mỗi độ khó</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-blue-800">Thích ứng</h3>
                    <p className="text-sm text-blue-600">AI hỗ trợ khi cần</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-purple-800">5 bài học</h3>
                    <p className="text-sm text-purple-600">Đại số lớp 12</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="font-semibold text-yellow-800 mb-3 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Cách thức kiểm tra
                  </h3>
                  <div className="space-y-2 text-yellow-700">
                    <p>• Làm bài theo thứ tự: Nhận biết → Thông hiểu → Vận dụng</p>
                    <p>• Cần đúng ≥4/5 câu để chuyển độ khó tiếp theo</p>
                    <p>• Nếu chưa đạt, hệ thống sẽ cho câu hỏi bổ sung</p>
                    <p>• AI sẽ hỗ trợ giải thích khi cần thiết</p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button 
                    onClick={initializeTest}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
                    data-testid="button-start-test"
                  >
                    <Target className="mr-3" size={20} />
                    Bắt đầu kiểm tra
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // AI Support Phase  
  if (testState.phase === 'ai_support') {
    const topic = testState.currentAITopic
    const supportContent = topic ? aiSupportContent[topic] : null

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-purple-900 mb-4">
                <Lightbulb className="inline mr-3 h-8 w-8" />
                Hỗ trợ AI - {topic}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {supportContent && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-800 mb-4">📚 Lý thuyết</h3>
                    <div className="prose prose-sm text-blue-700 whitespace-pre-line">
                      {supportContent.theory}
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="font-semibold text-green-800 mb-4">💡 Ví dụ minh họa</h3>
                    <div className="prose prose-sm text-green-700 whitespace-pre-line">
                      {supportContent.example}
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button 
                      onClick={continueAfterAISupport}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 font-semibold rounded-xl"
                      data-testid="button-continue-after-ai"
                    >
                      <ArrowRight className="mr-2" size={18} />
                      Tiếp tục làm bài
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Results Phase
  if (testState.phase === 'results') {
    const totalQuestions = testState.answers.length
    const correctAnswers = testState.answers.filter(a => a.isCorrect).length
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100)

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-green-900 mb-4">
                <CheckCircle className="inline mr-3 h-10 w-10" />
                Hoàn thành kiểm tra!
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="text-6xl font-bold text-green-600">{accuracy}%</div>
                <p className="text-xl text-gray-700">
                  Bạn đã trả lời đúng {correctAnswers}/{totalQuestions} câu hỏi
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <Button 
                    onClick={() => navigate('/')}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 font-semibold rounded-xl"
                  >
                    Về trang chủ
                  </Button>
                  <Button 
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="px-6 py-3 font-semibold rounded-xl"
                  >
                    <RotateCcw className="mr-2" size={18} />
                    Làm lại
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Testing Phase
  if (!currentQuestion) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <Badge className={`px-3 py-1 ${difficultyColors[testState.currentDifficulty]}`}>
              {difficultyLabels[testState.currentDifficulty]}
            </Badge>
            <div className="text-sm text-gray-600">
              Câu {testState.currentQuestionIndex + 1}/{testState.currentQuestions.length}
            </div>
          </div>
          <Progress value={calculateProgress()} className="h-3" />
        </div>

        {/* Question Card */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {algebraTopics[`lesson${currentQuestion.lesson}` as keyof typeof algebraTopics]}
              </Badge>
              <div className="text-sm text-gray-500">ID: {currentQuestion.id}</div>
            </div>
            <CardTitle className="text-xl mt-4">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {!showExplanation ? (
              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAnswer(option)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedAnswer === option
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    data-testid={`option-${index}`}
                  >
                    <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </button>
                ))}
                
                <div className="flex justify-end mt-6">
                  <Button 
                    onClick={handleAnswerSubmit}
                    disabled={!selectedAnswer}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 font-semibold rounded-xl"
                    data-testid="button-submit-answer"
                  >
                    Xác nhận
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Show result */}
                <div className={`p-4 rounded-lg flex items-center ${
                  selectedAnswer === currentQuestion.correctAnswer
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  {selectedAnswer === currentQuestion.correctAnswer ? (
                    <>
                      <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                      <span className="font-semibold text-green-800">Chính xác!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-6 w-6 text-red-600 mr-3" />
                      <span className="font-semibold text-red-800">
                        Sai rồi. Đáp án đúng là: {currentQuestion.correctAnswer}
                      </span>
                    </>
                  )}
                </div>

                {/* Explanation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Giải thích:</h4>
                  <p className="text-blue-700">{currentQuestion.explanation}</p>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleNextQuestion}
                    className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-6 py-3 font-semibold rounded-xl"
                    data-testid="button-next-question"
                  >
                    {testState.currentQuestionIndex < testState.currentQuestions.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành'}
                    <ArrowRight className="ml-2" size={18} />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AdaptiveTest() {
  return (
    <ProtectedRoute>
      <AdaptiveTestContent />
    </ProtectedRoute>
  )
}