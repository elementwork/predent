import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { schools as schoolData } from "@contracts/schools";

const avgDatAaMap: Record<string, number> = {};
const avgDatPatMap: Record<string, number> = {};
const avgDatRcMap: Record<string, number> = {};

for (const school of schoolData) {
  const parseNum = (s: string) => {
    const n = parseFloat(s);
    return Number.isNaN(n) ? 0 : n;
  };
  avgDatAaMap[school.id] = parseNum(school.avgDatAa);
  avgDatPatMap[school.id] = parseNum(school.avgDatPat);
  avgDatRcMap[school.id] = parseNum(school.avgDatRc);
}

function normalizeGpa(gpa: number, scale: "4.0" | "100") {
  if (scale === "100") return (gpa / 100) * 4;
  return gpa;
}

function scoreComponent(value: number, benchmark: number, maxScore: number) {
  if (benchmark <= 0) return maxScore * 0.75;
  const ratio = value / benchmark;
  if (ratio >= 1.05) return maxScore;
  if (ratio >= 0.95) return maxScore * 0.9;
  if (ratio >= 0.85) return maxScore * 0.75;
  if (ratio >= 0.75) return maxScore * 0.6;
  return maxScore * 0.4;
}

export const toolsRouter = createRouter({
  calculateCompetitiveness: publicQuery
    .input(
      z
        .object({
          gpa: z.number().min(0),
          gpaScale: z.enum(["4.0", "100"]),
          datAa: z.number().int().min(1).max(30),
          datPat: z.number().int().min(1).max(30),
          datRc: z.number().int().min(1).max(30),
          province: z.string(),
          degreeStatus: z
            .enum(["in_progress", "completed"])
            .default("in_progress"),
          casperQuartile: z.number().int().min(0).max(4).default(0),
          extracurricularScore: z.number().int().min(1).max(10).default(5),
        })
        .superRefine((v, ctx) => {
          if (v.gpaScale === "4.0" && v.gpa > 4.33) {
            ctx.addIssue({
              code: "too_big",
              maximum: 4.33,
              path: ["gpa"],
              message: "GPA must be ≤ 4.33 on a 4.0 scale",
              origin: "number",
              inclusive: true,
            });
          }
          if (v.gpaScale === "100" && v.gpa > 100) {
            ctx.addIssue({
              code: "too_big",
              maximum: 100,
              path: ["gpa"],
              message: "GPA must be ≤ 100 on a 100 scale",
              origin: "number",
              inclusive: true,
            });
          }
        })
    )
    .query(({ input }) => {
      const results = schoolData.map(school => {
        const userGpa = normalizeGpa(input.gpa, input.gpaScale);
        const schoolGpa = normalizeGpa(
          school.avgAdmittedGpaNumeric,
          school.gpaScale
        );

        const isIp = input.province === school.province;
        const acceptanceRate = isIp
          ? school.ipAcceptanceRate
          : school.oopAcceptanceRate;

        const schoolAvgDatAa = avgDatAaMap[school.id] ?? 0;
        const schoolAvgDatPat = avgDatPatMap[school.id] ?? 0;
        const schoolAvgDatRc = avgDatRcMap[school.id] ?? 0;

        // Weighted scoring model
        const gpaScore = scoreComponent(userGpa, schoolGpa, 25);
        const aaScore = scoreComponent(input.datAa, schoolAvgDatAa, 20);
        const patScore = scoreComponent(input.datPat, schoolAvgDatPat, 15);
        const rcScore = scoreComponent(input.datRc, schoolAvgDatRc, 10);
        const provinceScore = isIp ? 15 : 5;
        const degreeScore = input.degreeStatus === "completed" ? 5 : 3;
        const casperScore =
          input.casperQuartile > 0 ? input.casperQuartile * 1.25 : 3;
        const ecScore = (input.extracurricularScore / 10) * 5;

        const total = Math.round(
          gpaScore +
            aaScore +
            patScore +
            rcScore +
            provinceScore +
            degreeScore +
            casperScore +
            ecScore
        );

        let rating: "Safety" | "Competitive" | "Reach";
        if (total >= 70) rating = "Safety";
        else if (total >= 40) rating = "Competitive";
        else rating = "Reach";

        return {
          schoolId: school.id,
          schoolName: school.name,
          province: school.province,
          program: school.program,
          seats: school.seats,
          probability: total,
          rating,
          isIp,
          acceptanceRate,
          breakdown: {
            gpa: { your: userGpa, schoolAvg: schoolGpa, score: gpaScore },
            datAa: {
              your: input.datAa,
              schoolAvg: schoolAvgDatAa,
              score: aaScore,
            },
            datPat: {
              your: input.datPat,
              schoolAvg: schoolAvgDatPat,
              score: patScore,
            },
            datRc: {
              your: input.datRc,
              schoolAvg: schoolAvgDatRc,
              score: rcScore,
            },
            province: {
              your: input.province,
              schoolProvince: school.province,
              score: provinceScore,
            },
          },
        };
      });

      return {
        results: results.sort((a, b) => b.probability - a.probability),
      };
    }),
});
