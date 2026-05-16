type ErrorStateProps = {
  title: string;
  description?: string;
};

export default function ErrorState({ title, description }: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-6 text-rose-100">
      <h3 className="text-lg font-semibold">{title}</h3>
      {description ? <p className="mt-2 text-sm">{description}</p> : null}
    </div>
  );
}
