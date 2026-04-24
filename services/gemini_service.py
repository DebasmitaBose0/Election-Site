"""
Google Gemini AI Service for the Electionant.
Provides conversational AI capabilities for answering election-related queries.
"""

import google.generativeai as genai
from config import Config
from services.civic_service import civic_service

# System prompt with strict election assistant rules
SYSTEM_PROMPT = """You are the official Electionant AI, a civic information chatbot specialized in INDIAN ELECTIONS ONLY.

CORE JURISDICTION RULE:
- Default jurisdiction is India.
- Assume all ambiguous election queries refer to India unless user explicitly names another country.
- Never substitute foreign election entities for Indian ones.
- Never confuse similarly named regions (example: West Bengal ≠ West Virginia, Georgia India context must not default to US state).
- If user explicitly asks about non-Indian elections, state that this assistant is restricted to Indian election information only.

LIVE ELECTION DATA RULE:
- If user message contains any of these triggers: "election", "vote", "voting", "poll", "polling", "election date", "schedule"
- You MUST check and prioritize the Live Civic API context provided in the prompt.
- For election dates, schedules, ongoing elections, or voter logistics: ALWAYS prioritize official Election Commission of India data.

SMART HONESTY RULE:
Do not immediately fall back to "The official schedule has not been announced yet". Use these four levels of logic:

Level 0 — General Political/Biographical Information:
If the user asks about a person (e.g., Narendra Modi), a political party, or historical election facts, use your extensive internal knowledge to provide a factual, neutral, and concise response. Do NOT use any "not announced" fallback for these questions.

Level 1 — Official Data Available (FROM CONTEXT):
If the provided CONTEXT INFORMATION contains verified official dates, phases, or candidate lists, provide them exactly as retrieved.

Level 2 — Official schedule unavailable, but verified contextual election information exists:
If Level 1 data is missing but you have contextual data (e.g., West Bengal due in 2026), provide:
- The election is due in [Year] based on assembly term expiry.
- Context about the current assembly (e.g., term expires in [Month/Year]).
- State that the specific polling dates are pending official ECI notification.

Level 3 — No reliable information exists for a schedule/date query:
Only for questions asking for a specific schedule where no data (Level 1 or 2) exists, use: "The official schedule has not been announced yet. Please verify through the Election Commission of India at voters.eci.gov.in."

COUNTRY FILTER RULE:
- Discard non-Indian election data automatically.
- Reject any retrieved source whose country is not India before generating an answer.

DISAMBIGUATION RULE:
- If a place name is ambiguous and could refer to multiple places (e.g., Georgia): ask a clarification question rather than assume incorrectly.

SAFETY RESPONSE PRIORITY:
1. Official ECI live data (Level 1)
2. Verified Contextual Indian data (Level 2)
3. Honest fallback (Level 3)

TIME AWARENESS RULE:
- Interpret “today”, “now”, “upcoming”, and “current” using the current runtime date provided in the context.
- Never use outdated schedules as current information.

RESPONSE STYLE:
- Be concise, factual, neutral, and civic-focused.
- ALWAYS cite "Source: Official ECI Data via Google Civic API" at the end for Level 1 info.
- For Level 2 info, frame it as "Expected Election Context" based on assembly tenures.
- Use bullet points for lists of candidates or representatives."""


class GeminiService:
    """Service class for Google Gemini AI interactions."""

    def __init__(self):
        """Initialize the Gemini and Civic services."""
        self.civic = civic_service
        self.reload_config()
        
        # Load Knowledge Bucket (Contextual Data)
        import json
        import os
        self.context_data = {}
        context_path = os.path.join('data', 'indian_states_context.json')
        if os.path.exists(context_path):
            with open(context_path, 'r') as f:
                self.context_data = json.load(f)

    def reload_config(self):
        """Reload configuration and detect all available models."""
        import os
        from dotenv import load_dotenv
        load_dotenv(override=True)
        
        api_key = os.getenv('GEMINI_API_KEY')
        self.configured = bool(api_key)
        
        if self.configured:
            try:
                genai.configure(api_key=api_key)
                
                # Auto-detect all available models and filter for text-supporting ones
                all_raw_models = genai.list_models()
                self.available_models = []
                
                for m in all_raw_models:
                    # Must support text generation and NOT be a TTS/Audio specialized model
                    if 'generateContent' in m.supported_generation_methods:
                        name = m.name.lower()
                        if '-tts' not in name and '-audio' not in name:
                            self.available_models.append(m.name)

                print(f"DEBUG: Filtered Available Models: {self.available_models}")
                
                if not self.available_models:
                    print("DEBUG: No suitable text models found!")
                    self.model = None
                    return

                # Define our preference order (Stable models first)
                preferences = [
                    'models/gemini-1.5-flash-8b', 
                    'models/gemini-1.5-flash', 
                    'models/gemini-1.5-pro',
                    'models/gemini-pro',
                    'models/gemini-2.0-flash-exp'
                ]
                
                # Filter available models based on our preferences
                self.priority_queue = [m for m in preferences if m in self.available_models]
                
                # Add any other available models EXCEPT problematic previews
                for m in self.available_models:
                    if m not in self.priority_queue and '2.5-flash' not in m:
                        self.priority_queue.append(m)

                # If we still have 2.5-flash models, put them at the very end as a last resort
                for m in self.available_models:
                    if '2.5-flash' in m and m not in self.priority_queue:
                        self.priority_queue.append(m)

                self.current_model_index = 0
                self._initialize_model()
                
            except Exception as e:
                print(f"DEBUG: Error during model detection: {e}")
                self.model = None

    def _initialize_model(self):
        """Initialize the model based on the current priority queue index."""
        if not self.priority_queue:
            return

        import os
        # Allow user to override and use a specific model from .env
        override_model = os.getenv('PREFERRED_GEMINI_MODEL')
        model_name = override_model if override_model and override_model in self.available_models else self.priority_queue[self.current_model_index]
        
        print(f"DEBUG: Initializing Gemini Model: {model_name}")
        
        # Check if the model likely supports system_instruction (Gemini 1.5+ usually does)
        supports_system_instruction = any(x in model_name.lower() for x in ['gemini-1.5', 'gemini-2.0', 'gemini-pro'])
        
        kwargs = {
            "model_name": model_name,
            "generation_config": genai.types.GenerationConfig(
                max_output_tokens=1024,
                temperature=0.7,
                top_p=0.9,
            ),
            "safety_settings": [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_LOW_AND_ABOVE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_LOW_AND_ABOVE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_LOW_AND_ABOVE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_LOW_AND_ABOVE"},
            ]
        }

        if supports_system_instruction:
            kwargs["system_instruction"] = SYSTEM_PROMPT
            self.uses_manual_system_prompt = False
        else:
            # Fallback for models like Gemma that don't support constructor system instructions
            self.uses_manual_system_prompt = True
            print(f"DEBUG: Model {model_name} doesn't support system_instruction. Will inject manually.")

        self.model = genai.GenerativeModel(**kwargs)

    def chat(self, message: str, history: list = None) -> dict:
        """Send a message to Gemini with automatic model fallback and Groq failover."""
        if not self.configured or not self.model:
            self.reload_config()

        try:
            return self._execute_chat(message, history)
        except Exception as e:
            error_msg = str(e)
            print(f"Gemini Error ({self.priority_queue[self.current_model_index]}): {error_msg}")
            
            # If we hit a quota (429) or model not found (404), try the next model
            if ('429' in error_msg or '404' in error_msg) and self.current_model_index < len(self.priority_queue) - 1:
                print(f"DEBUG: Quota hit on {self.priority_queue[self.current_model_index]}. Trying next model...")
                self.current_model_index += 1
                self._initialize_model()
                return self.chat(message, history)

            # If all Gemini models failed with 429, try Groq
            if '429' in error_msg:
                print("DEBUG: All Gemini models exhausted. Attempting Groq failover...")
                groq_result = self._try_groq(message, history)
                if groq_result:
                    return groq_result

                # If Groq also fails or is not configured
                import re
                seconds_match = re.search(r'retry_delay\s*{\s*seconds:\s*(\d+)', error_msg)
                wait_time = seconds_match.group(1) if seconds_match else "60"
                
                return {
                    'error': f'All Gemini models are busy. Please add a GROQ_API_KEY to your .env for instant fallback, or wait {wait_time} seconds.',
                    'response': None
                }
            
            # Safety block handling
            if 'SAFETY' in error_msg.upper():
                return {
                    'error': 'The response was blocked by safety filters. Please rephrase your question.',
                    'response': None
                }
            
            return {
                'error': f'Gemini API Error: {error_msg}',
                'response': None
            }

    def _try_groq(self, message: str, history: list = None) -> dict:
        """Fallback to Groq API if Gemini fails."""
        import requests
        import os
        api_key = os.getenv('GROQ_API_KEY')
        if not api_key:
            return None

        try:
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            # Build history for Groq (OpenAI format)
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            if history:
                for entry in history[-8:]:
                    role = "user" if entry.get('role') == 'user' else "assistant"
                    messages.append({"role": role, "content": entry.get('content', '')})
            
            messages.append({"role": "user", "content": message})

            payload = {
                "model": "llama-3.3-70b-versatile",
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 1024
            }

            response = requests.post(url, headers=headers, json=payload, timeout=10)
            if response.ok:
                data = response.json()
                return {
                    'response': data['choices'][0]['message']['content'],
                    'error': None,
                    'is_fallback': True
                }
            else:
                print(f"DEBUG: Groq API Error: {response.text}")
                return None
        except Exception as e:
            print(f"DEBUG: Groq Fallback Failed: {e}")
            return None

    def _get_civic_context(self, message: str) -> str:
        """Fetch real-time data from Google Civic API if needed."""
        # Expanded trigger keywords to ensure we capture all election-related queries
        trigger_keywords = [
            'representative', 'mla', 'mp', 'constituency', 'polling', 'candidate', 
            'who represents', 'election', 'vote', 'voting', 'date', 'schedule',
            'who are the', 'list of', 'contesting', 'ballot', 'ward', 'district'
        ]
        if not any(kw in message.lower() for kw in trigger_keywords):
            return ""

        # Try to find an address/location in the message
        import re
        location = "India" # Default
        
        # Check for "in [Location]"
        location_match = re.search(r'in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', message)
        if location_match:
            location = location_match.group(1)
        else:
            # Check for mention of specific Indian states directly with basic fuzzy matching
            indian_states = ['West Bengal', 'Maharashtra', 'Tamil Nadu', 'Karnataka', 'Uttar Pradesh', 'Bihar', 'Delhi', 'Gujarat', 'Rajasthan', 'Kerala']
            for state in indian_states:
                # Basic check for partial match or typo (must be at least 70% of the state name length)
                state_clean = state.lower()
                msg_clean = message.lower()
                if state_clean in msg_clean or (len(state_clean) > 4 and state_clean[:4] in msg_clean):
                    location = state
                    break
        
        print(f"DEBUG: Attempting Civic lookup for: {location}")
        
        context = ""
        
        # 1. Check for specific representatives
        civic_data = self.civic.get_representatives(location)
        if civic_data and not civic_data.get('error'):
            context += f"\nLIVE REPRESENTATIVES FOR {location}:\n"
            for rep in civic_data.get('data', [])[:5]:
                context += f"- {rep.get('office')}: {rep.get('name')} ({rep.get('party')})\n"
        
        # 2. Check for upcoming elections (India Only)
        election_data = self.civic.get_all_elections()
        if election_data and not election_data.get('error'):
            elections = election_data.get('data', [])
            # Filter for Indian elections only
            indian_keywords = ['india', 'in', 'west bengal', 'maharashtra', 'tamil nadu', 'delhi']
            indian_elections = [e for e in elections if 
                               any(kw in e.get('name', '').lower() for kw in indian_keywords) or 
                               'ocd-division/country:in' in e.get('ocdDivisionId', '').lower()]
            
            if indian_elections:
                context += f"\nCONFIRMED UPCOMING INDIAN ELECTIONS:\n"
                for e in indian_elections:
                    context += f"- {e.get('name')}: {e.get('electionDay')}\n"
            else:
                context += "\nNOTE: No official Indian election dates have been announced in the Civic API yet.\n"
        
        # 3. Add Contextual Knowledge Bucket data (Level 2)
        states_context = self.context_data.get('states', {})
        if location in states_context:
            info = states_context[location]
            context += f"\nVERIFIED CONTEXTUAL INFORMATION FOR {location}:\n"
            context += f"- Next Election Due: {info.get('next_election_due')}\n"
            context += f"- Status: {info.get('status')}\n"
            context += f"- Historical Context: {info.get('context')}\n"
            context += f"- Last Election: {info.get('last_election')}\n"
        elif location == "India":
            ls_info = self.context_data.get('national', {}).get('Lok Sabha', {})
            context += f"\nVERIFIED CONTEXTUAL INFORMATION FOR LOK SABHA:\n"
            context += f"- Next General Election: {ls_info.get('next_election_due')}\n"
            context += f"- Status: {ls_info.get('status')}\n"
            context += f"- Context: {ls_info.get('context')}\n"

        return context

    def _execute_chat(self, message: str, history: list = None) -> dict:
        """Internal method to execute the chat request."""
        chat_history = []
        
        # Inject Current Date for context
        import datetime
        now = datetime.datetime.now()
        current_date_info = f"TODAY'S DATE: {now.strftime('%B %d, %Y')}\n"
        
        # Get real-time context if applicable
        civic_context = self._get_civic_context(message)
        
        # Combine system instructions with current date and context
        full_system_context = f"{SYSTEM_PROMPT}\n\n{current_date_info}"
        if civic_context:
            full_system_context += f"\n{civic_context}"
            
        final_message = f"CONTEXT INFORMATION: {current_date_info}{civic_context}\n\nUSER QUESTION: {message}"
        
        # If the model doesn't support system instructions, prepend it to the history
        if getattr(self, 'uses_manual_system_prompt', False):
            chat_history.append({'role': 'user', 'parts': [f"SYSTEM INSTRUCTION: {full_system_context}\n\nPlease acknowledge this instruction and respond to the following query based on TODAY'S DATE and the provided context."]})
            chat_history.append({'role': 'model', 'parts': ["Understood. I am aware of the current date and will provide accurate election information accordingly."]})

        if history:
            # Only take the last 8 messages to keep the token count manageable
            for entry in history[-8:]:
                role = 'user' if entry.get('role') == 'user' else 'model'
                chat_history.append({'role': role, 'parts': [entry.get('content', '')]})

        chat = self.model.start_chat(history=chat_history)
        response = chat.send_message(final_message)

        # Reset model index on success so we always try the best model first next time
        self.current_model_index = 0

        return {
            'response': response.text,
            'error': None
        }


# Singleton instance
gemini_service = GeminiService()
