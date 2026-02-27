# Firebase Authentication Setup Guide

## Step 1: Get Firebase Service Account Key

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `omnistudy-37774`
3. **Navigate to Project Settings**:
   - Click the gear icon (⚙️) next to "Project Overview"
   - Select "Project settings"
4. **Go to Service Accounts tab**:
   - Click on "Service accounts" tab
5. **Generate Private Key**:
   - Click "Generate new private key" button
   - Click "Generate key" in the confirmation dialog
   - A JSON file will download automatically (keep it safe!)

## Step 2: Add Credentials to Streamlit Cloud

1. **Go to Streamlit Cloud**: https://share.streamlit.io/
2. **Open your app**: Click on "omnistudy-buddy" (or your app name)
3. **Open Settings**:
   - Click the hamburger menu (☰) or "Settings" button
   - Select "Secrets"
4. **Add the following secrets**:

### Copy this template and fill with your Firebase JSON values:

```toml
# Gemini API Key
GEMINI_API_KEY = "AIzaSyDRPnG-GZm_H234VaGFheeY39FqnpjeQ4Y"

# Firebase Service Account Configuration
[firebase]
type = "service_account"
project_id = "omnistudy-37774"
private_key_id = "YOUR_PRIVATE_KEY_ID_FROM_JSON"
private_key = """-----BEGIN PRIVATE KEY-----
YOUR_PRIVATE_KEY_FROM_JSON_HERE
-----END PRIVATE KEY-----
"""
client_email = "YOUR_CLIENT_EMAIL_FROM_JSON"
client_id = "YOUR_CLIENT_ID_FROM_JSON"
auth_uri = "https://accounts.google.com/o/oauth2/auth"
token_uri = "https://oauth2.googleapis.com/token"
auth_provider_x509_cert_url = "https://www.googleapis.com/oauth2/v1/certs"
client_x509_cert_url = "YOUR_CLIENT_CERT_URL_FROM_JSON"
```

### How to fill the template:

Open the downloaded Firebase JSON file and copy:
- `private_key_id` → Copy as-is
- `private_key` → Copy the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- `client_email` → Copy as-is
- `client_id` → Copy as-is
- `client_x509_cert_url` → Copy as-is

**Important**: Use triple quotes `"""` for the private_key to preserve newlines!

## Step 3: Save and Reboot

1. **Click "Save"** in the Streamlit secrets editor
2. **Reboot your app**:
   - Go back to the app
   - Click "Manage app" (bottom right)
   - Click "Reboot app"

## Step 4: Test Authentication

1. Visit your app: https://omnistudy-buddy.streamlit.app
2. Try to create an account:
   - Click "Create Account"
   - Enter email and password
   - Click "Register"
3. Try to login with your credentials

## Alternative: Use Firebase Web Authentication

If you prefer simpler setup without service account:

You can also use Firebase Web SDK client-side authentication by:
1. Getting your Firebase web config
2. Using Streamlit components for authentication
3. This is simpler but less secure for production

## Troubleshooting

### Error: "Unable to load PEM file"
- Check that private_key is enclosed in triple quotes `"""`
- Ensure the key includes BEGIN and END markers
- Make sure there are no extra spaces

### Error: "Invalid credentials"
- Verify project_id matches your Firebase project
- Check that client_email is correct
- Ensure the service account has proper permissions

### Authentication still not working
1. Verify Firebase Authentication is enabled in Firebase Console
2. Go to Authentication → Sign-in method
3. Enable "Email/Password" provider
4. Save changes

## Need Help?

- Firebase Documentation: https://firebase.google.com/docs/admin/setup
- Streamlit Secrets: https://docs.streamlit.io/streamlit-community-cloud/deploy-your-app/secrets-management
- Support: Check the Firebase Console for any project configuration issues

---

Once configured, your app will have full authentication capabilities with secure user accounts!
