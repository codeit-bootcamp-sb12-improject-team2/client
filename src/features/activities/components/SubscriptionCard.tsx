import Tag from "@/shared/components/Tag";

type SubscriptionCardProps = {
  name: string;
  keywords: string[];
  maxTags?: number;
};

export default function SubscriptionCard({
  name,
  keywords,
  maxTags = 8,
}: SubscriptionCardProps) {
  const safe = (keywords ?? []).filter(Boolean);
  const visible = safe.slice(0, maxTags);
  const overflow = safe.length > visible.length;

  return (
    <div className="flex w-full flex-col gap-3 py-5">
      <p className="text-16-sb text-slate-950">{name}</p>

      <div className="flex flex-wrap gap-2">
        {visible.map((k) => (
          <Tag key={k} label={k} />
        ))}
        {overflow && <Tag label="…" />}
      </div>
    </div>
  );
}
