import { getDb } from "../server/queries/connection";
import { interviewQuestions } from "@db/schema";

const questions = [
  // Panel - Motivation
  {
    publicId: "p-mot-1",
    format: "Panel" as const,
    category: "Motivation for Dentistry",
    question: "Why dentistry and not medicine?",
    frequency: 95,
  },
  {
    publicId: "p-mot-2",
    format: "Panel" as const,
    category: "Motivation for Dentistry",
    question: "When did you first decide you wanted to become a dentist?",
    frequency: 95,
  },
  {
    publicId: "p-mot-3",
    format: "Panel" as const,
    category: "Motivation for Dentistry",
    question: "What would you do if you could not be a dentist?",
    frequency: 90,
  },
  {
    publicId: "p-mot-4",
    format: "Panel" as const,
    category: "Motivation for Dentistry",
    question:
      "What does a typical day in the life of a dentist look like to you?",
    frequency: 85,
  },
  // Panel - Knowledge of Profession
  {
    publicId: "p-prof-1",
    format: "Panel" as const,
    category: "Knowledge of Profession",
    question:
      "What challenges do you think dentistry will face in the next 10 years?",
    frequency: 80,
  },
  {
    publicId: "p-prof-2",
    format: "Panel" as const,
    category: "Knowledge of Profession",
    question: "How do you see AI impacting dentistry?",
    frequency: 75,
  },
  {
    publicId: "p-prof-3",
    format: "Panel" as const,
    category: "Knowledge of Profession",
    question:
      "What are the biggest rewards and challenges of private practice?",
    frequency: 75,
  },
  // Panel - Strengths/Weaknesses
  {
    publicId: "p-sw-1",
    format: "Panel" as const,
    category: "Personal Strengths/Weaknesses",
    question: "What is your greatest weakness?",
    frequency: 75,
  },
  {
    publicId: "p-sw-2",
    format: "Panel" as const,
    category: "Personal Strengths/Weaknesses",
    question: "Tell us about a time you failed and what you learned.",
    frequency: 75,
  },
  {
    publicId: "p-sw-3",
    format: "Panel" as const,
    category: "Personal Strengths/Weaknesses",
    question: "What unique qualities do you bring to our program?",
    frequency: 70,
  },
  // Panel - Ethics
  {
    publicId: "p-eth-1",
    format: "Panel" as const,
    category: "Ethical Scenarios",
    question:
      "A patient refuses a treatment you strongly recommend. What do you do?",
    frequency: 70,
  },
  {
    publicId: "p-eth-2",
    format: "Panel" as const,
    category: "Ethical Scenarios",
    question:
      "You notice a colleague is impaired at work. What is your responsibility?",
    frequency: 65,
  },
  // Panel - School-Specific
  {
    publicId: "p-sch-1",
    format: "Panel" as const,
    category: "School-Specific",
    question: "Why do you want to attend our dental school specifically?",
    frequency: 60,
  },
  {
    publicId: "p-sch-2",
    format: "Panel" as const,
    category: "School-Specific",
    question: "How will you contribute to our school community?",
    frequency: 55,
  },
  // Panel - Current Events
  {
    publicId: "p-ce-1",
    format: "Panel" as const,
    category: "Current Events",
    question: "What healthcare issue in Canada concerns you most right now?",
    frequency: 50,
  },
  {
    publicId: "p-ce-2",
    format: "Panel" as const,
    category: "Current Events",
    question: "How should dentistry address access-to-care disparities?",
    frequency: 50,
  },
  // MMI - Ethical
  {
    publicId: "m-eth-1",
    format: "MMI" as const,
    category: "Ethical Scenario",
    question:
      "You are a dental student and observe a classmate cheating on an exam. What do you do?",
    frequency: 90,
  },
  {
    publicId: "m-eth-2",
    format: "MMI" as const,
    category: "Ethical Scenario",
    question:
      "A patient asks you to falsify an insurance claim. How do you respond?",
    frequency: 85,
  },
  // MMI - Communication
  {
    publicId: "m-com-1",
    format: "MMI" as const,
    category: "Communication",
    question:
      "Explain a complex dental procedure to a patient who has low health literacy.",
    frequency: 80,
  },
  {
    publicId: "m-com-2",
    format: "MMI" as const,
    category: "Communication",
    question:
      "A patient is angry about a billing error. Role-play how you would handle it.",
    frequency: 80,
  },
  // MMI - Problem Solving
  {
    publicId: "m-ps-1",
    format: "MMI" as const,
    category: "Problem Solving",
    question:
      "Your clinic is running 30 minutes behind schedule. How do you manage the remaining patients?",
    frequency: 75,
  },
  {
    publicId: "m-ps-2",
    format: "MMI" as const,
    category: "Problem Solving",
    question:
      "Design a public health campaign to reduce childhood cavities in a low-income community.",
    frequency: 70,
  },
  // MMI - Collaboration
  {
    publicId: "m-col-1",
    format: "MMI" as const,
    category: "Collaboration",
    question:
      "Describe a time you resolved a conflict while working in a group.",
    frequency: 70,
  },
  // MMI - Self-Reflection
  {
    publicId: "m-sr-1",
    format: "MMI" as const,
    category: "Self-Reflection",
    question:
      "Tell us about a time you received critical feedback. How did you respond?",
    frequency: 75,
  },
  {
    publicId: "m-sr-2",
    format: "MMI" as const,
    category: "Self-Reflection",
    question:
      "What is one thing you would change about yourself before starting dental school?",
    frequency: 70,
  },
  // MMI - Critical Thinking
  {
    publicId: "m-ct-1",
    format: "MMI" as const,
    category: "Critical Thinking",
    question:
      "Should dental care be fully covered under Canadian universal healthcare? Argue both sides.",
    frequency: 65,
  },
];

async function main() {
  console.log("Seeding interview questions...");
  const db = getDb();

  // Clear existing questions
  await db.delete(interviewQuestions);

  // Insert new questions
  for (const q of questions) {
    await db.insert(interviewQuestions).values({
      publicId: q.publicId,
      format: q.format,
      category: q.category,
      question: q.question,
      frequency: q.frequency,
    });
  }

  console.log(`Seeded ${questions.length} interview questions.`);
}

main().catch(console.error);
