import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

const chartConfig = {
  gpa: { label: "Avg GPA", color: "#2563EB" },
  datAa: { label: "DAT AA", color: "#10B981" },
  datPat: { label: "DAT PAT", color: "#F59E0B" },
};

export default function SchoolTrendChart({
  data,
}: {
  data: Array<{
    year: number;
    gpa: number | null;
    datAa?: number;
    datPat?: number;
  }>;
}) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[300px]">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis dataKey="year" stroke="var(--text-tertiary)" fontSize={12} />
        <YAxis
          stroke="var(--text-tertiary)"
          fontSize={12}
          domain={[0, "auto"]}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          type="monotone"
          dataKey="gpa"
          stroke={chartConfig.gpa.color}
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="datAa"
          stroke={chartConfig.datAa.color}
          strokeWidth={2}
          dot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="datPat"
          stroke={chartConfig.datPat.color}
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ChartContainer>
  );
}
