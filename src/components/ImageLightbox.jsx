import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export function ImageLightbox({ open, images = [], activeIndex = 0, onIndexChange, onClose, title }) {
  if (!open || !images.length) return null;

  const currentIndex = Math.min(Math.max(activeIndex, 0), images.length - 1);
  const currentImage = images[currentIndex];

  const showPrevious = () => onIndexChange((currentIndex - 1 + images.length) % images.length);
  const showNext = () => onIndexChange((currentIndex + 1) % images.length);

  return (
    <>
      <div
        className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
        <div className="relative w-full max-w-6xl rounded-[2rem] border border-[var(--line)] bg-[#090a0b] p-4 shadow-[0_24px_90px_rgba(0,0,0,.6)] md:p-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-black/45 text-[var(--text-primary)]"
            aria-label="Close image preview"
          >
            <X size={18} />
          </button>

          <div className="mb-4 pr-16">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-green)]">Image magnification</p>
            <h3 className="mt-2 font-display text-3xl text-[var(--text-primary)]">{title}</h3>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-start">
            <div className="relative overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-[#0f1011]">
              <img
                src={currentImage}
                alt={title}
                className="max-h-[72vh] w-full object-contain transition duration-500 hover:scale-115"
              />

              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={showPrevious}
                    className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--line)] bg-black/45 text-[var(--text-primary)]"
                    aria-label="Show previous image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={showNext}
                    className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--line)] bg-black/45 text-[var(--text-primary)]"
                    aria-label="Show next image"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              ) : null}
            </div>

            {images.length > 1 ? (
              <div className="grid grid-cols-4 gap-3 lg:grid-cols-1">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => onIndexChange(index)}
                    className={`overflow-hidden rounded-[1.1rem] border transition ${
                      currentIndex === index
                        ? 'border-[var(--gold)] shadow-[0_0_0_1px_rgba(199,164,93,.25)]'
                        : 'border-[var(--line)] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={image} alt={`${title} ${index + 1}`} className="h-20 w-full object-cover lg:h-24" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
