import type { Persona, Difficulty, Question } from "./types"

export interface QuestionBank {
  [key: string]: Question[]
}

export const questionBank: QuestionBank = {
  // HR Questions
  "HR-Easy": [
    {
      id: "hr-e-1",
      text: "Tell me about yourself and why you're interested in this role.",
      category: "introduction",
    },
    {
      id: "hr-e-2",
      text: "What are your greatest strengths and how do they apply to this position?",
      category: "strengths",
    },
    {
      id: "hr-e-3",
      text: "Describe a challenge you faced in your studies or previous work and how you overcame it.",
      category: "problem-solving",
    },
    {
      id: "hr-e-4",
      text: "Where do you see yourself in 5 years?",
      category: "career-goals",
    },
    {
      id: "hr-e-5",
      text: "Why do you want to work for our company?",
      category: "company-fit",
    },
  ],
  "HR-Medium": [
    {
      id: "hr-m-1",
      text: "Walk me through your career progression and key achievements.",
      category: "experience",
    },
    {
      id: "hr-m-2",
      text: "Describe a time when you had to work with a difficult team member. How did you handle it?",
      category: "teamwork",
    },
    {
      id: "hr-m-3",
      text: "Tell me about a project where you had to learn new skills quickly.",
      category: "adaptability",
    },
    {
      id: "hr-m-4",
      text: "How do you prioritize tasks when you have multiple deadlines?",
      category: "time-management",
    },
    {
      id: "hr-m-5",
      text: "Describe a situation where you had to give constructive feedback to a colleague.",
      category: "communication",
    },
  ],
  "HR-Hard": [
    {
      id: "hr-h-1",
      text: "How do you approach building and leading high-performing teams?",
      category: "leadership",
    },
    {
      id: "hr-h-2",
      text: "Describe a time when you had to make a difficult decision with limited information.",
      category: "decision-making",
    },
    {
      id: "hr-h-3",
      text: "How do you handle conflict resolution between team members?",
      category: "conflict-resolution",
    },
    {
      id: "hr-h-4",
      text: "Tell me about a time when you had to influence stakeholders without direct authority.",
      category: "influence",
    },
    {
      id: "hr-h-5",
      text: "How do you foster innovation and continuous improvement in your team?",
      category: "innovation",
    },
  ],

  // Tech Questions
  "Tech-Easy": [
    {
      id: "tech-e-1",
      text: "Explain the difference between let, const, and var in JavaScript.",
      category: "fundamentals",
    },
    {
      id: "tech-e-2",
      text: "What is the difference between == and === in JavaScript?",
      category: "fundamentals",
    },
    {
      id: "tech-e-3",
      text: "How would you reverse a string in your preferred programming language?",
      category: "coding",
    },
    {
      id: "tech-e-4",
      text: "Explain what REST APIs are and how they work.",
      category: "web-development",
    },
    {
      id: "tech-e-5",
      text: "What is the difference between SQL and NoSQL databases?",
      category: "databases",
    },
  ],
  "Tech-Medium": [
    {
      id: "tech-m-1",
      text: "Design a rate-limiting system for a REST API endpoint that handles user login attempts. Consider scenarios like burstiness and handling of different user roles with varying rate limits.",
      category: "system-design",
    },
    {
      id: "tech-m-2",
      text: "Explain the concept of closures in JavaScript with an example.",
      category: "advanced-concepts",
    },
    {
      id: "tech-m-3",
      text: "How would you optimize a slow database query?",
      category: "performance",
    },
    {
      id: "tech-m-4",
      text: "Describe the differences between microservices and monolithic architecture.",
      category: "architecture",
    },
    {
      id: "tech-m-5",
      text: "How do you handle error handling and logging in your applications?",
      category: "best-practices",
    },
    {
      id: "tech-m-6",
      text: "Explain the concept of caching and different caching strategies.",
      category: "performance",
    },
  ],
  "Tech-Hard": [
    {
      id: "tech-h-1",
      text: "How would you design a scalable system to handle millions of users?",
      category: "system-design",
    },
    {
      id: "tech-h-2",
      text: "Explain your approach to technical debt management and code quality.",
      category: "architecture",
    },
    {
      id: "tech-h-3",
      text: "How do you ensure security best practices in your applications?",
      category: "security",
    },
    {
      id: "tech-h-4",
      text: "Describe your experience with CI/CD pipelines and deployment strategies.",
      category: "devops",
    },
    {
      id: "tech-h-5",
      text: "How do you approach performance monitoring and optimization at scale?",
      category: "performance",
    },
  ],

  // Behavioral Questions
  "Behavioral-Easy": [
    {
      id: "beh-e-1",
      text: "Tell me about a time when you had to learn something completely new.",
      category: "learning",
    },
    {
      id: "beh-e-2",
      text: "Describe a situation where you made a mistake. How did you handle it?",
      category: "accountability",
    },
    {
      id: "beh-e-3",
      text: "Give me an example of when you worked effectively in a team.",
      category: "teamwork",
    },
    {
      id: "beh-e-4",
      text: "Tell me about a time when you had to meet a tight deadline.",
      category: "time-management",
    },
    {
      id: "beh-e-5",
      text: "Describe a situation where you showed initiative.",
      category: "initiative",
    },
  ],
  "Behavioral-Medium": [
    {
      id: "beh-m-1",
      text: "Tell me about a time when you had to persuade someone to see things your way.",
      category: "influence",
    },
    {
      id: "beh-m-2",
      text: "Describe a situation where you had to adapt to significant changes.",
      category: "adaptability",
    },
    {
      id: "beh-m-3",
      text: "Give me an example of when you went above and beyond your job requirements.",
      category: "initiative",
    },
    {
      id: "beh-m-4",
      text: "Tell me about a time when you had to work with limited resources.",
      category: "resourcefulness",
    },
    {
      id: "beh-m-5",
      text: "Describe a situation where you had to handle multiple competing priorities.",
      category: "prioritization",
    },
  ],
  "Behavioral-Hard": [
    {
      id: "beh-h-1",
      text: "Tell me about a time when you had to lead a team through a major change.",
      category: "change-management",
    },
    {
      id: "beh-h-2",
      text: "Describe a situation where you had to make an unpopular decision.",
      category: "decision-making",
    },
    {
      id: "beh-h-3",
      text: "Give me an example of when you mentored or developed someone on your team.",
      category: "mentoring",
    },
    {
      id: "beh-h-4",
      text: "Tell me about a time when you had to resolve a conflict between stakeholders.",
      category: "conflict-resolution",
    },
    {
      id: "beh-h-5",
      text: "Describe how you've driven innovation or process improvement in your organization.",
      category: "innovation",
    },
  ],
}

// Map frontend difficulty levels to question bank keys
const difficultyMap: Record<string, string> = {
  "junior": "Easy",
  "mid": "Medium", 
  "senior": "Hard"
}

// Map frontend persona to question bank keys
const personaMap: Record<string, string> = {
  "hr": "HR",
  "tech": "Tech",
  "behavioral": "Behavioral"
}

export function getQuestions(persona: string, difficulty: string): Question[] {
  const mappedPersona = personaMap[persona.toLowerCase()] || persona
  const mappedDifficulty = difficultyMap[difficulty.toLowerCase()] || difficulty
  const key = `${mappedPersona}-${mappedDifficulty}`
  return questionBank[key] || []
}

export function getRandomQuestion(
  persona: string,
  difficulty: string,
  excludeIds: string[] = [],
): Question | null {
  const questions = getQuestions(persona, difficulty)
  const availableQuestions = questions.filter((q) => !excludeIds.includes(q.id))

  if (availableQuestions.length === 0) return null

  const randomIndex = Math.floor(Math.random() * availableQuestions.length)
  return availableQuestions[randomIndex]
}
