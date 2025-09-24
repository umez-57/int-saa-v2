import { createClient } from "@supabase/supabase-js"

// Only run seeds in development with explicit flag
if (process.env.NODE_ENV !== "development" || process.env.DEV_SEED !== "true") {
  console.log("Skipping seeds - set DEV_SEED=true in development to run")
  process.exit(0)
}

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function seedData() {
  console.log("🌱 Starting seed process...")

  try {
    // Create a test user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: "00000000-0000-0000-0000-000000000001",
        full_name: "Demo User",
        experience_level: "mid",
        target_role: "Software Engineer",
        preferred_difficulty: "medium",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (profileError) throw profileError

    // Create sample interview sessions
    const sessions = [
      {
        id: "11111111-1111-1111-1111-111111111111",
        user_id: "00000000-0000-0000-0000-000000000001",
        persona: "technical",
        difficulty: "medium",
        mode: "timed_5",
        status: "completed",
        mic_check_accuracy: 92.5,
        total_questions: 5,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        ended_at: new Date(Date.now() - 86400000 * 2 + 300000).toISOString(), // 5 min later
      },
      {
        id: "22222222-2222-2222-2222-222222222222",
        user_id: "00000000-0000-0000-0000-000000000001",
        persona: "behavioral",
        difficulty: "easy",
        mode: "timed_10",
        status: "completed",
        mic_check_accuracy: 88.3,
        total_questions: 7,
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        ended_at: new Date(Date.now() - 86400000 + 600000).toISOString(), // 10 min later
      },
      {
        id: "33333333-3333-3333-3333-333333333333",
        user_id: "00000000-0000-0000-0000-000000000001",
        persona: "system_design",
        difficulty: "hard",
        mode: "unlimited",
        status: "completed",
        mic_check_accuracy: 95.1,
        total_questions: 3,
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        ended_at: new Date(Date.now() - 1800000).toISOString(), // 30 min later
      },
    ]

    const { error: sessionsError } = await supabase.from("interview_sessions").upsert(sessions)

    if (sessionsError) throw sessionsError

    // Create sample answers for each session
    const answers = [
      // Session 1 answers
      {
        id: "44444444-4444-4444-4444-444444444444",
        session_id: "11111111-1111-1111-1111-111111111111",
        question_number: 1,
        question_text: "Explain the difference between let, const, and var in JavaScript.",
        transcript:
          "Let and const are block-scoped while var is function-scoped. Const cannot be reassigned after declaration, let can be reassigned but not redeclared in the same scope.",
        response_time_ms: 45000,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: "55555555-5555-5555-5555-555555555555",
        session_id: "11111111-1111-1111-1111-111111111111",
        question_number: 2,
        question_text: "How would you implement a debounce function?",
        transcript:
          "A debounce function delays execution until after a specified time has passed since the last invocation. I would use setTimeout and clearTimeout to implement this.",
        response_time_ms: 62000,
        created_at: new Date(Date.now() - 86400000 * 2 + 60000).toISOString(),
      },
      // Session 2 answers
      {
        id: "66666666-6666-6666-6666-666666666666",
        session_id: "22222222-2222-2222-2222-222222222222",
        question_number: 1,
        question_text: "Tell me about a time you had to work with a difficult team member.",
        transcript:
          "I once worked with a colleague who was resistant to feedback. I approached them privately to understand their perspective and found common ground by focusing on our shared goals.",
        response_time_ms: 78000,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      // Session 3 answers
      {
        id: "77777777-7777-7777-7777-777777777777",
        session_id: "33333333-3333-3333-3333-333333333333",
        question_number: 1,
        question_text: "Design a URL shortening service like bit.ly.",
        transcript:
          "I would start with a load balancer, application servers, and a database for URL mappings. For the short URL generation, I would use base62 encoding with a counter or hash function.",
        response_time_ms: 180000,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ]

    const { error: answersError } = await supabase.from("interview_answers").upsert(answers)

    if (answersError) throw answersError

    console.log("✅ Seed data created successfully!")
    console.log(`- Created profile for Demo User`)
    console.log(`- Created ${sessions.length} interview sessions`)
    console.log(`- Created ${answers.length} sample answers`)
    console.log("\n🎯 You can now sign in and view the history page with sample data")
  } catch (error) {
    console.error("❌ Seed failed:", error)
    process.exit(1)
  }
}

seedData()
