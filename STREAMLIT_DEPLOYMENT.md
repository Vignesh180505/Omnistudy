# OmniStudy - Streamlit Deployment Guide

## Overview
Your OmniStudy AI Learning Platform has been converted from React/Vite to Streamlit! This guide will help you deploy it.

## Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Gemini API Key
- Firebase Credentials

## Local Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Environment Variables
Create a `.env` file in the project root with:

```
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Credentials (optional - for authentication)
FIREBASE_CREDS={}
# OR individual fields:
FIREBASE_PRIVATE_KEY_ID=your_key_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CERT_URL=your_cert_url
```

### 3. Run Locally
```bash
streamlit run streamlit_app.py
```

The app will be available at `http://localhost:8501`

## Deployment Options

### Option 1: Streamlit Cloud (Recommended - Free)
1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Convert to Streamlit deployment"
   git push origin main
   ```

2. **Deploy on Streamlit Cloud**
   - Go to https://streamlit.io/cloud
   - Sign in with GitHub
   - Click "New app"
   - Select your repository, branch, and main file (`streamlit_app.py`)
   - Click "Deploy"

3. **Add Secrets**
   - In Streamlit Cloud dashboard, go to "Settings" → "Secrets"
   - Add your environment variables:
   ```
   GEMINI_API_KEY = "your_api_key"
   ```

### Option 2: Heroku
1. **Install Heroku CLI**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Create Procfile**
   ```
   web: streamlit run streamlit_app.py --logger.level=error
   ```

3. **Deploy**
   ```bash
   heroku login
   heroku create your-app-name
   heroku config:set GEMINI_API_KEY=your_api_key
   git push heroku main
   ```

### Option 3: Docker Deployment
1. **Create Dockerfile**
   ```dockerfile
   FROM python:3.11-slim

   WORKDIR /app

   COPY requirements.txt .
   RUN pip install -r requirements.txt

   COPY . .

   EXPOSE 8501

   CMD ["streamlit", "run", "streamlit_app.py", "--server.port=8501", "--server.address=0.0.0.0"]
   ```

2. **Build and Run**
   ```bash
   docker build -t omnistudy .
   docker run -p 8501:8501 -e GEMINI_API_KEY=your_api_key omnistudy
   ```

### Option 4: AWS, GCP, or Azure
- Use container deployment services (ECS, Cloud Run, Container Instances)
- Use the Docker image from Option 3
- Set environment variables in your cloud platform

## Features Available

✅ **Dashboard** - Overview of all learning tools
✅ **Explainer** - Get detailed explanations with optional Socratic method
✅ **Summarizer** - Condense long texts into summaries
✅ **Quiz Maker** - Generate custom quizzes on any topic
✅ **Flashcards** - Create and study with interactive flashcards
✅ **Document Study** - Upload and analyze documents
✅ **Mnemonic Generator** - Create memory aids
✅ **Story Generator** - Learn through engaging narratives
✅ **Review Center** - Track your learning progress
✅ **Firebase Authentication** - Secure user accounts

## Troubleshooting

### Issue: Firebase initialization fails
- Firebase authentication is optional for basic functionality
- If you want full authentication, set up Firebase credentials
- The app will still work with just the Gemini API

### Issue: API rate limits
- Gemini API has rate limits
- Consider implementing caching or request throttling
- Check your API quota on Google Cloud Console

### Issue: File upload not working
- Ensure `max_upload_size` in `.streamlit/config.toml` is appropriate
- Default is 200MB

## Performance Tips

1. **Cache expensive operations** using `@st.cache_data`
2. **Use Streamlit session state** to avoid re-rendering
3. **Implement lazy loading** for heavy features
4. **Monitor API usage** to optimize costs

## Support & Resources

- Streamlit Docs: https://docs.streamlit.io/
- Google Generative AI: https://ai.google.dev/
- Firebase Documentation: https://firebase.google.com/docs/

## Next Steps

1. Test the app locally
2. Deploy to Streamlit Cloud or your preferred platform
3. Configure environment variables
4. Share with users
5. Monitor usage and collect feedback

---

**Questions?** Check the Streamlit documentation or GitHub Issues for support.
