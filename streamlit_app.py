import streamlit as st
from google import genai
import os
import requests
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# Page configuration
st.set_page_config(
    page_title="OmniStudy - Your AI Learning Partner",
    page_icon="📚",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize Gemini - API key from Streamlit secrets or environment variable
try:
    GEMINI_API_KEY = st.secrets["GEMINI_API_KEY"]
except Exception:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
else:
    client = None
    st.error("⚠️ GEMINI_API_KEY not found. Please add it in Streamlit Secrets or .env file.")

# CSS styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: bold;
        color: #4f46e5;
        margin-bottom: 0.5rem;
    }
    .subheader-text {
        font-size: 1.1rem;
        color: #6b7280;
        margin-bottom: 1.5rem;
    }
    .feature-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.5rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
    }
    .feature-title {
        font-size: 1.3rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
    }
</style>
""", unsafe_allow_html=True)

# Session state management
if "user" not in st.session_state:
    st.session_state.user = None
if "current_view" not in st.session_state:
    st.session_state.current_view = "dashboard"
if "show_register" not in st.session_state:
    st.session_state.show_register = False

# Firebase Web API Key (for REST API authentication)
try:
    FIREBASE_WEB_API_KEY = st.secrets["FIREBASE_WEB_API_KEY"]
except Exception:
    FIREBASE_WEB_API_KEY = os.getenv("FIREBASE_WEB_API_KEY", "")

# Authentication functions using Firebase REST API
def login_user(email, password):
    try:
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_WEB_API_KEY}"
        payload = {
            "email": email,
            "password": password,
            "returnSecureToken": True
        }
        response = requests.post(url, json=payload)
        data = response.json()
        
        if "error" in data:
            error_msg = data["error"].get("message", "Login failed")
            if error_msg == "EMAIL_NOT_FOUND":
                st.error("No account found with this email. Please register first.")
            elif error_msg == "INVALID_PASSWORD":
                st.error("Incorrect password. Please try again.")
            elif error_msg == "INVALID_LOGIN_CREDENTIALS":
                st.error("Invalid email or password. Please try again.")
            else:
                st.error(f"Login failed: {error_msg}")
            return
        
        st.session_state.user = {
            "email": data["email"],
            "name": data["email"].split("@")[0],
            "uid": data["localId"]
        }
        st.success("✅ Login successful!")
        st.rerun()
    except Exception as e:
        st.error(f"Login failed: {str(e)}")

def register_user(name, email, password):
    try:
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={FIREBASE_WEB_API_KEY}"
        payload = {
            "email": email,
            "password": password,
            "returnSecureToken": True
        }
        response = requests.post(url, json=payload)
        data = response.json()
        
        if "error" in data:
            error_msg = data["error"].get("message", "Registration failed")
            if error_msg == "EMAIL_EXISTS":
                st.error("An account with this email already exists. Please login.")
            elif "WEAK_PASSWORD" in error_msg:
                st.error("Password must be at least 6 characters.")
            else:
                st.error(f"Registration failed: {error_msg}")
            return
        
        st.session_state.user = {
            "email": data["email"],
            "name": name,
            "uid": data["localId"]
        }
        st.success("✅ Account created successfully!")
        st.rerun()
    except Exception as e:
        st.error(f"Registration failed: {str(e)}")

def logout_user():
    st.session_state.user = None
    st.session_state.current_view = "dashboard"
    st.rerun()

# View components
def render_dashboard(user):
    st.markdown('<div class="main-header">📚 Welcome to OmniStudy</div>', unsafe_allow_html=True)
    st.markdown(f'<div class="subheader-text">Hello, {user["name"]}! Your AI Learning Partner is Ready</div>', unsafe_allow_html=True)
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown('<div class="feature-card"><div class="feature-title">🤔 Explainer</div>Get detailed explanations on any concept using Socratic methods</div>', unsafe_allow_html=True)
        if st.button("Open Explainer", key="explainer_btn", use_container_width=True):
            st.session_state.current_view = "explainer"
            st.rerun()
    
    with col2:
        st.markdown('<div class="feature-card"><div class="feature-title">📝 Summarizer</div>Condense long texts into concise, digestible summaries</div>', unsafe_allow_html=True)
        if st.button("Open Summarizer", key="summarizer_btn", use_container_width=True):
            st.session_state.current_view = "summarizer"
            st.rerun()
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown('<div class="feature-card"><div class="feature-title">📋 Quiz Maker</div>Create and take custom quizzes to test your knowledge</div>', unsafe_allow_html=True)
        if st.button("Open Quiz Maker", key="quiz_btn", use_container_width=True):
            st.session_state.current_view = "quiz"
            st.rerun()
    
    with col2:
        st.markdown('<div class="feature-card"><div class="feature-title">🎴 Flashcards</div>Study with interactive flashcards and spaced repetition</div>', unsafe_allow_html=True)
        if st.button("Open Flashcards", key="flashcards_btn", use_container_width=True):
            st.session_state.current_view = "flashcards"
            st.rerun()
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown('<div class="feature-card"><div class="feature-title">📄 Doc Study</div>Upload and analyze documents for better understanding</div>', unsafe_allow_html=True)
        if st.button("Open Doc Study", key="doc_study_btn", use_container_width=True):
            st.session_state.current_view = "doc_study"
            st.rerun()
    
    with col2:
        st.markdown('<div class="feature-card"><div class="feature-title">💡 Mnemonics</div>Generate memory aids to remember concepts effortlessly</div>', unsafe_allow_html=True)
        if st.button("Open Mnemonics", key="mnemonic_btn", use_container_width=True):
            st.session_state.current_view = "mnemonic"
            st.rerun()
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown('<div class="feature-card"><div class="feature-title">📖 Story Generator</div>Learn through engaging stories and narratives</div>', unsafe_allow_html=True)
        if st.button("Open Story Generator", key="story_btn", use_container_width=True):
            st.session_state.current_view = "story"
            st.rerun()
    
    with col2:
        st.markdown('<div class="feature-card"><div class="feature-title">🎯 Review Center</div>Track progress and review your learning journey</div>', unsafe_allow_html=True)
        if st.button("Open Review Center", key="review_btn", use_container_width=True):
            st.session_state.current_view = "review_center"
            st.rerun()

def render_explainer():
    st.header("🤔 Explainer")
    st.write("Get detailed explanations on any concept using AI-powered Socratic methods")
    
    concept = st.text_input("Enter a concept to explain:")
    socratic_mode = st.checkbox("Use Socratic Method (ask questions instead of direct answers)")
    uploaded_image = st.file_uploader("Upload an image (optional):", type=["jpg", "jpeg", "png"])
    
    if st.button("Explain"):
        if concept:
            with st.spinner("Generating explanation..."):
                try:
                    from services.gemini_service import explain_concept
                    result = explain_concept(concept, socratic=socratic_mode)
                    st.write(result.get("text", "No response generated"))
                    
                    if result.get("sources"):
                        st.subheader("Sources:")
                        for source in result["sources"]:
                            st.write(f"- [{source['title']}]({source['uri']})")
                except Exception as e:
                    st.error(f"Error: {str(e)}")
        else:
            st.warning("Please enter a concept to explain")
    
    if st.button("← Back to Dashboard"):
        st.session_state.current_view = "dashboard"
        st.rerun()

def render_summarizer():
    st.header("📝 Summarizer")
    st.write("Condense long texts into concise, digestible summaries")
    
    text = st.text_area("Paste text to summarize:", height=200)
    summary_length = st.select_slider("Summary length:", options=["Brief", "Medium", "Detailed"])
    
    if st.button("Summarize"):
        if text:
            with st.spinner("Generating summary..."):
                try:
                    from services.gemini_service import summarize_text
                    result = summarize_text(text, summary_length)
                    st.subheader("Summary:")
                    st.write(result)
                except Exception as e:
                    st.error(f"Error: {str(e)}")
        else:
            st.warning("Please enter text to summarize")
    
    if st.button("← Back to Dashboard"):
        st.session_state.current_view = "dashboard"
        st.rerun()

def render_quiz_maker():
    st.header("📋 Quiz Maker")
    st.write("Create and take custom quizzes to test your knowledge")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Create Quiz")
        topic = st.text_input("Topic:")
        num_questions = st.slider("Number of questions:", 1, 10, 5)
        difficulty = st.select_slider("Difficulty:", options=["Easy", "Medium", "Hard"])
        
        if st.button("Generate Quiz"):
            if topic:
                with st.spinner("Generating quiz..."):
                    try:
                        from services.gemini_service import generate_quiz
                        st.session_state.quiz = generate_quiz(topic, num_questions, difficulty)
                        st.success("Quiz generated!")
                        st.rerun()
                    except Exception as e:
                        st.error(f"Error: {str(e)}")
            else:
                st.warning("Please enter a topic")
    
    with col2:
        st.subheader("Or Upload Quiz File")
        quiz_file = st.file_uploader("Upload quiz JSON:", type=["json"])
        if quiz_file:
            import json
            st.session_state.quiz = json.load(quiz_file)
            st.success("Quiz loaded!")
    
    if st.button("← Back to Dashboard"):
        st.session_state.current_view = "dashboard"
        st.rerun()

def render_flashcards():
    st.header("🎴 Flashcards")
    st.write("Study with interactive flashcards and spaced repetition")
    
    topic = st.text_input("Enter topic for flashcards:")
    num_cards = st.slider("Number of flashcards:", 5, 50, 10)
    
    if st.button("Generate Flashcards"):
        if topic:
            with st.spinner("Generating flashcards..."):
                try:
                    from services.gemini_service import generate_flashcards
                    st.session_state.flashcards = generate_flashcards(topic, num_cards)
                    st.success("Flashcards generated!")
                    st.rerun()
                except Exception as e:
                    st.error(f"Error: {str(e)}")
        else:
            st.warning("Please enter a topic")
    
    if "flashcards" in st.session_state and st.session_state.flashcards:
        st.subheader("Study Flashcards")
        for i, card in enumerate(st.session_state.flashcards, 1):
            with st.expander(f"Card {i}: {card.get('front', 'Question')}"):
                st.write(card.get('back', 'Answer'))
    
    if st.button("← Back to Dashboard"):
        st.session_state.current_view = "dashboard"
        st.rerun()

def render_doc_study():
    st.header("📄 Document Study")
    st.write("Upload and analyze documents for better understanding")
    
    uploaded_file = st.file_uploader("Upload document (PDF or TXT):", type=["pdf", "txt"])
    
    if uploaded_file:
        st.success(f"File uploaded: {uploaded_file.name}")
        analysis_type = st.selectbox("Analysis type:", ["Summary", "Key Points", "Quiz Generation", "Explanation"])
        
        if st.button("Analyze Document"):
            with st.spinner("Analyzing document..."):
                try:
                    from services.gemini_service import analyze_document
                    result = analyze_document(uploaded_file, analysis_type)
                    st.write(result)
                except Exception as e:
                    st.error(f"Error: {str(e)}")
    
    if st.button("← Back to Dashboard"):
        st.session_state.current_view = "dashboard"
        st.rerun()

def render_mnemonic():
    st.header("💡 Mnemonic Generator")
    st.write("Generate memory aids to remember concepts effortlessly")
    
    concept = st.text_input("Enter concept to create mnemonics for:")
    mnemonic_type = st.selectbox("Mnemonic type:", ["Acronym", "Method of Loci", "Rhyme", "Story", "Association"])
    
    if st.button("Generate Mnemonics"):
        if concept:
            with st.spinner("Generating mnemonics..."):
                try:
                    from services.gemini_service import generate_mnemonics
                    result = generate_mnemonics(concept, mnemonic_type)
                    st.write(result)
                except Exception as e:
                    st.error(f"Error: {str(e)}")
        else:
            st.warning("Please enter a concept")
    
    if st.button("← Back to Dashboard"):
        st.session_state.current_view = "dashboard"
        st.rerun()

def render_story_generator():
    st.header("📖 Story Generator")
    st.write("Learn through engaging stories and narratives")
    
    topic = st.text_input("Enter topic for story:")
    story_style = st.selectbox("Story style:", ["Educational", "Adventure", "Mystery", "Fantasy", "Historical"])
    target_audience = st.selectbox("Target audience:", ["Kids", "Teens", "Adults", "Professionals"])
    
    if st.button("Generate Story"):
        if topic:
            with st.spinner("Generating story..."):
                try:
                    from services.gemini_service import generate_story
                    result = generate_story(topic, story_style, target_audience)
                    st.write(result)
                except Exception as e:
                    st.error(f"Error: {str(e)}")
        else:
            st.warning("Please enter a topic")
    
    if st.button("← Back to Dashboard"):
        st.session_state.current_view = "dashboard"
        st.rerun()

def render_review_center():
    st.header("🎯 Review Center")
    st.write("Track progress and review your learning journey")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("Quizzes Completed", "12")
    
    with col2:
        st.metric("Average Score", "87%")
    
    with col3:
        st.metric("Study Streak", "5 days")
    
    st.subheader("Recent Activities")
    st.write("- Completed Biology Quiz (87%)")
    st.write("- Generated 20 History Flashcards")
    st.write("- Summarized 3 Documents")
    
    if st.button("← Back to Dashboard"):
        st.session_state.current_view = "dashboard"
        st.rerun()

# Render view based on current state
if not st.session_state.user:
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        st.markdown('<div class="main-header">📚 OmniStudy</div>', unsafe_allow_html=True)
        st.markdown('<div class="subheader-text">Your AI Learning Partner</div>', unsafe_allow_html=True)
        
        if not st.session_state.show_register:
            st.subheader("Login")
            email = st.text_input("Email:")
            password = st.text_input("Password:", type="password")
            
            col1, col2 = st.columns(2)
            with col1:
                if st.button("Login", use_container_width=True):
                    if email and password:
                        login_user(email, password)
                    else:
                        st.error("Please enter email and password")
            
            with col2:
                if st.button("Create Account", use_container_width=True):
                    st.session_state.show_register = True
                    st.rerun()
        else:
            st.subheader("Register")
            name = st.text_input("Full Name:")
            email = st.text_input("Email:")
            password = st.text_input("Password:", type="password")
            confirm_password = st.text_input("Confirm Password:", type="password")
            
            col1, col2 = st.columns(2)
            with col1:
                if st.button("Register", use_container_width=True):
                    if name and email and password and confirm_password:
                        if password == confirm_password:
                            if len(password) < 6:
                                st.error("Password must be at least 6 characters")
                            else:
                                register_user(name, email, password)
                        else:
                            st.error("Passwords do not match")
                    else:
                        st.error("Please fill all fields")
            
            with col2:
                if st.button("Back to Login", use_container_width=True):
                    st.session_state.show_register = False
                    st.rerun()
else:
    # Sidebar
    with st.sidebar:
        st.markdown(f"### Welcome, {st.session_state.user['name']}!")
        st.divider()
        
        if st.button("Dashboard", use_container_width=True):
            st.session_state.current_view = "dashboard"
            st.rerun()
        
        if st.button("Explainer", use_container_width=True):
            st.session_state.current_view = "explainer"
            st.rerun()
        
        if st.button("Summarizer", use_container_width=True):
            st.session_state.current_view = "summarizer"
            st.rerun()
        
        if st.button("Quiz Maker", use_container_width=True):
            st.session_state.current_view = "quiz"
            st.rerun()
        
        if st.button("Flashcards", use_container_width=True):
            st.session_state.current_view = "flashcards"
            st.rerun()
        
        if st.button("Doc Study", use_container_width=True):
            st.session_state.current_view = "doc_study"
            st.rerun()
        
        if st.button("Mnemonics", use_container_width=True):
            st.session_state.current_view = "mnemonic"
            st.rerun()
        
        if st.button("Story Generator", use_container_width=True):
            st.session_state.current_view = "story"
            st.rerun()
        
        if st.button("Review Center", use_container_width=True):
            st.session_state.current_view = "review_center"
            st.rerun()
        
        st.divider()
        
        if st.button("Logout", use_container_width=True, type="secondary"):
            logout_user()
    
    # Main content
    if st.session_state.current_view == "dashboard":
        render_dashboard(st.session_state.user)
    elif st.session_state.current_view == "explainer":
        render_explainer()
    elif st.session_state.current_view == "summarizer":
        render_summarizer()
    elif st.session_state.current_view == "quiz":
        render_quiz_maker()
    elif st.session_state.current_view == "flashcards":
        render_flashcards()
    elif st.session_state.current_view == "doc_study":
        render_doc_study()
    elif st.session_state.current_view == "mnemonic":
        render_mnemonic()
    elif st.session_state.current_view == "story":
        render_story_generator()
    elif st.session_state.current_view == "review_center":
        render_review_center()
