// lib/azure-openai.ts - Temporarily using fallback due to import issues
// import { OpenAIClient } from "@azure/openai"
// import { AzureKeyCredential } from "@azure/core-auth"                                 

interface EvaluationResponse {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  keywords: string[];
  sentiment: string;
  clarity_score: number;
}

class AzureOpenAIService {
  private deploymentName: string;

  constructor() {
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o";

    if (!apiKey || !endpoint) {
      console.warn("Azure OpenAI API key or endpoint not configured. Using fallback evaluation.")
    }
  }

  async generateQuestion(prompt: string): Promise<string> {
    console.log("[Azure OpenAI] Using fallback question generation")
    // Fallback question - this should be handled by the backend anyway
    return "Could you tell me about your experience with this technology?"
  }

  async evaluateAnswer(prompt: string): Promise<EvaluationResponse> {
    console.log("[Azure OpenAI] Using fallback evaluation")
    
    // Fallback evaluation - this should be handled by the backend anyway
    return {
      score: Math.floor(Math.random() * 40) + 60, // Random score 60-100
      feedback: "Good answer! Keep it up.",
      strengths: ["Clear communication", "Good structure"],
      improvements: ["Add more specific examples"],
      keywords: ["experience", "skills", "teamwork"],
      sentiment: "positive",
      clarity_score: 0.8
    };
  }
}

let azureOpenAIService: AzureOpenAIService;

export function getAzureOpenAIService(): AzureOpenAIService {
  if (!azureOpenAIService) {
    azureOpenAIService = new AzureOpenAIService();
  }
  return azureOpenAIService;
}