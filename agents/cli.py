#!/usr/bin/env python3
"""
Agent CLI - Simple interface to interact with all agents
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.orchestrator import orchestrator
import argparse
import json

def main():
    parser = argparse.ArgumentParser(description='GB SalesMachine Agent CLI')
    parser.add_argument('agent', choices=['FE', 'BE', 'AP', 'VP', 'QA', 'PM', 'AI', 'ALL'], 
                       help='Which agent to use (or ALL for orchestrator)')
    parser.add_argument('action', help='Action to perform')
    parser.add_argument('--data', '-d', type=json.loads, default={}, 
                       help='JSON data for the action')
    
    args = parser.parse_args()
    
    if args.agent == 'ALL':
        # Use orchestrator for multi-agent tasks
        result = orchestrator.delegate_task(args.action, args.data)
        print(json.dumps(result, indent=2))
    else:
        # Direct agent access
        if args.agent in orchestrator.agents:
            agent = orchestrator.agents[args.agent]
            
            if hasattr(agent, args.action):
                method = getattr(agent, args.action)
                result = method(**args.data)
                print(result)
            else:
                print(f"Agent {args.agent} doesn't have action: {args.action}")
                # List available actions
                methods = [m for m in dir(agent) if not m.startswith('_')]
                print(f"Available actions: {', '.join(methods)}")
        else:
            print(f"Agent {args.agent} not found")

if __name__ == "__main__":
    main()