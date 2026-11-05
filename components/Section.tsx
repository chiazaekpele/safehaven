// One column, one width, one heading style for every section.
export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-4 border-t border-brown/10">
      <div className="mx-auto max-w-3xl px-5 py-14 md:py-20">
        <h2 id={`${id}-title`} className="text-2xl font-bold tracking-tight text-brown sm:text-3xl">
          {title}
        </h2>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}
