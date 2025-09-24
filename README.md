# 🎯 CareerPrep Interview - AI-Powered Interview Platform

A comprehensive AI-powered interview preparation platform with real-time video personas, multiple interview types, and intelligent evaluation system.

## 🚀 Features

### **Interview Types**
- **Mock Interviews** (HR, Technical, Behavioral)
- **System Design** interviews
- **Core CS Concepts** interviews
- **Resume-based HR** interviews

### **AI Integration**
- **Tavus AI Personas** - Real-time video avatars
- **Azure OpenAI** - Question generation and evaluation
- **Azure Speech-to-Text** - Voice transcription
- **Daily.co WebRTC** - Real-time video streaming

### **Smart Evaluation**
- **Strict scoring system** with zero tolerance for irrelevant answers
- **Detailed feedback** with strengths and improvements
- **Performance analytics** with radar charts
- **Session history** and progress tracking

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **Framer Motion** - Animations
- **Zustand** - State management

### **Backend**
- **FastAPI** - Python web framework
- **Azure OpenAI** - AI services
- **Azure Speech Services** - Voice processing
- **Supabase** - Database and authentication

### **Real-time Features**
- **Daily.co** - WebRTC video streaming
- **Tavus AI** - AI persona integration
- **WebRTC** - Real-time communication

## 📁 Project Structure

```
careerprep-interview/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/          # User dashboard
│   ├── interview/          # Interview pages
│   └── profile-complete/   # Profile setup
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                  # Utility libraries
├── hooks/                # Custom React hooks
├── scripts/              # Database migrations
└── public/               # Static assets
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account
- Azure OpenAI account
- Tavus AI account

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
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Azure OpenAI
   NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT=your_azure_endpoint
   NEXT_PUBLIC_AZURE_OPENAI_API_KEY=your_azure_api_key
   
   # Azure Speech
   NEXT_PUBLIC_AZURE_SPEECH_KEY=your_speech_key
   NEXT_PUBLIC_AZURE_SPEECH_REGION=your_speech_region
   
   # Tavus AI
   NEXT_PUBLIC_TAVUS_API_KEY=your_tavus_api_key
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

### **Azure OpenAI Setup**
1. Create an Azure OpenAI resource
2. Deploy GPT-4 model
3. Configure API keys and endpoints

### **Tavus AI Setup**
1. Create Tavus account
2. Set up AI personas
3. Configure API keys

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

## 🎯 Usage

### **For Users**
1. **Sign up** and complete profile
2. **Choose interview type** (Mock, System Design, Core CS)
3. **Select difficulty** and duration
4. **Start interview** with AI persona
5. **Get evaluated** with detailed feedback
6. **Track progress** in dashboard

### **For Developers**
- **Modular architecture** for easy extension
- **Type-safe development** with TypeScript
- **Component-based** React architecture
- **API-first** backend design

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

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code examples

## 🎉 Acknowledgments

- **Tavus AI** for persona technology
- **Azure OpenAI** for AI services
- **Supabase** for backend infrastructure
- **Daily.co** for WebRTC capabilities

---

**Built with ❤️ for better interview preparation**
