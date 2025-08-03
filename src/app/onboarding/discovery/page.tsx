'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const discoveryQuestions = [
  {
    id: 'measurable_outcome',
    question: 'What specific measurable outcome does your solution deliver?',
    placeholder: 'e.g., We reduce invoice processing time by 73% while eliminating 95% of errors',
    hint: 'Include numbers, percentages, or timeframes'
  },
  {
    id: 'target_audience',
    question: 'Who exactly struggles with this problem most?',
    placeholder: 'e.g., CFOs at manufacturing companies with $50-200M revenue experiencing rapid growth',
    hint: 'Include title, company type, company size, and growth stage'
  },
  {
    id: 'key_differentiator',
    question: 'What\'s your key differentiator from current alternatives?',
    placeholder: 'e.g., Unlike traditional accounting software, we use AI to auto-categorize expenses with 99% accuracy',
    hint: 'Focus on unique approach, not just features'
  },
  {
    id: 'top_objections',
    question: 'What are your top 5 objections and proven responses?',
    placeholder: 'List common objections like "We already have a solution", "No budget", etc.',
    hint: 'Include objections and your best responses',
    multiline: true
  },
  {
    id: 'urgency_factors',
    question: 'What creates urgency for prospects to act now?',
    placeholder: 'e.g., New tax regulations in Q3 will result in average penalties of $50K for non-compliance',
    hint: 'Cost of inaction, upcoming deadlines, competitive pressure'
  },
  {
    id: 'success_story',
    question: 'What\'s your most powerful customer success story?',
    placeholder: 'Include company profile, problem, results, timeframe, and a quote',
    hint: 'Be specific with measurable results',
    multiline: true
  },
  {
    id: 'qualification_criteria',
    question: 'What 3 things MUST be true for someone to buy?',
    placeholder: 'e.g., 1) Problem costs them >$50K/year, 2) Budget authority, 3) Can implement within 90 days',
    hint: 'Your must-have qualification criteria',
    multiline: true
  }
]

export default function DiscoveryQuestionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const businessId = searchParams.get('businessId')
  
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiSuggesting, setAiSuggesting] = useState(false)
  const [businessAnalysis, setBusinessAnalysis] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!businessId) {
      router.push('/onboarding')
      return
    }

    // Load business analysis data from localStorage if available
    const analysisData = localStorage.getItem('businessAnalysis')
    if (analysisData) {
      try {
        setBusinessAnalysis(JSON.parse(analysisData))
      } catch (e) {
        console.error('Failed to parse business analysis:', e)
      }
    }
  }, [businessId, router])

  const handleAISuggestion = async () => {
    if (!businessAnalysis) return
    
    setAiSuggesting(true)
    setError(null)

    try {
      const response = await fetch('/api/ai-suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: discoveryQuestions[currentQuestion].id,
          question: discoveryQuestions[currentQuestion].question,
          businessAnalysis: businessAnalysis
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI suggestion')
      }

      // Set the AI-suggested answer
      handleAnswerChange(data.suggestion)
    } catch (err: any) {
      setError(err.message || 'Failed to get AI suggestion')
    } finally {
      setAiSuggesting(false)
    }
  }

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [discoveryQuestions[currentQuestion].id]: value
    }))
  }

  const handleNext = () => {
    if (currentQuestion < discoveryQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleComplete = async () => {
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user && businessId && !businessId.startsWith('test-business-')) {
        // Only try to save to database if user is authenticated and businessId is real
        const { error: updateError } = await supabase
          .from('businesses')
          .update({ discovery_answers: answers })
          .eq('id', businessId)

        if (updateError) {
          console.error('Database save error:', updateError)
          // Don't throw error, just log it and continue
        }
      }

      // Store answers in localStorage as backup for non-authenticated users
      localStorage.setItem('discoveryAnswers', JSON.stringify(answers))
      localStorage.setItem('businessId', businessId || '')

      // Redirect to register or campaign creation
      if (!user) {
        router.push('/register')
      } else {
        router.push(`/campaigns/new?businessId=${businessId}`)
      }
    } catch (err: any) {
      console.error('Save error:', err)
      // Don't show error to user, just continue
      router.push('/register')
    } finally {
      setLoading(false)
    }
  }

  const currentQ = discoveryQuestions[currentQuestion]
  const currentAnswer = answers[currentQ.id] || ''
  const isLastQuestion = currentQuestion === discoveryQuestions.length - 1

  return (
    <div className="min-h-screen bg-black">
      {/* Header with Logo and Navigation */}
      <header className="bg-black px-8 py-6">
        <div className="w-[96vw] mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/onboarding" className="flex items-center gap-3 cursor-pointer">
            <img src="/logo.svg" alt="Sales Machine" className="h-8 w-auto" />
          </Link>
          
          {/* Navigation Steps - Centered */}
          <nav className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">✓</span>
              <span className="text-sm font-medium text-green-400">Website Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">2</span>
              <span className="text-sm font-medium text-white">Sales Targets</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-gray-600 text-gray-300 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">3</span>
              <span className="text-sm font-medium text-gray-400">Sign Up</span>
            </div>
          </nav>

          {/* Don't Have Website Link */}
          <button
            onClick={() => router.push('/manual-setup')}
            className="text-gray-300 hover:text-white text-sm font-medium"
          >
            Don't Have A Website?
          </button>
        </div>
      </header>

      {/* Main Purple Container */}
      <main className="px-4" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
        <div className="rounded-3xl mx-4 min-h-[calc(100vh-140px)] flex items-center justify-center" style={{ backgroundColor: '#fcb3ce' }}>
          <div className="max-w-4xl w-full text-center px-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-black mb-2">
                <span>Question {currentQuestion + 1} of {discoveryQuestions.length}</span>
                <span>{Math.round(((currentQuestion + 1) / discoveryQuestions.length) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-2">
                <div 
                  className="bg-black h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / discoveryQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="border border-black rounded-2xl p-8 text-left">
            <h2 className="text-2xl font-bold text-black mb-2">
              {currentQ.question}
            </h2>
            <p className="text-black opacity-70 mb-4">{currentQ.hint}</p>

            {/* AI Suggestion Button */}
            {businessAnalysis && (
              <div className="mb-4">
                <button
                  onClick={handleAISuggestion}
                  disabled={aiSuggesting || loading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-black/20 text-black rounded-lg hover:bg-black/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="text-xs">✨</span>
                  {aiSuggesting ? 'Getting AI suggestion...' : 'Get AI Suggestion'}
                </button>
              </div>
            )}

            {currentQ.multiline ? (
              <textarea
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder={currentQ.placeholder}
                className="w-full px-4 py-3 border border-black/30 rounded-lg focus:ring-2 focus:ring-black focus:border-black resize-none bg-white text-black"
                rows={6}
                disabled={loading}
              />
            ) : (
              <input
                type="text"
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder={currentQ.placeholder}
                className="w-full px-4 py-3 border border-black/30 rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-white text-black"
                disabled={loading}
              />
            )}

            {error && (
              <div className="mt-4 text-red-600 text-sm">
                {error}
              </div>
            )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0 || loading}
                  className="px-6 py-3 text-black opacity-70 hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>

                {isLastQuestion ? (
                  <button
                    onClick={handleComplete}
                    disabled={!currentAnswer.trim() || loading}
                    className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Complete Setup'}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={!currentAnswer.trim() || loading}
                    className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>

            {/* Skip Option */}
            <div className="text-center mt-6">
              <button
                onClick={() => router.push(`/campaigns/new?businessId=${businessId}`)}
                className="text-black opacity-70 hover:opacity-100 text-sm"
              >
                Skip discovery questions (not recommended)
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}