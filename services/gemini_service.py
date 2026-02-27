import google.generativeai as genai
from typing import Optional, List, Dict, Any
import base64
import os

API_KEY = os.getenv("GEMINI_API_KEY", "")

BASE_CLEAN_TEXT_INSTRUCTION = """
IMPORTANT: Do not use Markdown symbols like #, *, **, or _ in your response. 
Do not use labels like "The Text:", "The Explanation:", or "Explanation:". 
Present information in a clean, natural reading style. 
Use double line breaks between sections for clarity. 
If you need to list items, use simple numbering like 1. 2. 3. without any special characters around the numbers.
"""

def get_socratic_instruction(is_socratic: bool) -> str:
    base = "You are a Socratic Tutor. Never give the direct answer. Provide guidance and ask questions to lead the student to the answer." if is_socratic else "You are a helpful, direct study buddy."
    return base + BASE_CLEAN_TEXT_INSTRUCTION

def explain_concept(concept: str, image_base64: Optional[str] = None, socratic: bool = False) -> Dict[str, Any]:
    """Explain a concept using Gemini API"""
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        
        prompt = f"Explain this: {concept}"
        
        if image_base64:
            # Handle image if provided
            image_data = base64.standard_b64decode(image_base64.split(',')[1] if ',' in image_base64 else image_base64)
            response = model.generate_content([prompt, {"mime_type": "image/jpeg", "data": image_data}])
        else:
            response = model.generate_content(prompt)
        
        return {
            "text": response.text,
            "sources": []
        }
    except Exception as e:
        return {
            "text": f"Error: {str(e)}",
            "sources": []
        }

def summarize_text(text: str, length: str = "Medium") -> str:
    """Summarize text using Gemini API"""
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        
        length_instruction = {
            "Brief": "Provide a very concise summary (2-3 sentences)",
            "Medium": "Provide a moderate summary (1-2 paragraphs)",
            "Detailed": "Provide a detailed summary (3-4 paragraphs)"
        }
        
        prompt = f"{length_instruction.get(length, 'Provide a summary')} of the following text:\n\n{text}"
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"

def generate_quiz(topic: str, num_questions: int = 5, difficulty: str = "Medium") -> List[Dict[str, Any]]:
    """Generate quiz questions using Gemini API"""
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        
        prompt = f"""Generate {num_questions} multiple-choice quiz questions about {topic} at {difficulty} difficulty level.
        
        For each question, provide:
        1. Question text
        2. Four options (A, B, C, D)
        3. Correct answer
        4. Explanation
        
        Format as JSON array."""
        
        response = model.generate_content(prompt)
        import json
        try:
            return json.loads(response.text)
        except:
            return [{"question": response.text, "options": [], "correct": "A", "explanation": ""}]
    except Exception as e:
        return [{"question": f"Error: {str(e)}", "options": [], "correct": "A", "explanation": ""}]

def generate_flashcards(topic: str, num_cards: int = 10) -> List[Dict[str, str]]:
    """Generate flashcards using Gemini API"""
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        
        prompt = f"""Generate {num_cards} flashcards for studying {topic}.
        
        For each flashcard, provide:
        - front: The question or prompt
        - back: The answer or explanation
        
        Format as JSON array."""
        
        response = model.generate_content(prompt)
        import json
        try:
            return json.loads(response.text)
        except:
            return [{"front": topic, "back": response.text}]
    except Exception as e:
        return [{"front": topic, "back": f"Error: {str(e)}"}]

def analyze_document(file_content: str, analysis_type: str = "Summary") -> str:
    """Analyze document content using Gemini API"""
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        
        prompts = {
            "Summary": f"Provide a comprehensive summary of:\n\n{file_content}",
            "Key Points": f"List the main key points from:\n\n{file_content}",
            "Quiz Generation": f"Generate 5 quiz questions based on:\n\n{file_content}",
            "Explanation": f"Provide a detailed explanation of the concepts in:\n\n{file_content}"
        }
        
        prompt = prompts.get(analysis_type, f"Analyze:\n\n{file_content}")
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"

def generate_mnemonics(concept: str, mnemonic_type: str = "Acronym") -> str:
    """Generate mnemonics for a concept using Gemini API"""
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        
        type_prompts = {
            "Acronym": f"Create an acronym mnemonic for remembering {concept}",
            "Method of Loci": f"Create a Method of Loci (memory palace) for {concept}",
            "Rhyme": f"Create a rhyming mnemonic for {concept}",
            "Story": f"Create a memorable story to remember {concept}",
            "Association": f"Create word associations to remember {concept}"
        }
        
        prompt = type_prompts.get(mnemonic_type, f"Create a mnemonic for {concept}")
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"

def generate_story(topic: str, style: str = "Educational", audience: str = "Adults") -> str:
    """Generate an educational story using Gemini API"""
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        
        prompt = f"Write a {style} story about {topic} for {audience}. Make it engaging and educational."
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"
