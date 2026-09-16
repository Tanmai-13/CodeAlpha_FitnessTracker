import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type WeeklyPoint = {
  label: string;
  date: string;
  steps: number;
  waterMl: number;
  calories: number;
  activeMinutes: number;
};

type Props = {
  data: WeeklyPoint[];
  metric: keyof Omit<WeeklyPoint, "label" | "date">;
  variant?: "area" | "bar";
};

const META = {
  steps: { name: "Steps", color: "var(--steps)" },
  waterMl: { name: "Water (ml)", color: "var(--water)" },
  calories: { name: "Calories", color: "var(--calories)" },
  activeMinutes: { name: "Active minutes", color: "var(--minutes)" },
} as const;

function FitTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-lg">
      <p className="font-medium text-popover-foreground">{label}</p>
      <p className="tabular-nums text-muted-foreground">
        {payload[0].name}: <span className="font-semibold text-foreground">{payload[0].value?.toLocaleString()}</span>
      </p>
    </div>
  );
}

export function WeeklyChart({ data, metric, variant = "area" }: Props) {
  const meta = META[metric];
  const axis = { stroke: "var(--muted-foreground)", fontSize: 12 } as const;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {variant === "area" ? (
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={meta.color} stopOpacity={0.5} />
                <stop offset="100%" stopColor={meta.color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} {...axis} />
            <YAxis tickLine={false} axisLine={false} width={48} {...axis} />
            <Tooltip content={<FitTooltip />} cursor={{ stroke: "var(--border)" }} />
            <Area
              type="monotone"
              dataKey={metric}
              name={meta.name}
              stroke={meta.color}
              strokeWidth={2.5}
              fill={`url(#grad-${metric})`}
            />
          </AreaChart>
        ) : (
          <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} {...axis} />
            <YAxis tickLine={false} axisLine={false} width={48} {...axis} />
            <Tooltip content={<FitTooltip />} cursor={{ fill: "var(--secondary)", opacity: 0.4 }} />
            <Bar dataKey={metric} name={meta.name} fill={meta.color} radius={[6, 6, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
