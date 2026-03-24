import {
  McpUseProvider,
  useWidget,
  type WidgetMetadata,
} from "mcp-use/react";
import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import "../styles.css";
import { propSchema, type ChartDisplayProps } from "./types";

export const widgetMetadata: WidgetMetadata = {
  description: "Interactive chart powered by Apache ECharts",
  props: propSchema,
  exposeAsTool: false,
  metadata: {
    prefersBorder: true,
    invoking: "Generating chart...",
    invoked: "Chart ready",
  },
};

const ChartDisplay: React.FC = () => {
  const {
    props,
    isPending,
    isStreaming,
    partialToolInput,
    theme,
    displayMode,
    requestDisplayMode,
  } = useWidget<ChartDisplayProps>();

  const chartRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<echarts.ECharts | null>(null);

  const getOption = (): Record<string, unknown> | null => {
    if (props?.option) return props.option as Record<string, unknown>;
    if (isStreaming && partialToolInput) {
      try {
        const partial = partialToolInput as Partial<ChartDisplayProps>;
        if (partial.option && typeof partial.option === "object")
          return partial.option as Record<string, unknown>;
      } catch {
        return null;
      }
    }
    return null;
  };

  const renderChart = () => {
    const option = getOption();
    if (!chartRef.current || !option) return;

    if (!instanceRef.current) {
      instanceRef.current = echarts.init(
        chartRef.current,
        theme === "dark" ? "dark" : undefined,
        { renderer: "canvas" }
      );
    }

    try {
      instanceRef.current.setOption(option, true);
    } catch {
      // partial option may be invalid during streaming
    }
  };

  useEffect(() => {
    renderChart();
  }, [props, partialToolInput, theme]);

  useEffect(() => {
    if (!instanceRef.current) return;
    const ro = new ResizeObserver(() => instanceRef.current?.resize());
    if (chartRef.current) ro.observe(chartRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!instanceRef.current) return;
    instanceRef.current.dispose();
    instanceRef.current = echarts.init(
      chartRef.current,
      theme === "dark" ? "dark" : undefined,
      { renderer: "canvas" }
    );
    renderChart();
  }, [theme]);

  const isFullscreen = displayMode === "fullscreen";
  const chartHeight = isFullscreen ? "calc(100vh - 80px)" : "420px";

  if (isPending) {
    return (
      <McpUseProvider autoSize>
        <div className="p-6 bg-white dark:bg-gray-950">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Generating chart...
            </span>
          </div>
          <div
            className="rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"
            style={{ height: "380px" }}
          />
        </div>
      </McpUseProvider>
    );
  }

  return (
    <McpUseProvider autoSize>
      <div className="p-4 bg-white dark:bg-gray-950 min-h-[200px]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isStreaming && (
              <span className="inline-flex items-center gap-1.5 text-xs text-blue-500">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                Streaming...
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {!isFullscreen ? (
              <button
                onClick={() => requestDisplayMode("fullscreen")}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                ⛶ Fullscreen
              </button>
            ) : (
              <button
                onClick={() => requestDisplayMode("inline")}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                ✕ Exit
              </button>
            )}
          </div>
        </div>
        <div
          ref={chartRef}
          style={{ width: "100%", height: chartHeight }}
          className="rounded-xl overflow-hidden"
        />
      </div>
    </McpUseProvider>
  );
};

export default ChartDisplay;
