import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "Team — Blockto" };

const members = [
  {
    name: "Tristan L.",
    role: "Chief Executive Officer",
    image: "/Chief Executive Officer (Tristan L).jpeg",
  },
  {
    name: "Ruben",
    role: "Senior Developer",
    image: "/Senior developer (Ruben).jpeg",
  },
  {
    name: "Karel",
    role: "Senior Technical Analyst",
    image: "/Technical Analyst (Karel).jpeg",
  },
  {
    name: "Tristan R.",
    role: "Senior Author",
    image: "/Tristan.jpeg",
  },
  {
    name: "Laurisa",
    role: "Junior Author",
    image: "/Laurisa (Junior Author).jpeg",
  },
  {
    name: "Marc",
    role: "Product & Design",
    image: "/Product and design (Marc).jpeg",
  },
];

function Initials({ name }: { name: string }) {
  const parts = name.replace(".", "").split(" ");
  const letters = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2);
  return (
    <div className="w-full h-full flex items-center justify-center text-[28px] font-black tracking-tight" style={{ color: "#ff6a00" }}>
      {letters.toUpperCase()}
    </div>
  );
}

export default function TeamPage() {
  return (
    <main className="relative z-10 max-w-[1440px] mx-auto px-3 md:px-10 pb-20 pt-10">
      {/* Header */}
      <div className="max-w-[760px] mx-auto mb-12">
        <span
          className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-4"
          style={{
            background: "rgba(255,106,0,0.06)",
            border: "1px solid rgba(255,106,0,0.2)",
            color: "#ff6a00",
          }}
        >
          Company
        </span>

        <h1 className="text-[32px] md:text-[40px] font-black tracking-[-1.2px] leading-tight mb-3">
          Meet the Team
        </h1>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--tw-text-opacity, 1)", opacity: 0.6 }}
        >
          A dedicated team of analysts, engineers, journalists, and designers
          building the future of crypto intelligence — headquartered in Utrecht,
          Netherlands.
        </p>

        <div
          className="mt-6 h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,106,0,0.25), transparent)",
          }}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-[1100px] mx-auto">
        {members.map((m) => (
          <div
            key={m.name}
            className="glass card-hover flex flex-col overflow-hidden"
            style={{ borderRadius: "var(--radius-lg)" }}
          >
            {/* Photo */}
            <div
              className="relative w-full"
              style={{
                aspectRatio: "4/3",
                background: "rgba(255,106,0,0.04)",
              }}
            >
              {m.image ? (
                <Image
                  src={m.image}
                  alt={m.name}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <Initials name={m.name} />
              )}
              {/* Gradient overlay at bottom of photo */}
              <div
                className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.55), transparent)",
                }}
              />
            </div>

            {/* Info */}
            <div className="p-5 flex flex-col gap-1 flex-1">
              <p
                className="text-[10px] font-extrabold uppercase tracking-widest"
                style={{ color: "#ff6a00" }}
              >
                {m.role}
              </p>
              <h2 className="text-[18px] font-extrabold tracking-tight leading-snug">
                {m.name}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* Contact strip */}
      <div
        className="mt-14 max-w-[1100px] mx-auto glass p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ borderRadius: "var(--radius-lg)" }}
      >
        <div>
          <p className="text-[13px] font-extrabold uppercase tracking-widest mb-1" style={{ color: "#ff6a00" }}>
            Get in touch
          </p>
          <p className="text-[14px]" style={{ opacity: 0.65 }}>
            Reach us at{" "}
            <a
              href="mailto:team@blockto.io"
              className="text-[#ff6a00] hover:underline"
            >
              team@blockto.io
            </a>{" "}
            · Utrecht, Netherlands
          </p>
        </div>
        <a
          href="/careers"
          className="shrink-0 px-5 py-2.5 rounded-full text-[13px] font-bold transition-opacity hover:opacity-80"
          style={{
            background: "linear-gradient(135deg, #ff6a00, #ff8a30)",
            color: "#fff",
          }}
        >
          View open roles
        </a>
      </div>
    </main>
  );
}
