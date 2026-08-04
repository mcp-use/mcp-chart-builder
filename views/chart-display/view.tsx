import { useDisplayMode, useToolContext, useViewTheme } from "mcp-use/react";
import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import "./view.css";

export default function ChartDisplay() {
  const view = useToolContext<"create-chart">();
  const theme = useViewTheme();
  const { displayMode, availableDisplayModes, requestDisplayMode } =
    useDisplayMode();
  const chartRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<echarts.ECharts | null>(null);
  const option = view.toolOutput?.option;

  useEffect(() => {
    if (!chartRef.current || !option) return;
    instanceRef.current?.dispose();
    instanceRef.current = echarts.init(
      chartRef.current,
      theme === "dark" ? "dark" : undefined,
      { renderer: "canvas" },
    );
    instanceRef.current.setOption(option, true);
    const observer = new ResizeObserver(() => instanceRef.current?.resize());
    observer.observe(chartRef.current);
    return () => {
      observer.disconnect();
      instanceRef.current?.dispose();
      instanceRef.current = null;
    };
  }, [option, theme]);

  if (view.status === "pending") {
    return (
      <div className="p-6 bg-white dark:bg-gray-950">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Generating chart...</span>
        </div>
        <div className="rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" style={{ height: "380px" }} />
      </div>
    );
  }

  if (view.status === "error") {
    return <p role="alert" className="p-4 text-red-600">{view.error.message}</p>;
  }

  const isFullscreen = displayMode === "fullscreen";
  return (
    <div className="p-4 bg-white dark:bg-gray-950 min-h-[200px]">
      <div className="flex justify-end mb-3">
        {availableDisplayModes.includes(isFullscreen ? "inline" : "fullscreen") && (
          <button
            type="button"
            onClick={() => void requestDisplayMode({ mode: isFullscreen ? "inline" : "fullscreen" })}
            className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isFullscreen ? "✕ Exit" : "⛶ Fullscreen"}
          </button>
        )}
      </div>
      <div ref={chartRef} style={{ width: "100%", height: isFullscreen ? "calc(100vh - 80px)" : "420px" }} className="rounded-xl overflow-hidden" />
    </div>
  );
}
