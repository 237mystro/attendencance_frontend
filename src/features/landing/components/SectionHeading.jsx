/** Centred eyebrow / title / description block used by each landing section. */
export function SectionHeading({ eyebrow, title, description, id }) {
  return (
    <div className="mb-10 text-center md:mb-14">
      <p className="inline-flex rounded-lg bg-brand-50 px-3 py-1 text-xs font-extrabold text-brand-500">
        {eyebrow}
      </p>
      <h2
        id={id}
        className="mx-auto mt-4 max-w-3xl text-3xl font-extrabold tracking-[-0.04em] text-brand-950 md:text-5xl"
      >
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
        {description}
      </p>
    </div>
  );
}
