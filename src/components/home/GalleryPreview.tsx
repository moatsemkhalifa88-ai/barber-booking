import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Dictionary } from "@/i18n";

const tileIds = [1, 2, 3, 4, 5, 6] as const;

/** "From our work": photo grid on beige; a swipe row on phones. */
export function GalleryPreview({ dict }: { dict: Dictionary }) {
  return (
    <section id="gallery" className="section-y bg-canvas">
      <div className="container-page flex flex-col gap-8 lg:gap-12">
        <SectionHeading eyebrow={dict.gallery.eyebrow} title={dict.gallery.title} description={dict.gallery.description} />

        <div className="swipe-row sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0">
          {tileIds.map((id) => (
            <div key={id} className="relative aspect-[4/5] w-[68%] overflow-hidden rounded-lg sm:aspect-square sm:w-auto">
              <Image
                src={`/images/gallery/gallery-${id}.jpg`}
                alt={dict.gallery.alt[id]}
                fill
                sizes="(min-width: 640px) 33vw, 68vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
