import { z } from "zod";

export const propSchema = z.object({
  chartType: z.string().describe("The chart type"),
  option: z.record(z.string(), z.unknown()).describe("ECharts option object"),
});

export type ChartDisplayProps = z.infer<typeof propSchema>;
