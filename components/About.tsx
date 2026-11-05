export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="bg-brown text-cream">
      <div className="mx-auto max-w-3xl px-5 py-16 md:py-20">
        <h2 id="about-title" className="font-display text-3xl font-bold text-yellow sm:text-4xl">
          Why we do this
        </h2>
        <div className="mt-6 space-y-5 text-lg leading-relaxed text-cream/90">
          <p>
            Students carry so much. Lectures, deadlines, money worries, home,
            the pressure of exams. We cannot fix every problem they face.
          </p>
          <p>
            But we can offer a meal to those who need it, when they need it
            most.
          </p>
          <p>
            Since January, Safe Haven has provided food to more than{" "}
            <strong className="text-yellow">300 students</strong> during
            examination seasons. This is our third edition.
          </p>
          <p>
            Safe Haven is led by the Holy Spirit through{" "}
            <strong className="text-cream">Anokwu Chiaza Daniella</strong>, a
            500-level Computer Engineering student.
          </p>
        </div>
      </div>
    </section>
  );
}
