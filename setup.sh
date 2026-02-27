#!/bin/bash
# OmniStudy Streamlit Quick Start Script

echo "🚀 OmniStudy - Streamlit Setup"
echo "==============================="
echo ""

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✅ Python found: $(python --version)"
echo ""

# Check if pip is installed
if ! command -v pip &> /dev/null; then
    echo "❌ pip is not installed. Please install pip."
    exit 1
fi

echo "✅ pip found: $(pip --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "✅ Dependencies installed!"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "Creating .env template..."
    cat > .env << 'EOF'
# Gemini API Key
GEMINI_API_KEY=your_api_key_here

# Firebase Credentials (optional)
FIREBASE_CREDS={}
EOF
    echo "📝 Please edit .env and add your API keys"
else
    echo "✅ .env file found"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the app, run:"
echo "  streamlit run streamlit_app.py"
echo ""
echo "The app will be available at: http://localhost:8501"
