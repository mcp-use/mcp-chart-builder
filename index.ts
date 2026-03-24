import { MCPServer, text, widget } from "mcp-use/server";
import { z } from "zod";

const server = new MCPServer({
  name: "chart-builder",
  title: "Chart Builder",
  version: "1.0.0",
  description: "Interactive data visualization — ECharts in your chat",
  baseUrl: process.env.MCP_URL || "http://localhost:3000",
  favicon: "favicon.ico",
  icons: [
    { src: "icon.svg", mimeType: "image/svg+xml", sizes: ["512x512"] },
  ],
});

server.tool(
  {
    name: "create-chart",
    description:
      "Create an interactive chart. Supports bar, line, pie, scatter, radar, heatmap, and more. " +
      "Pass a full ECharts option object as JSON. The chart renders live as you stream.",
    schema: z.object({
      title: z.string().optional().describe("Chart title"),
      chartType: z
        .enum(["bar", "line", "pie", "scatter", "radar", "heatmap", "treemap", "sunburst", "gauge", "funnel"])
        .describe("Primary chart type"),
      option: z
        .string()
        .describe(
          "Full ECharts option object as a JSON string. Must include at minimum xAxis/yAxis/series for cartesian charts or series for pie/radar/gauge."
        ),
    }),
    widget: {
      name: "chart-display",
      invoking: "Generating chart...",
      invoked: "Chart ready",
    },
  },
  async ({ title, chartType, option }) => {
    let parsedOption: Record<string, unknown>;
    try {
      parsedOption = JSON.parse(option);
    } catch {
      return text("Invalid JSON in option parameter. Please provide valid ECharts option JSON.");
    }

    if (title && !parsedOption.title) {
      parsedOption.title = { text: title };
    }

    return widget({
      props: { chartType, option: parsedOption },
      output: text(`Created ${chartType} chart${title ? `: ${title}` : ""}`),
    });
  }
);

server.listen().then(() => console.log("Chart Builder running"));
