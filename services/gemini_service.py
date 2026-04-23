"""
Google Gemini AI Service for the Electionant.
Provides conversational AI capabilities for answering election-related queries.
"""

import google.generativeai as genai
from config import Config

# System prompt with comprehensive election knowledge
SYSTEM_PROMPT = """You are an expert Electionant AI, specialized in helping citizens understand 
the democratic election process, with deep knowledge of the Indian electoral system.

Your role:
- Explain election processes, timelines, and procedures clearly
- Help users understand voter registration, voting methods, and election laws
- Provide factual, non-partisan information about the electoral system
- Guide users through complex election topics step by step
- Answer questions about the Election Commission, EVMs, VVPAT, and election procedures

Guidelines:
1. Always be factual and non-partisan - never favor any political party
2. If unsure, say so rather than providing incorrect information
3. Keep responses concise but comprehensive (under 300 words)
4. Use bullet points and structured formatting when helpful
5. Reference official sources like Election Commission of India (ECI) when relevant
6. Be encouraging about civic participation and voter awareness
7. Format responses using markdown for better readability

You have knowledge about:
- Indian General Elections (Lok Sabha), State Elections (Vidhan Sabha), and Local Body Elections
- Voter registration process (Form 6, EPIC card, e-EPIC)
- Voting process (EVMs, VVPAT, polling stations)
- Model Code of Conduct
- Election Commission of India and its role
- Postal ballots and absentee voting
- Election complaints and cVIGIL app
- NOTA (None of the Above)
- Electoral bonds and election funding
- Delimitation and reservation of constituencies
"""


class GeminiService:
    """Service class for Google Gemini AI interactions."""

    def __init__(self):
        """Initialize the Gemini service with API key."""
        self.configured = Config.is_gemini_configured()
        self.model = None
        if self.configured:
            genai.configure(api_key=Config.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(
                model_name='gemini-1.5-flash',
                system_instruction=SYSTEM_PROMPT,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=1024,
                    temperature=0.7,
                    top_p=0.9,
                ),
                safety_settings=[
                    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                ],
            )

    def chat(self, message: str, history: list = None) -> dict:
        """
        Send a message to Gemini and get a response.

        Args:
            message: User's question or message
            history: Previous conversation history

        Returns:
            dict with 'response' text or 'error' message
        """
        if not self.configured:
            return {
                'error': 'Gemini API is not configured. Please add your GEMINI_API_KEY to the .env file.',
                'response': None
            }

        try:
            # Build conversation history for context
            chat_history = []
            if history:
                for entry in history:
                    role = 'user' if entry.get('role') == 'user' else 'model'
                    chat_history.append({'role': role, 'parts': [entry.get('content', '')]})

            # Start chat with history
            chat = self.model.start_chat(history=chat_history)
            response = chat.send_message(message)

            return {
                'response': response.text,
                'error': None
            }

        except Exception as e:
            error_msg = str(e)
            print(f"Gemini Error: {error_msg}") # Log to console
            
            if 'SAFETY' in error_msg.upper():
                return {
                    'error': 'The response was blocked by safety filters. Please rephrase your question.',
                    'response': None
                }
            
            return {
                'error': f'Gemini API Error: {error_msg}',
                'response': None
            }


# Singleton instance
gemini_service = GeminiService()
