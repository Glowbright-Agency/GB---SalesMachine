"""
Agent Orchestrator
Coordinates all agents and manages task delegation
"""

import json
import importlib
from typing import Dict, List, Any, Optional
from datetime import datetime

class AgentOrchestrator:
    def __init__(self):
        self.agents = {}
        self.task_queue = []
        self.completed_tasks = []
        self.knowledge_base = {}
        
        # Load all agents
        self._load_agents()
    
    def _load_agents(self):
        """Dynamically load all agent modules"""
        agent_modules = {
            'FE': 'agents.FE.agent',
            'BE': 'agents.BE.agent',
            'AP': 'agents.AP.agent',
            'VP': 'agents.VP.agent',
            'QA': 'agents.QA.agent',
            'PM': 'agents.PM.agent',
            'AI': 'agents.AI.agent'
        }
        
        for agent_name, module_path in agent_modules.items():
            try:
                module = importlib.import_module(module_path)
                agent_class = getattr(module, f'{agent_name}Agent', None)
                if not agent_class:
                    # Try alternative naming
                    agent_class = getattr(module, f'{agent_name.title()}Agent', None)
                    if not agent_class:
                        agent_class = getattr(module, f'{agent_name}ExpertAgent', None)
                
                if agent_class:
                    self.agents[agent_name] = agent_class()
                    print(f"✅ Loaded agent: {agent_name}")
            except Exception as e:
                print(f"❌ Failed to load agent {agent_name}: {e}")
    
    def delegate_task(self, task_type: str, task_data: Dict) -> Dict:
        """Delegate task to appropriate agent(s)"""
        task_id = f"TASK_{datetime.now().timestamp()}"
        
        # Determine which agents to involve
        agent_mapping = {
            'create_frontend': ['FE'],
            'create_backend': ['BE'],
            'integrate_api': ['AP'],
            'setup_voice': ['VP'],
            'run_tests': ['QA'],
            'create_documentation': ['PM'],
            'optimize_ai': ['AI'],
            'full_feature': ['FE', 'BE', 'AP', 'QA'],
            'deploy': ['BE', 'QA', 'PM']
        }
        
        involved_agents = agent_mapping.get(task_type, [])
        
        task = {
            'id': task_id,
            'type': task_type,
            'data': task_data,
            'assigned_agents': involved_agents,
            'status': 'pending',
            'created_at': datetime.now().isoformat(),
            'results': {}
        }
        
        self.task_queue.append(task)
        
        # Process task
        return self._process_task(task)
    
    def _process_task(self, task: Dict) -> Dict:
        """Process a task through assigned agents"""
        task['status'] = 'in_progress'
        
        for agent_name in task['assigned_agents']:
            if agent_name in self.agents:
                agent = self.agents[agent_name]
                
                try:
                    # Call appropriate method on agent
                    result = self._execute_agent_task(agent, task)
                    task['results'][agent_name] = {
                        'status': 'completed',
                        'output': result,
                        'timestamp': datetime.now().isoformat()
                    }
                except Exception as e:
                    task['results'][agent_name] = {
                        'status': 'failed',
                        'error': str(e),
                        'timestamp': datetime.now().isoformat()
                    }
        
        task['status'] = 'completed'
        task['completed_at'] = datetime.now().isoformat()
        
        self.completed_tasks.append(task)
        self.task_queue.remove(task)
        
        # Update knowledge base
        self._update_knowledge_base(task)
        
        return task
    
    def _execute_agent_task(self, agent: Any, task: Dict) -> Any:
        """Execute specific task on agent"""
        task_type = task['type']
        task_data = task['data']
        
        # Map task types to agent methods
        method_mapping = {
            'create_component': 'create_component',
            'create_api_endpoint': 'create_api_endpoint',
            'create_api_client': 'create_api_client',
            'create_assistant_config': 'create_assistant_config',
            'create_playwright_test': 'create_playwright_test',
            'create_prompt_template': 'create_prompt_template'
        }
        
        method_name = method_mapping.get(task_type, task_type)
        
        if hasattr(agent, method_name):
            method = getattr(agent, method_name)
            return method(**task_data)
        else:
            raise AttributeError(f"Agent {agent.name} doesn't have method {method_name}")
    
    def get_agent_collaboration(self, agents: List[str], objective: str) -> Dict:
        """Coordinate multiple agents for complex tasks"""
        collaboration = {
            'objective': objective,
            'agents': agents,
            'workflow': [],
            'outputs': {}
        }
        
        # Define collaboration patterns
        if set(agents) == {'FE', 'BE', 'AP'}:
            # Full stack feature development
            collaboration['workflow'] = [
                {'agent': 'BE', 'task': 'Create API endpoints'},
                {'agent': 'AP', 'task': 'Integrate external APIs'},
                {'agent': 'FE', 'task': 'Create UI components'},
                {'agent': 'QA', 'task': 'Test integration'}
            ]
        elif set(agents) == {'VP', 'AI'}:
            # Voice AI optimization
            collaboration['workflow'] = [
                {'agent': 'AI', 'task': 'Generate optimized prompts'},
                {'agent': 'VP', 'task': 'Configure voice assistant'},
                {'agent': 'QA', 'task': 'Test voice flows'}
            ]
        
        return collaboration
    
    def _update_knowledge_base(self, task: Dict):
        """Update shared knowledge base with task results"""
        task_type = task['type']
        
        if task_type not in self.knowledge_base:
            self.knowledge_base[task_type] = []
        
        knowledge_entry = {
            'task_id': task['id'],
            'timestamp': task['completed_at'],
            'agents_involved': task['assigned_agents'],
            'success': all(r['status'] == 'completed' for r in task['results'].values()),
            'learnings': self._extract_learnings(task)
        }
        
        self.knowledge_base[task_type].append(knowledge_entry)
    
    def _extract_learnings(self, task: Dict) -> List[str]:
        """Extract learnings from completed task"""
        learnings = []
        
        # Analyze patterns in results
        for agent, result in task['results'].items():
            if result['status'] == 'failed':
                learnings.append(f"Error pattern in {agent}: {result.get('error', '')}")
            elif result['status'] == 'completed':
                learnings.append(f"Success pattern in {agent}: Task completed efficiently")
        
        return learnings
    
    def generate_project_status(self) -> Dict:
        """Generate overall project status"""
        return {
            'active_agents': list(self.agents.keys()),
            'tasks_in_queue': len(self.task_queue),
            'tasks_completed': len(self.completed_tasks),
            'success_rate': self._calculate_success_rate(),
            'agent_performance': self._calculate_agent_performance(),
            'recent_tasks': self.completed_tasks[-5:] if self.completed_tasks else []
        }
    
    def _calculate_success_rate(self) -> float:
        """Calculate overall task success rate"""
        if not self.completed_tasks:
            return 0.0
        
        successful_tasks = sum(
            1 for task in self.completed_tasks
            if all(r['status'] == 'completed' for r in task['results'].values())
        )
        
        return (successful_tasks / len(self.completed_tasks)) * 100
    
    def _calculate_agent_performance(self) -> Dict[str, Dict]:
        """Calculate performance metrics for each agent"""
        performance = {}
        
        for agent_name in self.agents.keys():
            tasks_assigned = 0
            tasks_completed = 0
            
            for task in self.completed_tasks:
                if agent_name in task['assigned_agents']:
                    tasks_assigned += 1
                    if task['results'].get(agent_name, {}).get('status') == 'completed':
                        tasks_completed += 1
            
            performance[agent_name] = {
                'tasks_assigned': tasks_assigned,
                'tasks_completed': tasks_completed,
                'success_rate': (tasks_completed / tasks_assigned * 100) if tasks_assigned > 0 else 0
            }
        
        return performance

# Create global orchestrator instance
orchestrator = AgentOrchestrator()

# Example usage functions
def create_full_feature(feature_name: str, description: str):
    """Create a full feature using multiple agents"""
    return orchestrator.delegate_task('full_feature', {
        'feature_name': feature_name,
        'description': description
    })

def setup_api_integration(api_name: str):
    """Set up a new API integration"""
    return orchestrator.delegate_task('integrate_api', {
        'service_name': api_name
    })

def run_full_test_suite():
    """Run complete test suite"""
    return orchestrator.delegate_task('run_tests', {
        'test_type': 'full_suite'
    })