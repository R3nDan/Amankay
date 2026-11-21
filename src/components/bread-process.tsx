"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowDown, SlidersHorizontal, Wheat } from "lucide-react";

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(callback: () => void) {
  const query = matchMedia(motionQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const getReducedMotion = () => matchMedia(motionQuery).matches;
const getServerReducedMotion = () => true;

export function BreadProcess() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useSyncExternalStore(subscribeMotion, getReducedMotion, getServerReducedMotion);
  const [scrollOverride, setScrollOverride] = useState<boolean | null>(null);
  const scrollMode = scrollOverride ?? !reducedMotion;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video || failed) return;
    let frame = 0;
    let targetTime = 0;
    let scrollEnabled = false;

    const showProgress = (progress: number) => {
      section.style.setProperty("--progress", String(progress));
    };
    // One seek at a time; seeked catches up to the latest scroll position.
    const seek = () => {
      if (!scrollEnabled || video.seeking || video.readyState < 2) return;
      if (Math.abs(video.currentTime - targetTime) > 0.04) video.currentTime = targetTime;
    };
    const update = () => {
      frame = 0;
      if (!scrollEnabled || !Number.isFinite(video.duration)) return;
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      targetTime = progress * Math.max(0, video.duration - 0.05);
      showProgress(progress);
      seek();
    };
    const schedule = () => {
      if (!frame && scrollEnabled) frame = requestAnimationFrame(update);
    };
    const timeUpdate = () => {
      if (!scrollEnabled && Number.isFinite(video.duration)) showProgress(video.currentTime / video.duration);
    };
    const loaded = () => {
      section.dataset.ready = String(video.readyState >= 2);
      schedule();
    };

    scrollEnabled = scrollMode;
    section.dataset.scrub = scrollEnabled ? "enabled" : "disabled";
    video.controls = !scrollEnabled;
    video.pause();
    loaded();
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        video.preload = "auto";
        if (video.readyState < 2) video.load();
        observer.disconnect();
      }
    }, { rootMargin: "600px" });
    observer.observe(section);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    video.addEventListener("loadeddata", loaded);
    video.addEventListener("seeked", seek);
    video.addEventListener("timeupdate", timeUpdate);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      video.removeEventListener("loadeddata", loaded);
      video.removeEventListener("seeked", seek);
      video.removeEventListener("timeupdate", timeUpdate);
      video.pause();
    };
  }, [scrollMode, failed]);

  return <section ref={sectionRef} className="process" id="proceso" aria-labelledby="process-title">
    <div className="process-sticky">
      <div className="wrap process-heading">
        <div><p className="kicker"><Wheat size={18} strokeWidth={1.4} aria-hidden /> Tiempo, manos y horno</p>
          <h2 id="process-title">El oficio <em>del pan.</em></h2></div>
        <p className="scroll-instruction">Tú marcas el ritmo.<br /><span>Baja para avanzar. Sube para volver.</span><ArrowDown size={20} aria-hidden /></p>
        <p className="manual-instruction">Del primer amasado a la última hornada.<br />Reproduce el video a tu ritmo.</p>
      </div>
      <div className="wrap process-film">
        <video ref={videoRef} muted playsInline controls preload="metadata"
          poster="/imagenes/portada/hornada.webp" aria-label="Proceso de elaboración del pan"
          aria-describedby="process-description" onError={() => setFailed(true)}>
          <source src="/videos/proceso/proceso-del-pan.mp4" type="video/mp4" />
          Tu navegador no puede reproducir este video.
        </video>
        {!failed && <span className="film-status" role="status">Preparando el recorrido…</span>}
        {failed && <div className="film-error" role="status"><p>No se pudo cargar el video.</p><a href="/videos/proceso/proceso-del-pan.mp4">Abrir el clip directamente</a></div>}
        <div className="film-progress" aria-hidden><span /></div>
      </div>
      <div className="wrap process-bottom">
        <p id="process-description">La masa toma forma, pasa por el horno y se convierte en pan dorado para compartir.</p>
        <div className="film-actions">
          {!failed && <button type="button" onClick={() => setScrollOverride(!scrollMode)}><SlidersHorizontal size={15} aria-hidden />{scrollMode ? "Control manual" : "Activar recorrido con scroll"}</button>}
          <a href="#despues-del-proceso">Saltar el recorrido <ArrowDown size={14} aria-hidden /></a>
        </div>
      </div>
    </div>
  </section>;
}
