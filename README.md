# 🎯 CareerPrep AI - AI-Powered Interview Preparation Platform

A comprehensive AI-powered interview preparation platform with real-time video personas, multiple interview types, and intelligent evaluation system. Built with modern glassmorphic design and seamless user experience.

## 🚀 Features

### **🎭 Interview Types**
- **Mock Interviews** (HR, Technical, Behavioral) - Practice with AI personas
- **System Design** interviews - High-level architecture discussions
- **Core CS Concepts** interviews - DSA, OS, DB, Networks, OOP
- **Resume-based HR** interviews - Personalized questions from your resume

### **🤖 AI Integration**
- **Tavus AI Personas** - Real-time video avatars with natural conversation
- **Custom AI Engine** - Advanced question generation and intelligent evaluation
- **Azure Speech-to-Text** - Real-time voice transcription
- **Daily.co WebRTC** - High-quality video streaming

### **📊 Smart Evaluation**
- **Intelligent scoring** with detailed feedback analysis
- **Strengths & Improvements** - Actionable insights for each answer
- **Performance analytics** with interactive radar charts
- **Session history** and progress tracking
- **Reference answers** for better understanding

### **🎨 Modern UI/UX**
- **Glassmorphic Design** - Modern, professional aesthetic
- **Dark/Light Mode** - Seamless theme switching
- **Responsive Layout** - Works on all devices
- **Interactive Animations** - Smooth, engaging user experience
- **Color-coded Difficulty** - Visual feedback for interview levels

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with custom glassmorphic components
- **shadcn/ui** - Modern component library
- **Framer Motion** - Smooth animations and transitions
- **Supabase Client** - Real-time database and authentication

### **Backend**
- **FastAPI** - Python web framework
- **Azure Speech Services** - Real-time voice processing
- **Supabase** - PostgreSQL database and authentication
- **Custom AI Integration** - Intelligent question generation and evaluation

### **Real-time Features**
- **Daily.co** - WebRTC video streaming
- **Tavus AI** - AI persona integration with video avatars
- **WebRTC** - Real-time communication
- **WebSocket** - Live updates and notifications

## 📁 Project Structure

```
careerprep-interview/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (interview, resume, tavus)
│   ├── auth/              # Authentication pages (login, signup)
│   ├── dashboard/          # User dashboard with analytics
│   ├── interview/          # Interview pages (new, room, summary)
│   ├── landing/           # Landing page with glassmorphic design
│   ├── history/           # Interview history and analytics
│   ├── coding/            # Coding interview configuration
│   ├── system-design/     # System design interview setup
│   └── hr-upload/         # Resume upload for HR interviews
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── interview-room.tsx # Main interview interface
│   ├── tavus-avatar.tsx  # AI persona video component
│   ├── transcript-panel.tsx # Live transcript display
│   └── ...               # Other custom components
├── lib/                  # Utility libraries
│   ├── supabase/         # Database client and middleware
│   ├── tavus.ts          # Tavus AI integration
│   └── ...               # Other utilities
├── hooks/                # Custom React hooks
├── scripts/              # Database migrations
└── public/               # Static assets
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account
- Tavus AI account
- Azure Speech Services account

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/umez-57/interview-saa.git
   cd interview-saa
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # Tavus AI Configuration
   TAVUS_API_KEY=your_tavus_api_key
   TAVUS_PERSONA_ID=your_persona_id
   TAVUS_REPLICA_ID=your_replica_id
   TAVUS_BASE_URL=https://tavusapi.com
   TAVUS_PIPELINE_MODE=echo
   
   # Application Configuration
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   NEXT_PUBLIC_DEV_MODE=true
   
   # Backend Configuration
   BACKEND_URL=your_backend_url
   
   # Azure Speech Services
   NEXT_PUBLIC_AZURE_SPEECH_KEY=your_speech_key
   NEXT_PUBLIC_AZURE_SPEECH_ENDPOINT=your_speech_endpoint
   NEXT_PUBLIC_AZURE_SPEECH_REGION=your_speech_region
   ```

4. **Database Setup**
   ```bash
   # Run database migrations
   # (Use Supabase dashboard or CLI)
   ```

5. **Start Development Server**
   ```bash
   pnpm dev
   ```

## 🔧 Configuration

### **Supabase Setup**
1. Create a new Supabase project
2. Run the SQL migrations in `/scripts/`
3. Set up Row Level Security (RLS) policies
4. Configure authentication providers

### **Azure Speech Services Setup**
1. Create an Azure Speech Services resource
2. Get your speech key and region
3. Configure the endpoint URL

### **Tavus AI Setup** 🎭

Tavus AI provides realistic video personas for interviews. Here's how to set it up:

#### **1. Create Tavus Account**
- Visit [https://platform.tavus.io/](https://platform.tavus.io/)
- Sign up for a new account
- Complete the registration process

#### **2. Get API Key**
- Navigate to the API Keys section in your dashboard
- Generate a new API key
- Copy the API key for your environment variables

#### **3. Choose Persona (Optional)**
- Visit [https://platform.tavus.io/personas](https://platform.tavus.io/personas)
- Browse available personas
- Select your preferred persona
- Copy the **Persona ID** and **Replica ID**

#### **4. Configure Environment Variables**
```env
# Tavus AI Configuration
TAVUS_API_KEY=your_tavus_api_key
TAVUS_PERSONA_ID=your_persona_id
TAVUS_REPLICA_ID=your_replica_id
TAVUS_BASE_URL=https://tavusapi.com
TAVUS_PIPELINE_MODE=echo
```

#### **5. Credit Management** 💳
- **Free Tier**: 25 minutes of usage per account
- **Track Usage**: Visit [https://platform.tavus.io/billing](https://platform.tavus.io/billing)
- **Monitor Credits**: Check remaining minutes regularly
- **Important**: Always end interviews properly to avoid credit waste

#### **6. Troubleshooting Credits**
If you run out of credits or face concurrent request issues:

**Option 1: Reset API Key**
- Delete current API key
- Generate new API key (if credits available)
- Update environment variables
- Restart backend and frontend

**Option 2: Create New Account**
- Create new Tavus account
- Generate new API keys and persona IDs
- Update all environment variables
- Restart backend and frontend

**Option 3: Verify Configuration**
- Check backend config at `localhost:8000/config`
- Ensure latest API keys are loaded
- Clear browser cookies and cache
- Force restart all services

## 📊 Database Schema

### **Tables**
- `profiles` - User profile information
- `interview_sessions` - Interview session data
- `interview_answers` - User answers and evaluations

### **Key Features**
- Row Level Security (RLS)
- Real-time subscriptions
- File storage for resumes
- User authentication

## 🎯 Use Cases

### **👨‍💼 For Job Seekers**
- **Interview Practice**: Practice with AI personas before real interviews
- **Skill Assessment**: Get detailed feedback on technical and soft skills
- **Resume Optimization**: Upload resume for personalized HR questions
- **Progress Tracking**: Monitor improvement over time with analytics
- **Confidence Building**: Practice in a safe, judgment-free environment

### **🏢 For Companies & Recruiters**
- **Candidate Screening**: Evaluate candidates with standardized interviews
- **Skill Assessment**: Get objective scores for technical abilities
- **Time Saving**: Automated interview process with instant feedback
- **Quality Control**: Consistent evaluation criteria across all candidates
- **Data Insights**: Analytics on candidate performance and trends

### **🎓 For Educational Institutions**
- **Student Preparation**: Help students prepare for job interviews
- **Career Services**: Provide interview practice tools for career centers
- **Skill Development**: Track student progress in interview skills
- **Assessment Tool**: Evaluate student readiness for job market

### **👨‍🏫 For Interview Coaches**
- **Client Practice**: Provide structured practice sessions for clients
- **Progress Monitoring**: Track client improvement over time
- **Feedback Analysis**: Detailed insights for coaching sessions
- **Custom Scenarios**: Create specific interview scenarios for practice

## 🚀 How to Use

### **For End Users**

#### **1. Getting Started**
- Visit the landing page at `http://localhost:3000/landing`
- Click "Start Your Free Interview" (redirects to login if not authenticated)
- Sign up or log in to your account
- Complete your profile setup

#### **2. Interview Types**

**Mock Interviews:**
- Choose difficulty: Junior (Green), Mid (Yellow), Senior (Red)
- Select duration: 10, 15, or 30 minutes
- Pick persona: HR, Technical, or Behavioral
- For HR interviews: Upload your resume for personalized questions

**System Design Interviews:**
- Select difficulty level and duration
- Practice high-level architecture discussions
- Get feedback on design thinking and problem-solving

**Core CS Concepts:**
- Choose from DSA, OS, DB, Networks, OOP topics
- Practice fundamental computer science concepts
- Get detailed explanations and reference answers

#### **3. During the Interview**
- Speak naturally - the AI will transcribe your responses
- Use "Summarize the question" if you need clarification
- Take your time to think before answering
- The AI will ask follow-up questions based on your responses

#### **4. After the Interview**
- Review detailed feedback and scores
- Check strengths and areas for improvement
- Read reference answers for better understanding
- Track your progress in the dashboard

### **For Developers**

#### **Frontend Development**
- **Component-based architecture** for easy maintenance
- **TypeScript** for type safety and better development experience
- **Tailwind CSS** with custom glassmorphic components
- **Framer Motion** for smooth animations
- **Responsive design** that works on all devices

#### **Backend Integration**
- **RESTful API** design with FastAPI
- **Real-time features** with WebRTC and WebSockets
- **Database integration** with Supabase
- **AI services** integration with Azure OpenAI and Tavus

#### **Customization**
- **Theme system** for easy color scheme changes
- **Component library** for consistent UI elements
- **API endpoints** for extending functionality
- **Database schema** for adding new features

## 🔒 Security

- **Environment variables** for sensitive data
- **Row Level Security** for database access
- **API key management** for external services
- **User authentication** with Supabase Auth

## 📈 Performance

- **Optimized builds** with Next.js
- **Lazy loading** for components
- **Efficient state management** with Zustand
- **Real-time updates** with WebRTC

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔧 Troubleshooting

### **Common Issues**

#### **Tavus AI Issues**
- **"Persona not found"**: Check if persona ID and replica ID are correct
- **"API key invalid"**: Verify API key is correct and not expired
- **"Credit exhausted"**: Check usage at [billing page](https://platform.tavus.io/billing)
- **"Concurrent requests"**: End previous interviews or create new API key

#### **Authentication Issues**
- **"User not found"**: Clear browser cache and cookies
- **"Session expired"**: Log out and log back in
- **"Profile incomplete"**: Complete profile setup in dashboard

#### **Video/Audio Issues**
- **"No video"**: Check camera permissions in browser
- **"No audio"**: Check microphone permissions
- **"Poor quality"**: Check internet connection and browser compatibility

#### **Backend Connection Issues**
- **"Backend not responding"**: Ensure backend is running on port 8000
- **"API calls failing"**: Check NEXT_PUBLIC_BACKEND_URL in environment
- **"CORS errors"**: Verify backend CORS configuration

### **Quick Fixes**

#### **Reset Everything**
```bash
# Clear browser data
# Clear cookies and cache

# Restart services
# Stop backend (Ctrl+C)
# Stop frontend (Ctrl+C)

# Restart backend
cd backend
python main.py

# Restart frontend
cd frontend
pnpm dev
```

#### **Verify Configuration**
- Check backend config: `http://localhost:8000/config`
- Verify environment variables are loaded
- Test API endpoints individually
- Check browser console for errors

#### **Database Issues**
- Check Supabase connection
- Verify RLS policies are correct
- Check if tables exist and have data
- Review database logs in Supabase dashboard

## 🆘 Support

For support and questions:
- **GitHub Issues**: Create an issue with detailed error description
- **Documentation**: Check this README and code comments


### **Before Asking for Help**
1. Check this troubleshooting section
2. Verify all environment variables are set
3. Check browser console for errors
4. Test with a fresh browser session
5. Include error logs and steps to reproduce

## 🎉 Acknowledgments

- **Tavus AI** for persona technology
- **Azure Speech Services** for voice processing
- **Supabase** for backend infrastructure
- **Daily.co** for WebRTC capabilities

---

**Built with ❤️ for better interview preparation**
