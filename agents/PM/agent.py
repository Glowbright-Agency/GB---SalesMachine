"""
Project Manager Agent (PM)
Coordinates all agents and maintains project documentation
"""

from datetime import datetime
from typing import Dict, List, Any
import json

class PMAgent:
    def __init__(self):
        self.name = "PM"
        self.role = "Project Manager & Coordinator"
        self.agents = ["FE", "BE", "AP", "VP", "QA", "AI"]
    
    def create_project_log_entry(self, agent: str, task: str, status: str, details: str = "") -> Dict:
        """Create a standardized log entry"""
        return {
            "timestamp": datetime.now().isoformat(),
            "agent": agent,
            "task": task,
            "status": status,
            "details": details,
            "id": f"{agent}_{datetime.now().timestamp()}"
        }
    
    def update_knowledge_base(self, section: str, content: str) -> str:
        """Generate knowledge base update"""
        return f"""
## {section} - Updated {datetime.now().strftime('%Y-%m-%d %H:%M')}

{content}

### Key Points:
- Document all decisions and rationale
- Include code examples where relevant
- Link to related documentation
- Tag responsible agents: {', '.join(['@' + a for a in self.agents])}

---
"""
    
    def create_sprint_plan(self, sprint_number: int, tasks: List[Dict]) -> str:
        """Create sprint planning document"""
        sprint_doc = f"""
# Sprint {sprint_number} Plan

**Duration**: 2 weeks
**Start Date**: {datetime.now().strftime('%Y-%m-%d')}
**Team**: {', '.join(self.agents)}

## Sprint Goals
1. Complete core functionality implementation
2. Achieve 80% test coverage
3. Deploy to staging environment

## Task Breakdown

| Task | Assigned To | Priority | Estimated Hours | Status |
|------|-------------|----------|-----------------|--------|
"""
        for task in tasks:
            sprint_doc += f"| {task['name']} | {task['agent']} | {task['priority']} | {task['hours']} | {task['status']} |\n"
        
        sprint_doc += """

## Daily Standup Template
- What did you complete yesterday?
- What will you work on today?
- Any blockers?

## Definition of Done
- [ ] Code complete and reviewed
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] QA approved
- [ ] Deployed to staging
"""
        return sprint_doc
    
    def create_task_template(self, task_type: str) -> Dict:
        """Create standardized task templates"""
        templates = {
            "feature": {
                "title": "[FEATURE] ",
                "description": """
## Overview
Brief description of the feature

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2

## Technical Approach
Describe implementation plan

## Acceptance Criteria
- [ ] User can...
- [ ] System should...

## Dependencies
- List any dependencies

## Assigned Agents
- Primary: 
- Support: 
""",
                "priority": "high",
                "estimated_hours": 8
            },
            "bug": {
                "title": "[BUG] ",
                "description": """
## Bug Description
What is happening?

## Steps to Reproduce
1. 
2. 

## Expected Behavior
What should happen?

## Actual Behavior
What actually happens?

## Environment
- Browser/OS: 
- Version: 

## Screenshots
Attach if applicable

## Assigned Agent
""",
                "priority": "critical",
                "estimated_hours": 4
            },
            "improvement": {
                "title": "[IMPROVEMENT] ",
                "description": """
## Current State
Describe current implementation

## Proposed Improvement
What should be changed?

## Benefits
- Performance improvement: 
- User experience: 
- Code quality: 

## Implementation Plan
1. 
2. 

## Assigned Agents
""",
                "priority": "medium",
                "estimated_hours": 6
            }
        }
        return templates.get(task_type, templates["feature"])
    
    def generate_status_report(self, period: str = "weekly") -> str:
        """Generate project status reports"""
        return f"""
# Project Status Report - {datetime.now().strftime('%Y-%m-%d')}

## Executive Summary
Project is progressing according to schedule with {period} milestones being met.

## Progress by Agent

### Frontend (FE)
- **Completed**: Dashboard UI, Component library
- **In Progress**: Real-time updates, Mobile responsiveness
- **Blockers**: None

### Backend (BE)
- **Completed**: API structure, Database schema
- **In Progress**: Background jobs, Caching layer
- **Blockers**: Waiting for API keys

### API Integration (AP)
- **Completed**: Apify setup, Rate limiting
- **In Progress**: ContactOut integration
- **Blockers**: API quota limits

### VAPI (VP)
- **Completed**: Assistant configuration
- **In Progress**: Call flows, A/B testing
- **Blockers**: Voice selection pending

### QA (QA)
- **Completed**: Test framework setup
- **In Progress**: E2E test suite
- **Blockers**: Test data generation

### AI (AI)
- **Completed**: Prompt templates
- **In Progress**: Response optimization
- **Blockers**: None

## Metrics
- **Tasks Completed**: 45/80 (56%)
- **Test Coverage**: 72%
- **Performance Score**: 94/100
- **Code Quality**: A

## Risks & Mitigation
1. **Risk**: API rate limits may slow development
   **Mitigation**: Implement caching and request batching

2. **Risk**: Voice AI quality concerns
   **Mitigation**: A/B test multiple voices and scripts

## Next Steps
1. Complete integration testing
2. Deploy to staging environment
3. Conduct user acceptance testing

## Resource Needs
- Additional API quota for testing
- Staging environment setup
- QA testing resources
"""
    
    def create_communication_template(self, comm_type: str) -> str:
        """Create communication templates"""
        templates = {
            "daily_standup": """
# Daily Standup - {date}

## Team Updates

### {agent_name}
**Yesterday**: 
**Today**: 
**Blockers**: 

## Action Items
- [ ] 
- [ ] 

## Notes
""",
            "retrospective": """
# Sprint Retrospective - Sprint {number}

## What Went Well
- 
- 

## What Could Be Improved
- 
- 

## Action Items for Next Sprint
1. 
2. 

## Team Feedback
""",
            "stakeholder_update": """
# Stakeholder Update - {date}

## Project Status: {status}

### Key Achievements This Period
1. 
2. 

### Upcoming Milestones
1. 
2. 

### Budget & Timeline
- Budget Status: On track / Over / Under
- Timeline Status: On schedule / Ahead / Behind

### Decisions Needed
1. 
2. 

### Risks & Issues
1. 
2. 

## Demo/Screenshots
[Attach relevant visuals]

## Next Meeting
Date: 
Agenda: 
"""
        }
        return templates.get(comm_type, "")
    
    def create_documentation_structure(self) -> Dict:
        """Create project documentation structure"""
        return {
            "README.md": "Project overview and quick start",
            "docs/": {
                "architecture.md": "System architecture and design decisions",
                "api-reference.md": "Complete API documentation",
                "deployment.md": "Deployment procedures and environments",
                "troubleshooting.md": "Common issues and solutions",
                "contributing.md": "Contribution guidelines"
            },
            "agents/": {
                "shared/": {
                    "knowledge.md": "Shared knowledge base",
                    "decisions.md": "Architecture decision records",
                    "glossary.md": "Project terminology"
                }
            },
            "logs/": {
                "sprints/": "Sprint logs and retrospectives",
                "daily/": "Daily standup notes",
                "incidents/": "Incident reports and post-mortems"
            }
        }