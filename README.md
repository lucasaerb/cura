# 💊 Pillai - AI-Powered Medication Assistant

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)

**A beautiful, intelligent medication reminder app with AI-powered voice assistance**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [API Setup](#-api-setup) • [Contributing](#-contributing)

</div>

---

## 🌟 Overview

**Pillai** is a comprehensive medication management app that combines elegant design with cutting-edge AI technology. Built for patients who need reliable medication tracking with the convenience of voice interaction and intelligent assistance.

### 🎯 **Mission**
Help users maintain medication adherence through beautiful UX, smart reminders, and AI-powered health guidance.

---

## ✨ Features

### 🏠 **Smart Home Dashboard**
- **Personalized Welcome** - Greet users by name with current date/time
- **Live Medication List** - Real-time medication status with visual indicators
- **Adherence Tracking** - Streak counters and compliance statistics
- **Quick Actions** - One-tap medication marking and status updates

### 🤖 **AI Voice Assistant**
- **Real OpenAI Integration** - GPT-4 powered medication guidance
- **Voice-to-Text** - Whisper API transcription for hands-free interaction
- **Text-to-Speech** - AI responses spoken aloud on mobile devices
- **Medication Context** - AI understands your specific medications and schedule
- **Conversation Memory** - Maintains context across chat sessions

### 📊 **Comprehensive Reporting**
- **Medical-Grade Analytics** - Professional medication adherence reports
- **Progress Tracking** - Visual timelines showing improvement over time
- **Clinical Insights** - Detailed medication effectiveness analysis
- **Exportable Data** - Share reports with healthcare providers

### 📅 **Interactive Calendar**
- **Schedule Overview** - Visual medication calendar with adherence history
- **Weekly/Monthly Views** - Flexible time period selection
- **Status Indicators** - Color-coded medication statuses (taken/missed/upcoming)
- **Historical Data** - Past 7-day adherence tracking with error indicators

### 👤 **User Profile Management**
- **Personal Information** - MRN, insurance details, emergency contacts
- **Connected Devices** - Apple Watch, Oura Ring integration display
- **Prescription Management** - Visual medication cards with logos
- **Appointment Tracking** - Upcoming medical appointments timeline

### 🎨 **Beautiful Design**
- **Medical Professional UI** - Clean, trustworthy design language
- **Consistent Theming** - Purple gradient palette (#2D1B69, #8B5CF6, #E8E3FF)
- **Responsive Layout** - Optimized for phones, tablets, and web
- **Accessibility First** - Screen reader support and high contrast options

---

## 🏗️ **Tech Stack**

### **Frontend**
- **React Native** with Expo SDK 53
- **TypeScript** for type safety and better development experience
- **JavaScript** for legacy components (gradual migration approach)
- **React Native Vector Icons** for consistent iconography
- **AsyncStorage** for local data persistence

### **AI Integration**
- **OpenAI GPT-4o-mini** for cost-effective, intelligent responses
- **Whisper API** for accurate speech-to-text transcription
- **Expo Speech** for text-to-speech functionality
- **Expo AV** for high-quality audio recording

### **Development Tools**
- **Expo CLI** for streamlined development and deployment
- **TypeScript Config** optimized for React Native
- **ESLint** for code quality and consistency
- **Git** with feature branch workflow

---

## 🚀 Installation

### **Prerequisites**
- Node.js 18+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### **Quick Start**

```bash
# Clone the repository
git clone https://github.com/lucasaerb/cura.git
cd cura

# Install dependencies
npm install --legacy-peer-deps

# Add your OpenAI API key
# Edit services/RealtimeClient.ts and replace 'YOUR_OPENAI_API_KEY_HERE'

# Start development server
npm start

# Run on specific platforms
npm run ios     # iOS Simulator
npm run android # Android Emulator  
npm run web     # Web Browser
```

---

## 📱 Usage

### **Getting Started**
1. **Launch the app** and see Linda's personalized dashboard
2. **Mark medications** as taken using the checkboxes
3. **Access AI Assistant** via the chat button in the top-right
4. **Explore Reports** for detailed adherence analytics
5. **Check Calendar** for historical medication data

### **AI Assistant Features**

#### **Text Chat**
- Type medication questions or requests for advice
- Get personalized responses based on your medication profile
- Receive encouragement and adherence tips

#### **Voice Chat (Mobile Only)**
- **Hold the microphone button** to record voice messages
- **Release to send** - automatic transcription and AI response
- **Listen to responses** - AI speaks back for hands-free interaction

#### **Example Conversations**
```
You: "Should I take my Lexapro with food?"
AI: "Lexapro can be taken with or without food. However, taking it with food may help reduce stomach upset. Since you're on a regular schedule, try to take it the same way each day for consistency."

You: "I missed my dose yesterday"
AI: "Don't worry! Missing one dose happens. Take your next dose at the regular time - don't double up. Your adherence is still great at 94% this month. Would you like me to help you set a reminder?"
```

---

## 🔧 API Setup

### **OpenAI Configuration**

1. **Get API Key**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create new secret key
   - Copy the key (starts with `sk-`)

2. **Add to App**
   ```typescript
   // In services/RealtimeClient.ts
   private async getAPIKey(): Promise<string> {
     const API_KEY = 'sk-your-actual-openai-api-key-here';
     return API_KEY;
   }
   ```

3. **Cost Management**
   - App uses `gpt-4o-mini` (cost-effective model)
   - Typical usage: $1-5 per month
   - Set usage limits in OpenAI dashboard

### **Production Security**
For production apps, use a backend proxy:

```javascript
// backend/server.js
app.post('/api/chat', async (req, res) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
    method: 'POST',
    body: JSON.stringify(req.body)
  });
  res.json(await response.json());
});
```

---

## 📁 Project Structure

```
pillai/
├── 📱 App.js                    # Main application component
├── 🎨 styles.js                 # Shared styling system
├── 📄 types.ts                  # TypeScript type definitions
├── 
├── 📂 components/
│   └── 🎤 VoiceChat.tsx         # AI chat interface
├── 
├── 📂 services/
│   ├── 🤖 OpenAIService.ts      # OpenAI API integration
│   ├── 📞 RealtimeClient.ts     # Voice & chat client
│   └── 🔐 SessionService.ts     # Authentication service
├── 
├── 📂 contexts/
│   └── 💬 TranscriptContext.tsx # Chat state management
├── 
├── 📂 pages/
│   ├── 👤 ProfilePage.js        # User profile & settings
│   ├── 📊 ReportPage.js         # Medical reports & analytics
│   ├── 📅 CalendarPage.js       # Medication calendar
│   └── 🤖 AIMenu.js             # AI assistant interface
├── 
├── 📂 assets/
│   ├── 🖼️ pfp.jpg               # Profile picture
│   ├── 💊 Lexapro.png           # Medication logos
│   └── 💊 opill.png
└── 
└── 📚 SETUP_INSTRUCTIONS.md     # Detailed setup guide
```

---

## 🌟 Key Highlights

### **🔒 Privacy & Security**
- **Local Data Storage** - All personal data stays on device
- **Secure API Communication** - Encrypted communication with OpenAI
- **No Personal Data Sharing** - AI conversations don't store personal info
- **HIPAA Considerations** - Built with healthcare privacy in mind

### **📊 Analytics & Insights**
- **Real-time Adherence Tracking** - Live compliance percentages
- **Historical Trends** - Long-term medication pattern analysis
- **Clinical Integration** - Exportable reports for healthcare providers
- **Behavioral Insights** - Understanding medication timing patterns

### **🎯 Accessibility**
- **Screen Reader Support** - Full VoiceOver and TalkBack compatibility
- **High Contrast Mode** - Enhanced visibility for visually impaired users
- **Large Text Support** - Scales with system font size preferences
- **Voice Interface** - Alternative input method for motor impairments

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Development Workflow**
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and test thoroughly
npm run test
npm run lint

# Commit with conventional commits
git commit -m "feat: add new medication reminder feature"

# Push and create pull request
git push -u origin feature/your-feature-name
```

### **Areas for Contribution**
- 🎨 UI/UX improvements
- 🔒 Enhanced security features  
- 🌐 Internationalization
- 📊 Advanced analytics
- 🤖 AI conversation improvements
- 📱 Platform-specific optimizations

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenAI** for providing cutting-edge AI capabilities
- **Expo Team** for excellent React Native tooling
- **React Native Community** for comprehensive ecosystem
- **Healthcare Professionals** who inspired the medical-grade design

---

<div align="center">

**Built with ❤️ for better medication adherence**

[⭐ Star this repo](https://github.com/lucasaerb/cura) | [🐛 Report Bug](https://github.com/lucasaerb/cura/issues) | [💡 Request Feature](https://github.com/lucasaerb/cura/issues)

</div> 