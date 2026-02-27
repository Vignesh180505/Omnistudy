@echo off
REM OmniStudy Streamlit Quick Start Script for Windows

echo.
echo 🚀 OmniStudy - Streamlit Setup
echo ===============================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('python --version') do set PYTHON_VER=%%i
echo ✅ Python found: %PYTHON_VER%
echo.

REM Check if pip is installed
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ pip is not installed. Please install pip.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('pip --version') do set PIP_VER=%%i
echo ✅ pip found: %PIP_VER%
echo.

REM Install dependencies
echo 📦 Installing dependencies...
pip install -r requirements.txt

echo.
echo ✅ Dependencies installed!
echo.

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  .env file not found!
    echo Creating .env template...
    (
        echo # Gemini API Key
        echo GEMINI_API_KEY=your_api_key_here
        echo.
        echo # Firebase Credentials ^(optional^)
        echo FIREBASE_CREDS={}
    ) > .env
    echo 📝 Please edit .env and add your API keys
) else (
    echo ✅ .env file found
)

echo.
echo 🎉 Setup complete!
echo.
echo To start the app, run:
echo   streamlit run streamlit_app.py
echo.
echo The app will be available at: http://localhost:8501
echo.
pause
