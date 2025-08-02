import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect to onboarding as the main entry point
  redirect('/onboarding')
}