export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-6 text-center dark:bg-black">
      <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Barber Shop
      </h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        Professional barber booking website
      </p>
      <button className="mt-4 rounded-full bg-foreground px-6 py-3 text-base font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]">
        Book an appointment
      </button>
    </div>
  );
}
