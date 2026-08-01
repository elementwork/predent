import { getDb } from "../server/queries/connection";
import { datQuestions } from "./schema";

const questions: {
  publicId: string;
  subject: "biology" | "chemistry" | "reading";
  topic: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "elite";
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}[] = [
  // Biology
  {
    publicId: "dat_bio_001",
    subject: "biology",
    topic: "Cell Biology",
    difficulty: "beginner",
    questionText:
      "Which organelle is primarily responsible for ATP production in eukaryotic cells?",
    options: ["Nucleus", "Mitochondrion", "Ribosome", "Golgi apparatus"],
    correctAnswer: 1,
    explanation:
      "Mitochondria are the powerhouses of the cell, generating ATP through cellular respiration.",
  },
  {
    publicId: "dat_bio_002",
    subject: "biology",
    topic: "Cell Biology",
    difficulty: "beginner",
    questionText: "What is the primary role of the cell membrane?",
    options: [
      "Protein synthesis",
      "Regulating material entry and exit",
      "DNA replication",
      "Energy production",
    ],
    correctAnswer: 1,
    explanation:
      "The cell membrane controls what enters and exits the cell, maintaining homeostasis.",
  },
  {
    publicId: "dat_bio_003",
    subject: "biology",
    topic: "Molecular Biology",
    difficulty: "intermediate",
    questionText:
      "During transcription, DNA is used as a template to synthesize:",
    options: ["Protein", "tRNA", "mRNA", "Amino acids"],
    correctAnswer: 2,
    explanation:
      "Transcription produces mRNA from a DNA template; translation then produces protein.",
  },
  {
    publicId: "dat_bio_004",
    subject: "biology",
    topic: "Physiology",
    difficulty: "intermediate",
    questionText:
      "Which blood vessel carries oxygenated blood from the lungs to the heart?",
    options: ["Pulmonary artery", "Pulmonary vein", "Aorta", "Vena cava"],
    correctAnswer: 1,
    explanation:
      "The pulmonary vein returns oxygenated blood from the lungs to the left atrium.",
  },
  {
    publicId: "dat_bio_005",
    subject: "biology",
    topic: "Microbiology",
    difficulty: "intermediate",
    questionText:
      "Which type of microorganism is characterized by a proteinaceous infectious particle?",
    options: ["Virus", "Bacterium", "Prion", "Fungus"],
    correctAnswer: 2,
    explanation:
      "Prions are misfolded proteins that can induce misfolding in normal proteins.",
  },
  {
    publicId: "dat_bio_006",
    subject: "biology",
    topic: "Anatomy",
    difficulty: "beginner",
    questionText: "Which bone forms the lower jaw?",
    options: ["Maxilla", "Mandible", "Zygomatic", "Temporal"],
    correctAnswer: 1,
    explanation:
      "The mandible is the largest and strongest bone of the face and forms the lower jaw.",
  },
  // Chemistry
  {
    publicId: "dat_chem_001",
    subject: "chemistry",
    topic: "Atomic Structure",
    difficulty: "beginner",
    questionText: "Which subatomic particle has a negative charge?",
    options: ["Proton", "Neutron", "Electron", "Nucleus"],
    correctAnswer: 2,
    explanation: "Electrons carry a negative charge and orbit the nucleus.",
  },
  {
    publicId: "dat_chem_002",
    subject: "chemistry",
    topic: "Bonding",
    difficulty: "beginner",
    questionText:
      "Which type of bond involves the sharing of electron pairs between atoms?",
    options: ["Ionic bond", "Covalent bond", "Hydrogen bond", "Metallic bond"],
    correctAnswer: 1,
    explanation:
      "Covalent bonds form when atoms share electron pairs to achieve stable electron configurations.",
  },
  {
    publicId: "dat_chem_003",
    subject: "chemistry",
    topic: "Stoichiometry",
    difficulty: "intermediate",
    questionText:
      "How many moles of water are produced when 2 moles of hydrogen gas react completely with 1 mole of oxygen gas?",
    options: ["1 mol", "2 mol", "3 mol", "4 mol"],
    correctAnswer: 1,
    explanation: "2H₂ + O₂ → 2H₂O, so 2 moles of H₂ produce 2 moles of H₂O.",
  },
  {
    publicId: "dat_chem_004",
    subject: "chemistry",
    topic: "Equilibrium",
    difficulty: "intermediate",
    questionText:
      "According to Le Chatelier's principle, if a dynamic equilibrium is disturbed, the system will:",
    options: [
      "Stop reacting",
      "Shift to counteract the disturbance",
      "Accelerate forward only",
      "Form a precipitate",
    ],
    correctAnswer: 1,
    explanation:
      "Le Chatelier's principle states that systems at equilibrium adjust to minimize applied stress.",
  },
  {
    publicId: "dat_chem_005",
    subject: "chemistry",
    topic: "Thermodynamics",
    difficulty: "advanced",
    questionText:
      "A reaction with a negative ΔH and negative ΔS is spontaneous at:",
    options: [
      "High temperatures only",
      "Low temperatures only",
      "All temperatures",
      "No temperatures",
    ],
    correctAnswer: 1,
    explanation:
      "ΔG = ΔH - TΔS. With ΔH < 0 and ΔS < 0, spontaneity requires low T so the -TΔS term stays small.",
  },
  {
    publicId: "dat_chem_006",
    subject: "chemistry",
    topic: "Electrochemistry",
    difficulty: "intermediate",
    questionText: "In a galvanic cell, oxidation occurs at the:",
    options: ["Cathode", "Anode", "Salt bridge", "External circuit"],
    correctAnswer: 1,
    explanation:
      "Oxidation occurs at the anode; reduction occurs at the cathode.",
  },
  // Reading Comprehension
  {
    publicId: "dat_rc_001",
    subject: "reading",
    topic: "Scientific Passages",
    difficulty: "intermediate",
    questionText:
      "Passage: Researchers found that students who spaced their study sessions over several weeks scored higher than those who crammed.\n\nWhat can be inferred from this passage?",
    options: [
      "Cramming is the most effective study method.",
      "Spaced repetition may improve long-term retention.",
      "All students prefer spaced study sessions.",
      "Study duration has no effect on exam scores.",
    ],
    correctAnswer: 1,
    explanation:
      "The passage supports that spacing study sessions leads to better performance, implying improved retention.",
  },
  {
    publicId: "dat_rc_002",
    subject: "reading",
    topic: "Scientific Passages",
    difficulty: "beginner",
    questionText:
      "Passage: Dental enamel is the hardest substance in the human body, composed primarily of hydroxyapatite.\n\nWhat is the main idea of this passage?",
    options: [
      "Hydroxyapatite is rare in the body.",
      "Dental enamel is notably hard and mineralized.",
      "Teeth contain no minerals.",
      "Bone is harder than enamel.",
    ],
    correctAnswer: 1,
    explanation:
      "The passage emphasizes that enamel is the hardest substance and is primarily hydroxyapatite.",
  },
  {
    publicId: "dat_rc_003",
    subject: "reading",
    topic: "Inference",
    difficulty: "intermediate",
    questionText:
      "Passage: The new policy reduced wait times in clinics, but some patients complained about shorter consultations.\n\nWhich statement is best supported?",
    options: [
      "Patients prefer longer wait times.",
      "The policy had both benefits and drawbacks.",
      "Wait times were unchanged.",
      "All patients were satisfied.",
    ],
    correctAnswer: 1,
    explanation:
      "The passage notes a benefit (reduced wait times) and a drawback (shorter consultations).",
  },
];

export async function seedDatQuestions() {
  const db = getDb();
  for (const q of questions) {
    await db
      .insert(datQuestions)
      .values(q)
      .onConflictDoNothing({ target: datQuestions.publicId });
  }
  console.log(`Seeded ${questions.length} DAT questions.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatQuestions().then(() => process.exit(0));
}
