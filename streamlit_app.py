import streamlit as st
from google import genai
import os
import json
import requests
from typing import Optional, List, Dict, Any

# Page configuration - MUST be first Streamlit command
st.set_page_config(
    page_title="OmniStudy - Your AI Learning Partner",
    page_icon="📚",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ─── API Keys from Streamlit Secrets ───
try:
    GEMINI_API_KEY = st.secrets["GEMINI_API_KEY"]
except Exception:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

try:
    FIREBASE_WEB_API_KEY = st.secrets["FIREBASE_WEB_API_KEY"]
except Exception:
    FIREBASE_WEB_API_KEY = os.getenv("FIREBASE_WEB_API_KEY", "")

# ─── Initialize Gemini Client ───
gemini_client = None
if GEMINI_API_KEY:
    try:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        st.error(f"Failed to initialize Gemini: {str(e)}")
else:
    st.error("GEMINI_API_KEY not found. Add it in Settings > Secrets.")

# ─── Gemini AI Helper Functions ───

def ai_generate(prompt: str) -> str:
    if not gemini_client:
        return "Error: Gemini API key not configured."
    try:
        response = gemini_client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"

def explain_concept(concept: str, socratic: bool = False) -> Dict[str, Any]:
    instruction = (
        "You are a Socratic Tutor. Never give the direct answer. Ask guiding questions."
        if socratic else "You are a helpful, direct study buddy."
    )
    prompt = f"{instruction}\n\nExplain this concept clearly:\n{concept}"
    return {"text": ai_generate(prompt), "sources": []}

def summarize_text(text: str, length: str = "Medium") -> str:
    length_map = {
        "Brief": "Provide a very concise summary (2-3 sentences)",
        "Medium": "Provide a moderate summary (1-2 paragraphs)",
        "Detailed": "Provide a detailed summary (3-4 paragraphs)"
    }
    prompt = f"{length_map.get(length, 'Summarize')} of the following text:\n\n{text}"
    return ai_generate(prompt)

def generate_quiz(topic: str, num_questions: int = 5, difficulty: str = "Medium") -> List[Dict]:
    prompt = f"""Generate {num_questions} multiple-choice quiz questions about "{topic}" at {difficulty} difficulty.
Return ONLY a valid JSON array. Each object must have: "question", "options" (array of 4 strings), "correct" (letter A-D), "explanation".
Do not include any text before or after the JSON array."""
    raw = ai_generate(prompt)
    try:
        clean = raw.strip()
        if clean.startswith("```"):
            clean = clean.split("\n", 1)[1].rsplit("```", 1)[0]
        return json.loads(clean)
    except Exception:
        return [{"question": raw, "options": ["A", "B", "C", "D"], "correct": "A", "explanation": "Could not parse quiz."}]

def generate_flashcards(topic: str, num_cards: int = 10) -> List[Dict[str, str]]:
    prompt = f"""Generate {num_cards} flashcards for studying "{topic}".
Return ONLY a valid JSON array. Each object must have "front" (question) and "back" (answer).
Do not include any text before or after the JSON array."""
    raw = ai_generate(prompt)
    try:
        clean = raw.strip()
        if clean.startswith("```"):
            clean = clean.split("\n", 1)[1].rsplit("```", 1)[0]
        return json.loads(clean)
    except Exception:
        return [{"front": topic, "back": raw}]

def analyze_document(content: str, analysis_type: str = "Summary") -> str:
    prompts = {
        "Summary": f"Provide a comprehensive summary of:\n\n{content}",
        "Key Points": f"List the main key points from:\n\n{content}",
        "Quiz Generation": f"Generate 5 quiz questions based on:\n\n{content}",
        "Explanation": f"Explain the concepts in:\n\n{content}"
    }
    return ai_generate(prompts.get(analysis_type, f"Analyze:\n\n{content}"))

def generate_mnemonics(concept: str, mnemonic_type: str = "Acronym") -> str:
    prompts = {
        "Acronym": f"Create an acronym mnemonic for remembering: {concept}",
        "Method of Loci": f"Create a Method of Loci (memory palace) for: {concept}",
        "Rhyme": f"Create a rhyming mnemonic for: {concept}",
        "Story": f"Create a memorable story to remember: {concept}",
        "Association": f"Create word associations to remember: {concept}"
    }
    return ai_generate(prompts.get(mnemonic_type, f"Create a mnemonic for: {concept}"))

def generate_story(topic: str, style: str = "Educational", audience: str = "Adults") -> str:
    return ai_generate(f"Write a {style} story about {topic} for {audience}. Make it engaging and educational.")

# ─── Firebase Auth (REST API) ───

def login_user(email: str, password: str):
    if not FIREBASE_WEB_API_KEY:
        st.error("Firebase API key not configured. Add FIREBASE_WEB_API_KEY in Secrets.")
        return
    try:
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_WEB_API_KEY}"
        resp = requests.post(url, json={"email": email, "password": password, "returnSecureToken": True})
        data = resp.json()
        if "error" in data:
            msg = data["error"].get("message", "Login failed")
            error_map = {
                "EMAIL_NOT_FOUND": "No account found with this email.",
                "INVALID_PASSWORD": "Incorrect password.",
                "INVALID_LOGIN_CREDENTIALS": "Invalid email or password.",
            }
            st.error(error_map.get(msg, f"Login failed: {msg}"))
            return
        st.session_state.user = {"email": data["email"], "name": data["email"].split("@")[0], "uid": data["localId"]}
        st.rerun()
    except Exception as e:
        st.error(f"Login error: {str(e)}")

def register_user(name: str, email: str, password: str):
    if not FIREBASE_WEB_API_KEY:
        st.error("Firebase API key not configured. Add FIREBASE_WEB_API_KEY in Secrets.")
        return
    try:
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={FIREBASE_WEB_API_KEY}"
        resp = requests.post(url, json={"email": email, "password": password, "returnSecureToken": True})
        data = resp.json()
        if "error" in data:
            msg = data["error"].get("message", "Registration failed")
            if "WEAK_PASSWORD" in msg:
                st.error("Password must be at least 6 characters.")
            elif msg == "EMAIL_EXISTS":
                st.error("Account already exists. Please login.")
            else:
                st.error(f"Registration failed: {msg}")
            return
        st.session_state.user = {"email": data["email"], "name": name, "uid": data["localId"]}
        st.rerun()
    except Exception as e:
        st.error(f"Registration error: {str(e)}")

def logout_user():
    st.session_state.user = None
    st.session_state.current_view = "dashboard"
    st.rerun()

# ─── Session State ───
if "user" not in st.session_state:
    st.session_state.user = None
if "current_view" not in st.session_state:
    st.session_state.current_view = "dashboard"
if "show_register" not in st.session_state:
    st.session_state.show_register = False

# ─── CSS Styling ───
st.markdown("""
<style>
    .main-header { font-size: 2.5rem; font-weight: bold; color: #4f46e5; margin-bottom: 0.5rem; }
    .subheader-text { font-size: 1.1rem; color: #6b7280; margin-bottom: 1.5rem; }
    .feature-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 0.75rem; margin-bottom: 1rem; }
    .feature-title { font-size: 1.2rem; font-weight: bold; margin-bottom: 0.3rem; }
</style>
""", unsafe_allow_html=True)

# ─── View Components ───

def render_dashboard(user):
    st.markdown('<div class="main-header">📚 Welcome to OmniStudy</div>', unsafe_allow_html=True)
    st.markdown(f'<div class="subheader-text">Hello, {user["name"]}! Your AI Learning Partner is Ready.</div>', unsafe_allow_html=True)
    features = [
        ("🤔 Explainer", "Get detailed explanations on any concept", "explainer"),
        ("📝 Summarizer", "Condense long texts into concise summaries", "summarizer"),
        ("📋 Quiz Maker", "Create custom quizzes to test your knowledge", "quiz"),
        ("🎴 Flashcards", "Study with interactive flashcards", "flashcards"),
        ("📄 Doc Study", "Upload and analyze documents", "doc_study"),
        ("💡 Mnemonics", "Generate memory aids for concepts", "mnemonic"),
        ("📖 Story Generator", "Learn through engaging narratives", "story"),
        ("🎯 Review Center", "Track your learning journey", "review_center"),
    ]
    cols = st.columns(2)
    for i, (title, desc, view) in enumerate(features):
        with cols[i % 2]:
            st.markdown(f'<div class="feature-card"><div class="feature-title">{title}</div>{desc}</div>', unsafe_allow_html=True)
            if st.button(f"Open {title.split(' ', 1)[1]}", key=f"btn_{view}", use_container_width=True):
                st.session_state.current_view = view
                st.rerun()

def render_explainer():
    st.header("🤔 Explainer")
    concept = st.text_input("Enter a concept to explain:")
    socratic_mode = st.checkbox("Use Socratic Method")
    if st.button("Explain", type="primary"):
        if concept:
            with st.spinner("Generating explanation..."):
                result = explain_concept(concept, socratic=socratic_mode)
                st.write(result.get("text", "No response"))
        else:
            st.warning("Please enter a concept.")
    if st.button("← Back to Dashboard"):
        st.session_state.current_view = "dashboard"
        st.rerun()

def render_summarizer():
    st.header("📝 Summarizer")
    text = st.text_area("Paste text to summarize:", height=200)
    length = st.select_slider("Summary length:", options=["Brief", "Medium", "Detailed"])
    if st.button("Summarize", type="primary"):
        if text:
            with st.spinner("Generating summary..."):
                st.subheader("Summary:")
                st.write(summarize_text(text, length))
        else:
            st.warning("Please enter text to summarize.")
    if st.button("← Back to Dashboard"):
        st.session_state.current_view = "dashboard"
        st.rerun()

def render_quiz_maker():
    st.header("📋 Quiz Maker")
    topic = st.text_input("Topic:")
    num_q = st.slider("Number of questions:", 1, 10, 5)
    difficulty = st.select_slider("Difficulty:", options=["Easy", "Medium", "Hard"])
    if st.button("Generate Quiz", type="primary"):
        if topic:
            with st.spinner("Generating quiz..."):
                quiz = generate_quiz(topic, num_q, difficulty)
                st.session_state.quiz = quiz
    if "quiz" in st.session_state and st.session_state.quiz:
        for i, q in enumerate(st.session_state.quiz, 1):
            with st.expander(f"Q{i}: {q.get('question', 'Question')}"):
                for opt in q.get("options", []):
                    st.write(f"  {opt}")
                st.success(f"Answer: {q.get('correct', 'N/A')}")
                st.info(f"Explanation: {q.get('explanation', '')}")
    if st.button("← Back to Dashboard"):
        st.session_state.current_view = "dashboard"
        st.rerun()

def render_flashcards():
    st.header("🎴 Flashcards")
    topic = st.text_input("Enter topic for flashcards:")
    num_cards = st.slider("Number of flashcards:", 5, 50, 10)
    if st.button("Generate Flashcards", type="primary"):
        if topic:
            with st.spinner("Generating flashcards..."):
                st.session_state.flashcards = generate_flashcards(topic, num_cards)
    if "flashcards" in st.session_state and st.session_state.flashcards:
        for i, card in enumerate(st.session_state.flashcards, 1):
            with st.expander(f"Card {i}: {card.get('front', 'Question')}"):
                st.write(card.get("back", "Answer"))
    if st.button("← Back to Dashboard"):
        st.session_state.current_view = "dashboard"
        st.rerun()

def render_doc_study():
    st.header("📄 Document Study")
    uploaded = st.file_uploader("Upload document (PDF or TXT):", type=["pdf", "txt"])
    if uploaded:
        st.success(f"Uploaded: {uploaded.name}")
        analysis_type = st.selectbox("Analysis type:", ["Summary", "Key Points", "Quiz Generation", "Explanation"])
        if st.button("Analyze Document", type="primary"):
            with st.spinner("Analyzing..."):
                content = uploaded.read().decode("utf-8", errors="ignore")
                st.write(analyze_document(content, analysis_type))
    if st.button("← Back to Dashboard"):
        st.session_state.current_view = "dashboard"
        st.rerun()

def render_mnemonic():
    st.header("💡 Mnemonic Generator")
    concept = st.text_input("Enter concept:")
    mtype = st.selectbox("Mnemonic type:", ["Acronym", "Method of Loci", "Rhyme", "Story", "Association"])
    if st.button("Generate Mnemonics", type="primary"):
        if concept:
            with st.spinner("Generating..."):
                st.write(generate_mnemonics(concept, mtype))
        else:
            st.warning("Please enter a concept.")
    if st.button("← Back to Dashboard"):
        st.session_state.current_view = "dashboard"
        st.rerun()

def render_story_generator():
    st.header("📖 Story Generator")
    topic = st.text_input("Enter topic for story:")
    style = st.selectbox("Story style:", ["Educational", "Adventure", "Mystery", "Fantasy", "Historical"])
    audience = st.selectbox("Target audience:", ["Kids", "Teens", "Adults", "Professionals"])
    if st.button("Generate Story", type="primary"):
        if topic:
            with st.spinner("Generating story..."):
                st.write(generate_story(topic, style, audience))
        else:
            st.warning("Please enter a topic.")
    if st.button("← Back to Dashboard"):
        st.session_state.current_view = "dashboard"
        st.rerun()

def render_review_center():
    st.header("🎯 Review Center")
    c1, c2, c3 = st.columns(3)
    c1.metric("Quizzes Completed", "12")
    c2.metric("Average Score", "87%")
    c3.metric("Study Streak", "5 days")
    st.subheader("Recent Activities")
    st.write("- Completed Biology Quiz (87%)")
    st.write("- Generated 20 History Flashcards")
    st.write("- Summarized 3 Documents")
    if st.button("← Back to Dashboard"):
        st.session_state.current_view = "dashboard"
        st.rerun()

# ─── Main App Router ───

if not st.session_state.user:
    _, center, _ = st.columns([1, 2, 1])
    with center:
        st.markdown('<div class="main-header">📚 OmniStudy</div>', unsafe_allow_html=True)
        st.markdown('<div class="subheader-text">Your AI Learning Partner</div>', unsafe_allow_html=True)
        if not st.session_state.show_register:
            st.subheader("Login")
            email = st.text_input("Email:")
            password = st.text_input("Password:", type="password")
            c1, c2 = st.columns(2)
            with c1:
                if st.button("Login", use_container_width=True, type="primary"):
                    if email and password:
                        login_user(email, password)
                    else:
                        st.error("Please enter email and password.")
            with c2:
                if st.button("Create Account", use_container_width=True):
                    st.session_state.show_register = True
                    st.rerun()
        else:
            st.subheader("Register")
            name = st.text_input("Full Name:")
            email = st.text_input("Email:")
            password = st.text_input("Password:", type="password")
            confirm = st.text_input("Confirm Password:", type="password")
            c1, c2 = st.columns(2)
            with c1:
                if st.button("Register", use_container_width=True, type="primary"):
                    if name and email and password and confirm:
                        if password != confirm:
                            st.error("Passwords do not match.")
                        elif len(password) < 6:
                            st.error("Password must be at least 6 characters.")
                        else:
                            register_user(name, email, password)
                    else:
                        st.error("Please fill all fields.")
            with c2:
                if st.button("Back to Login", use_container_width=True):
                    st.session_state.show_register = False
                    st.rerun()
else:
    with st.sidebar:
        st.markdown(f"### 👋 {st.session_state.user['name']}")
        st.divider()
        nav = {
            "📊 Dashboard": "dashboard",
            "🤔 Explainer": "explainer",
            "📝 Summarizer": "summarizer",
            "📋 Quiz Maker": "quiz",
            "🎴 Flashcards": "flashcards",
            "📄 Doc Study": "doc_study",
            "💡 Mnemonics": "mnemonic",
            "📖 Story Gen": "story",
            "🎯 Review": "review_center",
        }
        for label, view in nav.items():
            if st.button(label, use_container_width=True, key=f"nav_{view}"):
                st.session_state.current_view = view
                st.rerun()
        st.divider()
        if st.button("🚪 Logout", use_container_width=True):
            logout_user()

    views = {
        "dashboard": lambda: render_dashboard(st.session_state.user),
        "explainer": render_explainer,
        "summarizer": render_summarizer,
        "quiz": render_quiz_maker,
        "flashcards": render_flashcards,
        "doc_study": render_doc_study,
        "mnemonic": render_mnemonic,
        "story": render_story_generator,
        "review_center": render_review_center,
    }
    views.get(st.session_state.current_view, lambda: render_dashboard(st.session_state.user))()
