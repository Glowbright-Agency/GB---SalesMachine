interface ContactOutSearchParams {
  companyName: string
  title?: string
  location?: string
}

interface ContactOutPerson {
  id: string
  firstName: string
  lastName: string
  title: string
  company: string
  email?: string
  phone?: string
  linkedinUrl?: string
}

export class ContactOutClient {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.CONTACTOUT_API_KEY!
    this.baseUrl = 'https://api.contactout.com/v1'
  }

  async searchPeople(params: ContactOutSearchParams): Promise<ContactOutPerson[]> {
    try {
      const searchParams = new URLSearchParams({
        company: params.companyName,
        ...(params.title && { title: params.title }),
        ...(params.location && { location: params.location }),
        limit: '10'
      })

      const response = await fetch(`${this.baseUrl}/search/people?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`ContactOut API error: ${response.statusText}`)
      }

      const data = await response.json()
      
      return data.people.map((person: any) => ({
        id: person.id,
        firstName: person.first_name,
        lastName: person.last_name,
        title: person.title,
        company: person.company,
        email: person.email,
        phone: person.phone_numbers?.[0],
        linkedinUrl: person.linkedin_url
      }))
    } catch (error) {
      console.error('ContactOut search error:', error)
      return []
    }
  }

  async enrichCompanyContacts(companyName: string, targetRoles: string[]): Promise<ContactOutPerson[]> {
    const allContacts: ContactOutPerson[] = []

    // Search for each target role
    for (const role of targetRoles) {
      const contacts = await this.searchPeople({
        companyName,
        title: role
      })
      
      allContacts.push(...contacts)
      
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Remove duplicates based on email
    const uniqueContacts = allContacts.filter((contact, index, self) =>
      index === self.findIndex((c) => c.email === contact.email)
    )

    return uniqueContacts
  }

  async getContactDetails(contactId: string): Promise<ContactOutPerson | null> {
    try {
      const response = await fetch(`${this.baseUrl}/people/${contactId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`ContactOut API error: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        title: data.title,
        company: data.company,
        email: data.email,
        phone: data.phone_numbers?.[0],
        linkedinUrl: data.linkedin_url
      }
    } catch (error) {
      console.error('ContactOut get details error:', error)
      return null
    }
  }

  async enrichLead(lead: any, targetRoles: string[]): Promise<any> {
    const enrichedLead = { ...lead }
    
    try {
      // Search for decision makers at this company
      const contacts = await this.enrichCompanyContacts(
        lead.business_name,
        targetRoles
      )

      if (contacts.length > 0) {
        // Use the first contact as primary
        const primaryContact = contacts[0]
        
        enrichedLead.contact_name = `${primaryContact.firstName} ${primaryContact.lastName}`
        enrichedLead.contact_title = primaryContact.title
        enrichedLead.contact_email = primaryContact.email
        enrichedLead.contact_phone = primaryContact.phone || lead.phone
        enrichedLead.contact_linkedin = primaryContact.linkedinUrl
        
        // Store all contacts in enrichment data
        enrichedLead.enrichment_data = {
          ...enrichedLead.enrichment_data,
          contacts,
          enriched_at: new Date().toISOString(),
          primary_contact_id: primaryContact.id
        }
        
        enrichedLead.status = 'enriched'
      }
    } catch (error) {
      console.error('Lead enrichment error:', error)
      enrichedLead.enrichment_data = {
        ...enrichedLead.enrichment_data,
        error: (error as Error).message,
        failed_at: new Date().toISOString()
      }
    }
    
    return enrichedLead
  }

  async batchEnrichLeads(leads: any[], targetRoles: string[]): Promise<any[]> {
    const enrichedLeads = []
    
    // Process in batches to respect rate limits
    const batchSize = 5
    for (let i = 0; i < leads.length; i += batchSize) {
      const batch = leads.slice(i, i + batchSize)
      
      const enrichmentPromises = batch.map(lead => 
        this.enrichLead(lead, targetRoles)
      )
      
      const enrichedBatch = await Promise.all(enrichmentPromises)
      enrichedLeads.push(...enrichedBatch)
      
      // Delay between batches
      if (i + batchSize < leads.length) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    return enrichedLeads
  }
}