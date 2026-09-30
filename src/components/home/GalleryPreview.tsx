import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Dictionary } from "@/i18n";

const tileIds = [1, 2, 3, 4, 5, 6] as const;

export function GalleryPreview({ dict }: { dict: Dictionary }) {
  return (
    <section id="gallery" className="border-b border-border bg-surface-2">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-14 px-6 py-24 sm:px-8 lg:px-12 lg:py-32">
        <SectionHeading
          eyebrow={dict.gallery.eyebrow}
          title={dict.gallery.title}
          description={dict.gallery.description}
        />

        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3">
          {tileIds.map((id) => (
            <div
              key={id}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-border transition-colors duration-300 hover:border-accent"
            >
              <Image
                src={`/images/gallery/gallery-${id}.jpg`}
                alt={dict.gallery.alt[id]}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
