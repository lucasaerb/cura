// Simple moderation guardrail for OpenAI Realtime API
export const moderationGuardrail = {
  name: 'moderation',
  description: 'Filters inappropriate content',
  
  // Simple content filtering function
  filter: (content: string): boolean => {
    // Basic keyword filtering - you can expand this
    const bannedWords = ['inappropriate', 'harmful', 'offensive'];
    const lowercaseContent = content.toLowerCase();
    
    return !bannedWords.some(word => lowercaseContent.includes(word));
  },
  
  // Handle moderation violations
  onViolation: (content: string, reason: string) => {
    console.warn('Content moderation triggered:', { content, reason });
    return 'I apologize, but I cannot respond to that request.';
  }
}; 