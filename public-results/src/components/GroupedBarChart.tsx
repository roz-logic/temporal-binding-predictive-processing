import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";

export interface DataPoint {
  block: string;
  [key: string]: string | number;
}

export interface SeriesConfig {
  key: string;
  label: string;
  color: string;
}

interface GroupedBarChartProps {
  data: DataPoint[];
  series: SeriesConfig[];
  yAxisLabel: string;
  yDomain?: [number, number];
  referenceY?: number;
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg text-sm">
        <p className="font-semibold text-slate-800 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: <span className="font-medium">{Number(p.value).toFixed(3)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function GroupedBarChart({
  data,
  series,
  yAxisLabel,
  yDomain,
  referenceY = 1,
  height = 320,
}: GroupedBarChartProps) {
  const blocks = Array.from(new Set(data.map((d) => d.block)));

  // Build pivot: one row per block, columns = series keys
  const chartData = blocks.map((block) => {
    const entry: Record<string, string | number> = { block };
    series.forEach((s) => {
      const row = data.find((d) => {
        if (d.block !== block) return false;
        const discrimKey = Object.keys(d).find(
          (k) => k !== "block" && typeof d[k] === "string"
        );
        if (!discrimKey) return true;
        return d[discrimKey] === s.label;
      });
      const valKey = row
        ? Object.keys(row).find((k) => typeof row[k] === "number")
        : undefined;
      entry[s.key] = row && valKey ? (row[valKey] as number) : 0;
    });
    return entry;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        margin={{ top: 16, right: 24, left: 52, bottom: 64 }}
        barCategoryGap="28%"
        barGap={2}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="block"
          tick={{ fontSize: 11, fill: "#475569" }}
          angle={-22}
          textAnchor="end"
          interval={0}
          height={64}
        />
        <YAxis
          domain={yDomain}
          label={{
            value: yAxisLabel,
            angle: -90,
            position: "insideLeft",
            offset: -36,
            style: { fontSize: 12, fill: "#475569", fontWeight: 600 },
          }}
          tick={{ fontSize: 11, fill: "#475569" }}
          tickFormatter={(v) => Number(v).toFixed(2)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        {referenceY !== undefined && (
          <ReferenceLine
            y={referenceY}
            stroke="#94a3b8"
            strokeDasharray="4 2"
            strokeWidth={1.5}
          />
        )}
        {series.map((s) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            fill={s.color}
            radius={[3, 3, 0, 0]}
            maxBarSize={36}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
