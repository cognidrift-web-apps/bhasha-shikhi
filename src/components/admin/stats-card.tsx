interface Props {
  label: string;
  value: string | number;
}

export function StatsCard({ label, value }: Props) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-stone-900 tabular-nums">{value}</p>
    </div>
  );
}
