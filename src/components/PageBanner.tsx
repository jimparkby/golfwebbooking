export default function PageBanner({ image, title }: { image: string; title: string }) {
  return (
    <div
      className="relative flex h-48 items-center justify-center bg-cover bg-center sm:h-64"
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <h1 className="relative text-2xl font-semibold text-white sm:text-3xl">{title}</h1>
    </div>
  );
}
