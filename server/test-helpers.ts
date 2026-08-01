import { getDb } from "./queries/connection";
import {
  users,
  profiles,
  tasks,
  notifications,
  communityPosts,
  patQuestions,
  datQuestions,
  type User,
} from "@db/schema";

export async function createTestUser(
  overrides: Partial<User> = {}
): Promise<User> {
  const db = getDb();
  const unionId = `test-${Math.random().toString(36).slice(2)}`;
  const [user] = await db
    .insert(users)
    .values({
      provider: "google",
      unionId,
      name: "Test User",
      email: `test-${unionId}@example.com`,
      role: "user",
      tier: "free",
      ...overrides,
    })
    .returning();
  return user;
}

export function mockContext(user?: User) {
  return {
    req: new Request("http://localhost"),
    resHeaders: new Headers(),
    user,
  };
}

export async function seedTask(userId: number, overrides = {}) {
  const db = getDb();
  const [task] = await db
    .insert(tasks)
    .values({
      userId,
      title: "Test task",
      category: "academic",
      status: "not_started",
      priority: "medium",
      ...overrides,
    })
    .returning();
  return task;
}

export async function seedNotification(userId: number, overrides = {}) {
  const db = getDb();
  const [notification] = await db
    .insert(notifications)
    .values({
      userId,
      type: "system",
      title: "Test notification",
      message: "Hello",
      ...overrides,
    })
    .returning();
  return notification;
}

export async function seedCommunityPost(userId: number, overrides = {}) {
  const db = getDb();
  const [post] = await db
    .insert(communityPosts)
    .values({
      userId,
      type: "discussion",
      title: "Test post",
      content: "Test content",
      ...overrides,
    })
    .returning();
  return post;
}

export async function seedPatQuestion(overrides = {}) {
  const db = getDb();
  const [question] = await db
    .insert(patQuestions)
    .values({
      publicId: `test-${Math.random().toString(36).slice(2)}`,
      category: "keyholes",
      difficulty: "beginner",
      source: "curated",
      questionData: {
        prompt: "Test prompt",
        diagram: "",
        options: ["A", "B", "C", "D"],
      },
      correctAnswer: 0,
      explanationL1: "L1",
      explanationL2: "L2",
      explanationL3: "L3",
      concepts: ["concept"],
      timeTarget: 30,
      ...overrides,
    })
    .returning();
  return question;
}

export async function seedDatQuestion(overrides = {}) {
  const db = getDb();
  const [question] = await db
    .insert(datQuestions)
    .values({
      publicId: `test-dat-${Math.random().toString(36).slice(2)}`,
      subject: "biology",
      topic: "cell",
      difficulty: "beginner",
      questionText: "What is the powerhouse of the cell?",
      options: ["Mitochondria", "Nucleus", "Ribosome", "Golgi"],
      correctAnswer: 0,
      explanation: "Mitochondria produce ATP.",
      ...overrides,
    })
    .returning();
  return question;
}

export async function seedProfile(userId: number, overrides = {}) {
  const db = getDb();
  const [profile] = await db
    .insert(profiles)
    .values({
      userId,
      firstName: "Test",
      lastName: "User",
      province: "Ontario",
      ...overrides,
    })
    .returning();
  return profile;
}
