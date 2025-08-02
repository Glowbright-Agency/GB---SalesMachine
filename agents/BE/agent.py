"""
Back End Developer Agent (BE)
Handles all backend development tasks
"""

from typing import Dict, List
import json

class BEAgent:
    def __init__(self):
        self.name = "BE"
        self.role = "Back End Developer"
    
    def create_api_endpoint(self, method: str, path: str, handler_name: str):
        """Create an API endpoint with proper structure"""
        return f"""
// {path.replace('/', '_')}.ts
import {{ NextRequest, NextResponse }} from 'next/server'
import {{ createClient }} from '@/lib/supabase/server'

export async function {method}(request: NextRequest) {{
  try {{
    const supabase = createClient()
    
    // Authentication check
    const {{ data: {{ user }} }} = await supabase.auth.getUser()
    if (!user) {{
      return NextResponse.json({{ error: 'Unauthorized' }}, {{ status: 401 }})
    }}
    
    // Handler logic here
    
    return NextResponse.json({{ success: true }})
  }} catch (error) {{
    console.error('{handler_name} error:', error)
    return NextResponse.json(
      {{ error: 'Internal server error' }}, 
      {{ status: 500 }}
    )
  }}
}}
"""
    
    def create_database_schema(self, table_name: str, fields: List[Dict]):
        """Generate SQL for creating a database table"""
        field_definitions = []
        for field in fields:
            field_def = f"{field['name']} {field['type']}"
            if field.get('primary_key'):
                field_def += " PRIMARY KEY"
            if field.get('not_null'):
                field_def += " NOT NULL"
            if field.get('default'):
                field_def += f" DEFAULT {field['default']}"
            field_definitions.append(field_def)
        
        fields_str = ',\n  '.join(field_definitions)
        sql = f"""
CREATE TABLE IF NOT EXISTS {table_name} (
  {fields_str}
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_{table_name}_created_at ON {table_name}(created_at);
"""
        return sql
    
    def create_service_class(self, service_name: str):
        """Create a service class for business logic"""
        return f"""
// services/{service_name.lower()}Service.ts
import {{ createClient }} from '@/lib/supabase/server'

export class {service_name}Service {{
  private supabase
  
  constructor() {{
    this.supabase = createClient()
  }}
  
  async getAll(filters = {{}}) {{
    const query = this.supabase
      .from('{service_name.lower()}s')
      .select('*')
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {{
      query.eq(key, value)
    }})
    
    const {{ data, error }} = await query
    if (error) throw error
    return data
  }}
  
  async getById(id: string) {{
    const {{ data, error }} = await this.supabase
      .from('{service_name.lower()}s')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }}
  
  async create(data: any) {{
    const {{ data: result, error }} = await this.supabase
      .from('{service_name.lower()}s')
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    return result
  }}
  
  async update(id: string, data: any) {{
    const {{ data: result, error }} = await this.supabase
      .from('{service_name.lower()}s')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return result
  }}
  
  async delete(id: string) {{
    const {{ error }} = await this.supabase
      .from('{service_name.lower()}s')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return {{ success: true }}
  }}
}}
"""
    
    def create_background_job(self, job_name: str):
        """Create a background job processor"""
        return f"""
// jobs/{job_name.lower()}.ts
import {{ CronJob }} from 'cron'

export const {job_name.lower()}Job = new CronJob(
  '0 */15 * * * *', // Every 15 minutes
  async function() {{
    console.log('Running {job_name} job...')
    
    try {{
      // Job logic here
      
      console.log('{job_name} job completed successfully')
    }} catch (error) {{
      console.error('{job_name} job failed:', error)
    }}
  }},
  null,
  true,
  'America/New_York'
)
"""