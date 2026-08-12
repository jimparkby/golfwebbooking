"use client";

export default function PhoneInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="tel"
      inputMode="numeric"
      placeholder="+375291234567"
      value={value}
      onChange={(e) => {
        let v = e.target.value.replace(/[^\d+]/g, "");
        if (!v.startsWith("+375")) {
          const digits = v.replace(/\D/g, "").replace(/^375/, "");
          v = `+375${digits}`;
        }
        onChange(v.slice(0, 13));
      }}
      className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
    />
  );
}
