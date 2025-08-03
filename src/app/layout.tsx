import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const roboto = Roboto({ 
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'GB Sales Machine',
  description: 'Automated B2B Lead Generation & Cold Calling',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        {children}
        <Script
          src="https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js"
          strategy="lazyOnload"
        />
        
        {/* Global VAPI Widget */}
        <vapi-widget
          public-key="f507d10a-cdb3-4df8-bb47-b6e64de7bc49"
          assistant-id="9ce58840-4dfe-420f-9e64-f2e17ec6a7e8"
          mode="voice"
          theme="dark"
          base-bg-color="#000000"
          accent-color="#CEB3FC"
          cta-button-color="#000000"
          cta-button-text-color="#ffffff"
          border-radius="large"
          size="compact"
          position="bottom-right"
          title="Talk with Jordan"
          start-button-text="Start"
          end-button-text="End Call"
          chat-first-message="Hey, How can I help you today?"
          chat-placeholder="Type your message..."
          voice-show-transcript="true"
          consent-required="true"
          consent-title="Terms and conditions"
          consent-content="By clicking 'Agree,' and each time I interact with this AI agent, I consent to the recording, storage, and sharing of my communications with third-party service providers, and as otherwise described in our Terms of Service."
          consent-storage-key="vapi_widget_consent"
        />
      </body>
    </html>
  )
}