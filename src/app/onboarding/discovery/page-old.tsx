'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Hook to detect screen size
function useScreenSize() {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      if (width < 768) {
        setScreenSize('mobile')
      } else if (width < 1200) {
        setScreenSize('tablet')
      } else {
        setScreenSize('desktop')
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return screenSize
}

// Logo Component
function Logo() {
  return (
    <div className="h-8 sm:h-10 md:h-8 lg:h-9 w-auto flex-shrink-0">
      <svg
        className="block h-full w-auto"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 145 33"
      >
        <path d="M103.259 29.7883C101.893 29.7883 101 28.7568 101 27.4069V27.3942C101 26.1016 101.929 25 103.241 25C104.002 25 104.47 25.2229 104.919 25.624L104.452 26.2162C104.11 25.9105 103.775 25.7195 103.217 25.7195C102.39 25.7195 101.773 26.4772 101.773 27.3814V27.3942C101.773 28.362 102.378 29.0815 103.283 29.0815C103.709 29.0815 104.092 28.9351 104.362 28.7186V27.8208H103.223V27.1331H105.075V29.0688C104.644 29.4636 104.026 29.7883 103.259 29.7883Z" fill="var(--fill-0, #242424)"/>
        <path d="M106.033 29.8024V25.0303H106.77V29.0892H109.178V29.8024H106.033Z" fill="var(--fill-0, #242424)"/>
        <path d="M111.57 29.7883C110.233 29.7883 109.298 28.7058 109.298 27.4069V27.3942C109.298 26.0952 110.245 25 111.582 25C112.918 25 113.853 26.0825 113.853 27.3814V27.3942C113.853 28.6931 112.906 29.7883 111.57 29.7883ZM111.582 29.0688C112.463 29.0688 113.08 28.3238 113.08 27.4069V27.3942C113.08 26.4772 112.451 25.7195 111.57 25.7195C110.689 25.7195 110.071 26.4645 110.071 27.3814V27.3942C110.071 28.3111 110.701 29.0688 111.582 29.0688Z" fill="var(--fill-0, #242424)"/>
        <path d="M115.619 29.7883L114.062 25H114.885L115.951 28.5594L117.035 25H117.659L118.743 28.5594L119.81 25H120.577L119.055 29.7883H118.42L117.335 26.3626L116.249 29.7883H115.619Z" fill="var(--fill-0, #242424)"/>
        <path d="M121.553 29.7883V25H123.616C124.137 25 124.556 25.1513 124.816 25.421C125.025 25.638 125.127 25.8945 125.127 26.2168V26.23C125.127 26.8088 124.803 27.1179 124.46 27.3021C125 27.4928 125.387 27.8151 125.387 28.4663V28.4794C125.387 29.3279 124.708 29.7883 123.68 29.7883H121.553ZM124.352 26.3549V26.3418C124.352 25.9537 124.048 25.7169 123.514 25.7169H122.315V27.0324H123.457C123.991 27.0324 124.352 26.8088 124.352 26.3549ZM124.606 28.3808C124.606 27.9664 124.283 27.7164 123.629 27.7164H122.315V29.0714H123.686C124.257 29.0714 124.606 28.8346 124.606 28.3939V28.3808Z" fill="var(--fill-0, #242424)"/>
        <path d="M129.081 26.5588C129.081 27.381 128.244 27.381 127.647 27.381L129.093 29.7883H129.896L128.747 27.9598C129.414 27.7756 129.877 27.3021 129.877 26.5194V26.5062C129.877 26.0918 129.742 25.7301 129.498 25.4801C129.196 25.1776 128.734 25 128.15 25H126.136V29.7883H126.866V25.7301H128.086C128.708 25.7301 129.081 26.0261 129.081 26.5457V26.5588Z" fill="var(--fill-0, #242424)"/>
        <path d="M130.645 29.7883V25H131.364V29.7883H130.645Z" fill="var(--fill-0, #242424)"/>
        <path d="M134.372 29.7883C133.006 29.7883 132.113 28.7568 132.113 27.4069V27.3942C132.113 26.1016 133.042 25 134.354 25C135.116 25 135.583 25.2229 136.033 25.624L135.565 26.2162C135.224 25.9105 134.888 25.7195 134.33 25.7195C133.503 25.7195 132.886 26.4772 132.886 27.3814V27.3942C132.886 28.362 133.491 29.0815 134.396 29.0815C134.822 29.0815 135.206 28.9351 135.475 28.7186V27.8208H134.336V27.1331H136.188V29.0688C135.757 29.4636 135.14 29.7883 134.372 29.7883Z" fill="var(--fill-0, #242424)"/>
        <path d="M136.937 29.7883V25H137.656V27.0177H140.01V25H140.727V29.7883H140.01V27.7405H137.656V29.7883H136.937Z" fill="var(--fill-0, #242424)"/>
        <path d="M142.872 29.7883V25.7195H141.476V25H145V25.7195H143.609V29.7883H142.872Z" fill="var(--fill-0, #242424)"/>
        <path d="M18.8259 17.0648L5.55105 32.9042C5.38721 33.1001 5.12503 32.9701 5.18691 32.7414L8.8019 21.5385C9.39349 19.8638 8.14992 18.5461 6.73896 18.667L0.536163 19.1396C0.439078 19.1456 0.355918 19.0701 0.341354 18.9749C0.32315 18.856 0.407746 18.7699 0.501546 18.7553L18.205 16.0161C18.8352 15.9182 19.1936 16.6182 18.8259 17.0648Z" fill="var(--fill-0, #242424)"/>
        <path d="M0.148091 15.9352L13.4229 0.0957024C13.5868 -0.10014 13.8489 0.0297865 13.7871 0.258566L10.1721 11.4615C9.58048 13.1361 10.824 14.4538 12.235 14.3329L18.4378 13.8603C18.5349 13.8543 18.6181 13.9298 18.6326 14.025C18.6508 14.144 18.5662 14.2301 18.4724 14.2446L0.768989 16.9838C0.138787 17.0818 -0.219643 16.3818 0.148091 15.9352Z" fill="var(--fill-0, #242424)"/>
        <path d="M29.908 20.9734C28.4635 20.9734 27.1221 20.4681 26 19.4309L26.9544 18.2606C27.8573 19.0718 28.773 19.5239 29.9467 19.5239C30.9914 19.5239 31.6621 19.0186 31.6621 18.2606V18.234C31.6621 17.5293 31.2752 17.1436 29.5082 16.7181C27.4832 16.2261 26.374 15.6011 26.374 13.8324V13.8059C26.374 12.1702 27.7025 11.0266 29.5598 11.0266C30.9398 11.0266 32.0104 11.4388 32.9648 12.2367L32.1006 13.4734C31.2623 12.8085 30.411 12.4761 29.534 12.4761C28.5409 12.4761 27.9476 12.9947 27.9476 13.6596V13.6862C27.9476 14.4574 28.3861 14.8165 30.2305 15.2553C32.2296 15.7473 33.2356 16.492 33.2356 18.0745V18.1011C33.2356 19.8963 31.8556 20.9734 29.908 20.9734Z" fill="var(--fill-0, #242424)"/>
        <path d="M37.8814 17.0239H41.2349L39.5582 13.0346L37.8814 17.0239ZM34.6957 20.8404L38.8488 11.0931H40.3191L44.4593 20.8404H42.7955L41.8153 18.4867H37.3011L36.3208 20.8404H34.6957Z" fill="var(--fill-0, #242424)"/>
        <path d="M46.6013 20.8404V11.1596H48.1878V19.3511H53.1534V20.8404H46.6013Z" fill="var(--fill-0, #242424)"/>
        <path d="M55.3768 20.8404V11.1596H62.3158V12.6223H56.9504V15.2287H61.7096V16.6915H56.9504V19.3777H62.3803V20.8404H55.3768Z" fill="var(--fill-0, #242424)"/>
        <path d="M68.1337 20.9734C66.6892 20.9734 65.3478 20.4681 64.2257 19.4309L65.1801 18.2606C66.083 19.0718 66.9987 19.5239 68.1724 19.5239C69.2171 19.5239 69.8878 19.0186 69.8878 18.2606V18.234C69.8878 17.5293 69.5009 17.1436 67.7339 16.7181C65.709 16.2261 64.5997 15.6011 64.5997 13.8324V13.8059C64.5997 12.1702 65.9282 11.0266 67.7855 11.0266C69.1655 11.0266 70.2361 11.4388 71.1905 12.2367L70.3263 13.4734C69.488 12.8085 68.6367 12.4761 67.7597 12.4761C66.7666 12.4761 66.1733 12.9947 66.1733 13.6596V13.6862C66.1733 14.4574 66.6118 14.8165 68.4562 15.2553C70.4553 15.7473 71.4613 16.492 71.4613 18.0745V18.1011C71.4613 19.8963 70.0813 20.9734 68.1337 20.9734Z" fill="var(--fill-0, #242424)"/>
        <path d="M78.4537 20.8404V11.1596H80.1305L83.0453 15.8271L85.9731 11.1596H87.6498V20.8404H86.0763V13.7926L83.0582 18.4335H83.0067L80.0015 13.8191V20.8404H78.4537Z" fill="var(--fill-0, #242424)"/>
        <path d="M92.9654 17.0239H96.3189L94.6421 13.0346L92.9654 17.0239ZM89.7797 20.8404L93.9328 11.0931H95.4031L99.5433 20.8404H97.8795L96.8992 18.4867H92.385L91.4048 20.8404H89.7797Z" fill="var(--fill-0, #242424)"/>
        <path d="M105.452 21C102.718 21 100.68 18.8059 100.68 16.0266V16C100.68 13.2473 102.692 11 105.517 11C107.245 11 108.29 11.6117 109.193 12.5027L108.161 13.7128C107.413 12.9814 106.6 12.5027 105.504 12.5027C103.685 12.5027 102.344 14.0452 102.344 15.9734V16C102.344 17.9415 103.673 19.4973 105.504 19.4973C106.678 19.4973 107.426 19.0319 108.238 18.234L109.257 19.2979C108.277 20.3351 107.207 21 105.452 21Z" fill="var(--fill-0, #242424)"/>
        <path d="M111.519 20.8404V11.1596H113.105V15.2154H117.684V11.1596H119.27V20.8404H117.684V16.7314H113.105V20.8404H111.519Z" fill="var(--fill-0, #242424)"/>
        <path d="M122.287 20.8404V11.1596H123.873V20.8404H122.287Z" fill="var(--fill-0, #242424)"/>
        <path d="M126.903 20.8404V11.1596H128.361L133.494 17.9814V11.1596H135.055V20.8404H133.726L128.464 13.8324V20.8404H126.903Z" fill="var(--fill-0, #242424)"/>
        <path d="M137.997 20.8404V11.1596H144.936V12.6223H139.57V15.2287H144.329V16.6915H139.57V19.3777H145V20.8404H137.997Z" fill="var(--fill-0, #242424)"/>
      </svg>
    </div>
  )
}

// Navigation Step Component
function NavigationStep({ 
  number, 
  title, 
  isActive = false,
  isCompleted = false,
  isLast = false,
  size = 'medium'
}: { 
  number: number | string
  title: string 
  isActive?: boolean
  isCompleted?: boolean
  isLast?: boolean
  size?: 'small' | 'medium'
}) {
  const circleSize = size === 'small' ? 'w-5 h-5' : 'w-6 h-6'
  const textSize = size === 'small' ? 'text-xs sm:text-sm' : 'text-sm md:text-base'
  const numberSize = size === 'small' ? 'text-xs' : 'text-sm'

  return (
    <div className="flex items-center">
      <div className="flex items-center gap-2 md:gap-3">
        <div className={`${circleSize} rounded-full flex items-center justify-center ${
          isActive 
            ? 'bg-[#242424] text-white' 
            : isCompleted 
              ? 'bg-green-600 text-white'
              : 'bg-[#CFCFCF] text-[#242424]'
        }`}>
          <span className={`font-medium font-['Poppins'] ${numberSize}`}>
            {isCompleted ? '✓' : number}
          </span>
        </div>
        <span className={`text-[#242424] font-medium font-['Poppins'] capitalize tracking-wide ${textSize} ${
          isCompleted ? 'text-gray-600' : ''
        }`}>
          {title}
        </span>
      </div>
      {!isLast && (
        <div className="w-8 sm:w-10 md:w-14 h-0 border-t-2 border-dashed border-[#242424] mx-2 md:mx-4" />
      )}
    </div>
  )
}

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

  const screenSize = useScreenSize()

  const steps = [
    { title: "Website Analysis", isActive: false, isCompleted: true },
    { title: "Sales Targets", isActive: true, isCompleted: false },
    { title: "Sign Up", isActive: false, isCompleted: false }
  ]

  return screenSize === 'mobile' ? (
    // Mobile Layout
    <div className="bg-[#ffffff] h-screen flex flex-col px-2 py-3 m-[0px] mt-[12px] mr-[0px] mb-[0px] ml-[0px] px-[24px] py-[12px]" data-name="Mobile Layout">
      {/* Logo at top */}
      <header className="flex-shrink-0 flex justify-center mb-3">
        <Logo />
      </header>

      {/* Purple Container */}
      <main className="flex flex-col justify-center">
        <div className="bg-[#ceb3fc] rounded-3xl p-4 sm:p-6 mx-auto w-full h-[calc(100vh-160px)] flex flex-col justify-center mx-[0px] my-[8px]">
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-[#242424] mb-2 font-['Poppins']">
                <span>Question {currentQuestion + 1} of {discoveryQuestions.length}</span>
                <span>{Math.round(((currentQuestion + 1) / discoveryQuestions.length) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-[#ffffff] rounded-full h-2">
                <div 
                  className="bg-[#242424] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / discoveryQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6">
              <h2 className="text-lg font-bold text-[#242424] mb-2 font-['Poppins']">
                {currentQ.question}
              </h2>
              <p className="text-[rgba(71,71,71,1)] mb-4 text-sm font-['Poppins'] font-light">{currentQ.hint}</p>

              {/* AI Suggestion Button */}
              {businessAnalysis && (
                <div className="mb-4">
                  <button
                    onClick={handleAISuggestion}
                    disabled={aiSuggesting || loading}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-[#ceb3fc] text-[#242424] rounded-lg hover:bg-[#b8a0f0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-['Poppins']"
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
                  className="w-full px-4 py-3 border-0 border-b-2 border-[#242424] bg-transparent focus:border-[#242424] focus:outline-none resize-none font-['Poppins'] text-[rgba(108,102,109,0.8)]"
                  rows={4}
                  disabled={loading}
                />
              ) : (
                <input
                  type="text"
                  value={currentAnswer}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder={currentQ.placeholder}
                  className="w-full px-4 py-3 border-0 border-b-2 border-[#242424] bg-transparent focus:border-[#242424] focus:outline-none font-['Poppins'] text-[rgba(108,102,109,0.8)] placeholder:text-[rgba(108,102,109,0.6)]"
                  disabled={loading}
                />
              )}

              {error && (
                <div className="mt-4 text-red-600 text-sm font-['Poppins']">
                  {error}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0 || loading}
                  className="px-4 py-2 text-[#242424] hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-['Poppins'] text-sm"
                >
                  ← Previous
                </button>

                {isLastQuestion ? (
                  <button
                    onClick={handleComplete}
                    disabled={!currentAnswer.trim() || loading}
                    className="bg-[#242424] text-white px-6 py-2 rounded-full font-medium hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed font-['Poppins'] text-sm"
                  >
                    {loading ? 'Saving...' : 'Complete Setup'}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={!currentAnswer.trim() || loading}
                    className="bg-[#242424] text-white px-6 py-2 rounded-full font-medium hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed font-['Poppins'] text-sm"
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>

            {/* Skip Option */}
            <div className="text-center">
              <button
                onClick={() => router.push(`/campaigns/new?businessId=${businessId}`)}
                className="text-[#242424] hover:text-gray-700 text-sm font-['Poppins']"
              >
                Skip discovery questions (not recommended)
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="flex-shrink-0 mt-4 px-2 pb-2">
        <div className="flex items-center justify-center space-x-1 sm:space-x-2 overflow-x-auto">
          {steps.map((step, index) => (
            <NavigationStep
              key={index}
              number={index + 1}
              title={step.title}
              isActive={step.isActive}
              isCompleted={step.isCompleted}
              isLast={index === steps.length - 1}
              size="small"
            />
          ))}
        </div>
      </footer>
    </div>
  ) : (
    // Desktop Layout
    <div className="bg-[#ffffff] h-screen flex flex-col" data-name="Desktop Layout">
      {/* Header with Logo and Navigation */}
      <header className="flex-shrink-0 px-6 sm:px-8 lg:px-12 py-4 lg:py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Navigation - Hidden on tablet, shown on desktop */}
          <nav className="hidden xl:flex items-center justify-center">
            <div className="flex items-center space-x-1">
              {steps.map((step, index) => (
                <NavigationStep
                  key={index}
                  number={index + 1}
                  title={step.title}
                  isActive={step.isActive}
                  isCompleted={step.isCompleted}
                  isLast={index === steps.length - 1}
                />
              ))}
            </div>
          </nav>

          {/* Skip link */}
          <div className="hidden lg:block">
            <button
              onClick={() => router.push(`/campaigns/new?businessId=${businessId}`)}
              className="text-[#242424] text-sm lg:text-base xl:text-lg font-['Poppins'] font-medium tracking-wide whitespace-nowrap hover:text-gray-700"
            >
              Skip discovery questions
            </button>
          </div>
        </div>

        {/* Tablet Navigation */}
        <div className="xl:hidden mt-4 flex justify-center">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {steps.map((step, index) => (
              <NavigationStep
                key={index}
                number={index + 1}
                title={step.title}
                isActive={step.isActive}
                isCompleted={step.isCompleted}
                isLast={index === steps.length - 1}
                size={screenSize === 'tablet' ? 'small' : 'medium'}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Content with Purple Container */}
      <main className="flex-1 flex items-center justify-center px-3 sm:px-4 lg:px-6 min-h-0">
        <div className="bg-[#ceb3fc] rounded-3xl p-12 sm:p-16 lg:p-20 xl:p-24 w-[96vw] h-[calc(100vh-140px)] flex items-center justify-center">
          <div className="w-full max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-[#242424] mb-2 font-['Poppins']">
                <span>Question {currentQuestion + 1} of {discoveryQuestions.length}</span>
                <span>{Math.round(((currentQuestion + 1) / discoveryQuestions.length) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-[#ffffff] rounded-full h-2">
                <div 
                  className="bg-[#242424] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / discoveryQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-[#242424] mb-4 font-['Poppins'] tracking-wide">
                {currentQ.question}
              </h2>
              <p className="text-[rgba(71,71,71,1)] mb-6 text-lg font-['Poppins'] font-light tracking-wide">{currentQ.hint}</p>

              {/* AI Suggestion Button */}
              {businessAnalysis && (
                <div className="mb-6">
                  <button
                    onClick={handleAISuggestion}
                    disabled={aiSuggesting || loading}
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm bg-[#ceb3fc] text-[#242424] rounded-lg hover:bg-[#b8a0f0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-['Poppins'] font-medium tracking-wide"
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
                  className="w-full px-6 py-4 text-lg border-0 border-b-2 border-[#242424] bg-transparent focus:border-[#242424] focus:outline-none resize-none font-['Poppins'] text-[rgba(108,102,109,0.8)] placeholder:text-[rgba(108,102,109,0.6)] tracking-wide"
                  rows={6}
                  disabled={loading}
                />
              ) : (
                <input
                  type="text"
                  value={currentAnswer}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder={currentQ.placeholder}
                  className="w-full px-6 py-4 text-lg border-0 border-b-2 border-[#242424] bg-transparent focus:border-[#242424] focus:outline-none font-['Poppins'] text-[rgba(108,102,109,0.8)] placeholder:text-[rgba(108,102,109,0.6)] tracking-wide"
                  disabled={loading}
                />
              )}

              {error && (
                <div className="mt-4 text-red-600 text-sm font-['Poppins']">
                  {error}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0 || loading}
                  className="px-6 py-3 text-[#242424] hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-['Poppins'] tracking-wide"
                >
                  ← Previous
                </button>

                {isLastQuestion ? (
                  <button
                    onClick={handleComplete}
                    disabled={!currentAnswer.trim() || loading}
                    className="bg-[#242424] text-white px-8 py-3 rounded-full font-medium hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed font-['Poppins'] tracking-wide"
                  >
                    {loading ? 'Saving...' : 'Complete Setup'}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={!currentAnswer.trim() || loading}
                    className="bg-[#242424] text-white px-8 py-3 rounded-full font-medium hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed font-['Poppins'] tracking-wide"
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
                className="text-[#242424] hover:text-gray-700 text-sm font-['Poppins'] tracking-wide"
              >
                Skip discovery questions (not recommended)
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Footer for skip link */}
      <div className="lg:hidden text-center pb-4">
        <button
          onClick={() => router.push(`/campaigns/new?businessId=${businessId}`)}
          className="text-[#242424] text-sm font-['Poppins'] font-medium tracking-wide hover:text-gray-700"
        >
          Skip discovery questions
        </button>
      </div>
    </div>
  )
}