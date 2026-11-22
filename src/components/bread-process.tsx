"use client";

import { useEffect, useRef, useState } from "react";
import { WheatDrawing } from "@/components/wheat-drawing";
import { useProcessFrame } from "@/lib/use-process-frame";

export function BreadProcess({ preview = false }: { preview?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  useProcessFrame(sectionRef, !preview);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video || failed || preview) {
      video?.pause();
      return;
    }

    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    }, { threshold: 0.2 });
    observer.observe(section);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [failed, preview]);

  return <section ref={sectionRef} className="process" id="proceso" aria-labelledby="process-title">
    <div className="process-sticky">
      <div className="wrap process-heading">
        <h2 id="process-title">Así toma<br /><em>forma<br />el pan.</em></h2>
      </div>
      <div className="wrap process-film">
        <div className="film-perspective">
          <div className="film-image">
            <video ref={videoRef} autoPlay={!preview} loop muted playsInline controls={false}
              disablePictureInPicture controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
              preload={preview ? "none" : "auto"}
              aria-label="Video en bucle del proceso de elaboración del pan"
              onCanPlay={event => { if (!preview) void event.currentTarget.play().catch(() => undefined); }}
              onError={() => setFailed(true)}>
              <source src="/videos/proceso/proceso-del-pan.mp4" type="video/mp4" />
            </video>
            {failed && <div className="film-error" role="status"><p>No se pudo cargar el video.</p><a href="/videos/proceso/proceso-del-pan.mp4">Abrir el clip directamente</a></div>}
          </div>
        </div>
        <WheatDrawing className="film-wheat film-wheat-left" quiet />
        <WheatDrawing className="film-wheat film-wheat-right" mirrored quiet />
      </div>
    </div>
  </section>;
}
