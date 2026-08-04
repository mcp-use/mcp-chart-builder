import { MCPServer } from "mcp-use";
import { z } from "zod";

const server = new MCPServer({
  name: "chart-builder",
  title: "Chart Builder",
  version: "1.0.0",
  description: "Interactive data visualization — ECharts in your chat",
  icons: [
    { src: "icon.svg", mimeType: "image/svg+xml", sizes: ["512x512"] },
  ],
});

const chartInputSchema = z.object({
  title: z.string().optional().describe("Chart title"),
  chartType: z
    .enum(["bar", "line", "pie", "scatter", "radar", "heatmap", "treemap", "sunburst", "gauge", "funnel"])
    .describe("Primary chart type"),
  option: z
    .string()
    .describe(
      "Full ECharts option object as a JSON string. Must include at minimum xAxis/yAxis/series for cartesian charts or series for pie/radar/gauge."
    ),
});

const chartOutputSchema = z.object({
  chartType: z.string(),
  option: z.record(z.string(), z.unknown()),
});

export const createChart = server.tool(
  {
    name: "create-chart",
    description:
      "Create an interactive chart. Supports bar, line, pie, scatter, radar, heatmap, and more. " +
      "Pass a full ECharts option object as JSON. The chart renders live as you stream.",
    inputSchema: chartInputSchema,
    outputSchema: chartOutputSchema,
    view: {
      name: "chart-display",
      description: "Interactive chart powered by Apache ECharts",
      prefersBorder: true,
    },
  },
  async ({ title, chartType, option }) => {
    let parsedOption: Record<string, unknown>;
    try {
      parsedOption = JSON.parse(option);
    } catch {
      return {
        content: [
          {
            type: "text",
            text: "Invalid JSON in option parameter. Please provide valid ECharts option JSON.",
          },
        ],
        isError: true,
      };
    }

    if (title && !parsedOption.title) {
      parsedOption.title = { text: title };
    }

    const data = { chartType, option: parsedOption };
    return {
      content: [
        {
          type: "text",
          text: `Created ${chartType} chart${title ? `: ${title}` : ""}`,
        },
      ],
      structuredContent: data,
    };
  }
);

export default server;
