import * as React from "react"
import { cn } from "@/lib/utils"
import { QuestionCard } from "./question-card"
import { Heading, Text } from "./typography"

interface BusinessAnalysis {
  companyName?: string
  businessType?: string
  mainProduct?: string
  targetAudience?: string
  offerings?: string
  valueProposition?: string
  salesApproach?: string
  keyBenefits?: string
}

interface BusinessAnalysisCardProps extends React.HTMLAttributes<HTMLDivElement> {
  analysis: BusinessAnalysis
  isVisible?: boolean
}

const BusinessAnalysisCard = React.forwardRef<HTMLDivElement, BusinessAnalysisCardProps>(
  ({ analysis, isVisible = true, className, ...props }, ref) => {
    if (!isVisible || !analysis) return null

    return (
      <QuestionCard 
        ref={ref}
        className={cn("mb-8 border-l-4 border-[#242424]", className)}
        {...props}
      >
        <div className="space-y-4">
          <Heading variant="h3" className="text-[#242424] mb-4">
            Business Analysis Results
          </Heading>
          
          <div className="space-y-3">
            {analysis.companyName && (
              <Text variant="body" className="text-[#242424]">
                <span className="font-semibold">{analysis.companyName}</span> is a{' '}
                <span className="font-medium">{analysis.businessType || 'business'}</span> that provides{' '}
                <span className="font-medium">{analysis.mainProduct || 'products/services'}</span> to{' '}
                <span className="font-medium">{analysis.targetAudience || 'their target market'}</span>.
              </Text>
            )}

            {analysis.offerings && (
              <Text variant="body" className="text-[#242424]">
                They offer <span className="font-medium">{analysis.offerings}</span>.
              </Text>
            )}

            {analysis.valueProposition && (
              <Text variant="body" className="text-[#242424]">
                Their core value proposition is <span className="font-medium">{analysis.valueProposition}</span>.
              </Text>
            )}

            {analysis.salesApproach && (
              <Text variant="body" className="text-[#242424]">
                <span className="font-semibold">Sales Approach:</span> Focus on{' '}
                <span className="font-medium">{analysis.salesApproach}</span>, emphasizing{' '}
                <span className="font-medium">{analysis.keyBenefits || 'key benefits'}</span>.
              </Text>
            )}
          </div>
        </div>
      </QuestionCard>
    )
  }
)

BusinessAnalysisCard.displayName = "BusinessAnalysisCard"

export { BusinessAnalysisCard }
export type { BusinessAnalysis }