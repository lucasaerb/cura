# 🚀 Quick Setup Guide - OpenAI API

## Step 1: Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

## Step 2: Add API Key to Your Project

1. **Create a `.env` file** in the project root (same level as package.json)
2. **Add your API key**:
   ```
   EXPO_PUBLIC_OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   ```
3. **Save the file**

## Step 3: Restart the App

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm start
```

## Step 4: Test the AI Assistant

1. **Open the app**
2. **Tap the chat icon** (💬) in the top-right
3. **Tap "Connect"** - should show "CONNECTED"
4. **Send a message**: "Hello, can you help me with my medications?"

## ✅ You're Ready!

The AI assistant should now respond with personalized medication guidance!

## 🔒 Security Note

The `.env` file is automatically ignored by git, so your API key won't be committed to version control.

## 💰 Cost Management

- The app uses GPT-4o-mini (very cost-effective)
- Typical usage: $1-5 per month
- Set spending limits in your OpenAI dashboard

## 🚨 Troubleshooting

**"Connection Failed"** → Check your API key in the `.env` file
**"No API key provided"** → Make sure you restarted the Expo server
**API errors** → Verify you have credits in your OpenAI account 