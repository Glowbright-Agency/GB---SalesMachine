"""
Front End Developer Agent (FE)
Handles all frontend development tasks
"""

class FEAgent:
    def __init__(self):
        self.name = "FE"
        self.role = "Front End Developer"
        
    def create_component(self, component_name, component_type="functional"):
        """Create a new React component"""
        template = self._get_component_template(component_type)
        return template.format(name=component_name)
    
    def setup_next_app(self):
        """Initialize a Next.js application with best practices"""
        return {
            "commands": [
                "npx create-next-app@latest . --typescript --tailwind --app",
                "npm install @supabase/auth-helpers-nextjs",
                "npm install @tanstack/react-query",
                "npm install framer-motion"
            ],
            "structure": {
                "app/": "App router pages",
                "components/": "Reusable components",
                "lib/": "Utility functions",
                "hooks/": "Custom React hooks",
                "styles/": "Global styles"
            }
        }
    
    def create_dashboard_layout(self):
        """Create a dashboard layout for the sales system"""
        return """
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Header />
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
"""
    
    def _get_component_template(self, component_type):
        templates = {
            "functional": """
import React from 'react'

interface {name}Props {{
  // Define props here
}}

export const {name}: React.FC<{name}Props> = (props) => {{
  return (
    <div>
      {{/* Component content */}}
    </div>
  )
}}
""",
            "page": """
export default function {name}Page() {{
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">{name}</h1>
      {{/* Page content */}}
    </div>
  )
}}
"""
        }
        return templates.get(component_type, templates["functional"])