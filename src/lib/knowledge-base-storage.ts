/**
 * Knowledge Base Storage Manager
 * Handles temporary cookie-based session storage and migration to Supabase
 */

export interface KnowledgeBase {
  // Website Analysis
  businessName: string
  industry: string
  description: string
  valueProposition: string
  targetMarkets: any[]
  competitiveAdvantage: string
  targetCustomers?: Array<{
    type?: string
    description?: string
    painPoints?: string[]
    buyingMotivations?: string[]
  }>
  targetDecisionMakers?: Array<{
    title: string
    department?: string
    painPoints?: string[]
    priorities?: string[]
    communicationStyle?: string
  }>
  
  // Discovery Questions (7 critical questions)
  discoveryAnswers?: {
    measurable_outcome?: string
    target_audience?: string
    key_differentiator?: string
    top_objections?: string
    urgency_factors?: string
    success_story?: string
    qualification_criteria?: string
  }
  
  // Metadata
  websiteUrl?: string
  createdAt: string
  temporaryId: string
  isTemporary: boolean
}

const COOKIE_KEYS = {
  KNOWLEDGE_BASE: 'gb_knowledge_base',
  SESSION_ID: 'gb_session_id'
} as const

// Cookie options
const COOKIE_OPTIONS = {
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  httpOnly: false, // Allow client-side access
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/'
}

export class KnowledgeBaseStorage {
  
  /**
   * Set cookie with proper encoding
   */
  private static setCookie(name: string, value: string, options = COOKIE_OPTIONS): void {
    if (typeof document === 'undefined') return // Server-side guard
    
    const encoded = encodeURIComponent(value)
    let cookieString = `${name}=${encoded}`
    
    if (options.maxAge) cookieString += `; max-age=${options.maxAge / 1000}`
    if (options.path) cookieString += `; path=${options.path}`
    if (options.secure) cookieString += `; secure`
    if (options.sameSite) cookieString += `; samesite=${options.sameSite}`
    
    document.cookie = cookieString
  }
  
  /**
   * Get cookie value with proper decoding
   */
  private static getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null // Server-side guard
    
    const nameEQ = name + "="
    const ca = document.cookie.split(';')
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length))
      }
    }
    return null
  }
  
  /**
   * Save complete knowledge base to session cookies
   */
  static saveSession(knowledgeBase: Partial<KnowledgeBase>): string {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const completeKB: KnowledgeBase = {
      ...knowledgeBase,
      temporaryId: sessionId,
      createdAt: new Date().toISOString(),
      isTemporary: true,
      businessName: knowledgeBase.businessName || 'Unknown Business',
      industry: knowledgeBase.industry || 'Unknown Industry',
      description: knowledgeBase.description || '',
      valueProposition: knowledgeBase.valueProposition || '',
      targetMarkets: knowledgeBase.targetMarkets || [],
      competitiveAdvantage: knowledgeBase.competitiveAdvantage || ''
    }
    
    // Save to cookies (compressed JSON)
    try {
      const jsonData = JSON.stringify(completeKB)
      this.setCookie(COOKIE_KEYS.KNOWLEDGE_BASE, jsonData)
      this.setCookie(COOKIE_KEYS.SESSION_ID, sessionId)
      
      // Fallback to localStorage for large data
      if (jsonData.length > 4000) {
        console.warn('Knowledge base too large for cookies, using localStorage fallback')
        localStorage.setItem(COOKIE_KEYS.KNOWLEDGE_BASE, jsonData)
      }
      
      console.log('🍪 Knowledge Base saved to session:', sessionId)
      return sessionId
    } catch (error) {
      console.error('Failed to save knowledge base to cookies:', error)
      // Fallback to localStorage
      localStorage.setItem(COOKIE_KEYS.KNOWLEDGE_BASE, JSON.stringify(completeKB))
      return sessionId
    }
  }
  
  /**
   * Load knowledge base from session cookies
   */
  static loadSession(): KnowledgeBase | null {
    try {
      // Try cookies first
      const cookieData = this.getCookie(COOKIE_KEYS.KNOWLEDGE_BASE)
      if (cookieData) {
        const kb = JSON.parse(cookieData) as KnowledgeBase
        console.log('🍪 Knowledge Base loaded from session cookies:', kb.temporaryId)
        return kb
      }
      
      // Try localStorage fallback
      const localData = localStorage.getItem(COOKIE_KEYS.KNOWLEDGE_BASE)
      if (localData) {
        const kb = JSON.parse(localData) as KnowledgeBase
        console.log('📦 Knowledge Base loaded from localStorage fallback:', kb.temporaryId)
        return kb
      }
      
      // Try legacy localStorage
      return this.loadLegacy()
    } catch (error) {
      console.error('Failed to load session knowledge base:', error)
      return this.loadLegacy()
    }
  }
  
  /**
   * Load from legacy localStorage format (backwards compatibility)
   */
  static loadLegacy(): KnowledgeBase | null {
    try {
      const businessAnalysis = localStorage.getItem(STORAGE_KEYS.BUSINESS_ANALYSIS)
      const discoveryAnswers = localStorage.getItem(STORAGE_KEYS.DISCOVERY_ANSWERS)
      
      if (!businessAnalysis) return null
      
      const analysis = JSON.parse(businessAnalysis)
      const discovery = discoveryAnswers ? JSON.parse(discoveryAnswers) : {}
      
      const legacyKB: KnowledgeBase = {
        ...analysis,
        discoveryAnswers: discovery,
        temporaryId: localStorage.getItem(STORAGE_KEYS.BUSINESS_ID) || `legacy-${Date.now()}`,
        createdAt: new Date().toISOString(),
        isTemporary: true
      }
      
      console.log('📦 Knowledge Base loaded from legacy storage')
      return legacyKB
    } catch (error) {
      console.error('Failed to load legacy knowledge base:', error)
      return null
    }
  }
  
  /**
   * Update existing session knowledge base (merge new data)
   */
  static updateSession(updates: Partial<KnowledgeBase>): void {
    const existing = this.loadSession()
    if (!existing) {
      console.warn('No existing knowledge base found, creating new one')
      this.saveSession(updates)
      return
    }
    
    const updated: KnowledgeBase = {
      ...existing,
      ...updates,
      // Preserve session metadata
      temporaryId: existing.temporaryId,
      createdAt: existing.createdAt,
      isTemporary: true
    }
    
    // Save updated knowledge base
    const jsonData = JSON.stringify(updated)
    this.setCookie(COOKIE_KEYS.KNOWLEDGE_BASE, jsonData)
    
    if (jsonData.length > 4000) {
      localStorage.setItem(COOKIE_KEYS.KNOWLEDGE_BASE, jsonData)
    }
    
    console.log('🍪 Knowledge Base updated:', existing.temporaryId)
  }
  
  /**
   * Check if user has session knowledge base
   */
  static hasSession(): boolean {
    return this.getCookie(COOKIE_KEYS.KNOWLEDGE_BASE) !== null ||
           localStorage.getItem(COOKIE_KEYS.KNOWLEDGE_BASE) !== null ||
           localStorage.getItem('businessAnalysis') !== null // legacy
  }
  
  /**
   * Clear session storage (after successful migration to Supabase)
   */
  static clearSession(): void {
    // Remove cookies
    this.setCookie(COOKIE_KEYS.KNOWLEDGE_BASE, '', { ...COOKIE_OPTIONS, maxAge: 0 })
    this.setCookie(COOKIE_KEYS.SESSION_ID, '', { ...COOKIE_OPTIONS, maxAge: 0 })
    
    // Remove localStorage fallbacks
    localStorage.removeItem(COOKIE_KEYS.KNOWLEDGE_BASE)
    localStorage.removeItem('businessAnalysis') // legacy
    localStorage.removeItem('discoveryAnswers') // legacy
    localStorage.removeItem('businessId') // legacy
    
    console.log('🍪 Session knowledge base cleared')
  }
  
  /**
   * Get summary for UI display
   */
  static getSummary(): { hasData: boolean; businessName?: string; hasDiscovery?: boolean; sessionId?: string } {
    const kb = this.loadSession()
    if (!kb) return { hasData: false }
    
    return {
      hasData: true,
      businessName: kb.businessName,
      hasDiscovery: !!(kb.discoveryAnswers && Object.keys(kb.discoveryAnswers).length > 0),
      sessionId: kb.temporaryId
    }
  }
  
  /**
   * Migrate session data to Supabase (called after user creates account)
   */
  static async migrateToSupabase(userId: string): Promise<boolean> {
    const sessionData = this.loadSession()
    if (!sessionData) {
      console.warn('No session data to migrate')
      return false
    }
    
    try {
      // Call API to save to Supabase
      const response = await fetch('/api/knowledge-base/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          knowledgeBase: sessionData
        })
      })
      
      if (response.ok) {
        console.log('🍪 → 🗄️ Knowledge base migrated to Supabase')
        this.clearSession() // Clear session after successful migration
        return true
      } else {
        console.error('Failed to migrate knowledge base to Supabase')
        return false
      }
    } catch (error) {
      console.error('Error migrating knowledge base:', error)
      return false
    }
  }
}

export default KnowledgeBaseStorage