interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export default function SectionHeader({ title, subtitle, align = "left" }: SectionHeaderProps) {
  return (
    <div className={`mb-12 ${align === "center" ? "text-center" : "text-left"}`}>
      <h2 className="text-3xl sm:text-4xl font-serif text-[#1D1A16] font-bold tracking-tight uppercase">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#C8A96A]">
          {subtitle}
        </p>
      )}
    </div>
  );
}
