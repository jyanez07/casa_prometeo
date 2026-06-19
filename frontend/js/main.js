/* =========================================================
   Casa Prometeo — JS (vanilla)
   - Carrusel de profesores (carga desde /api/profesores)
   - Formulario que abre WhatsApp con el mensaje listo
   - Menú móvil
   ========================================================= */

/* ⚠️ CONFIGURA AQUÍ TU NÚMERO DE WHATSAPP (con código de país, solo dígitos).
   Ejemplo México: 52 + número a 10 dígitos => "5215512345678" */
const WHATSAPP_NUMBER = "525518314793";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  initMobileMenu();
  initContactForm();
  initCarousel();
});

/* ---------------- Menú móvil ---------------- */
function initMobileMenu() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );
}

/* ---------------- Formulario -> WhatsApp ---------------- */
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const nombre = (data.get("nombre") || "").toString().trim();
    const telefono = (data.get("telefono") || "").toString().trim();
    const interes = (data.get("interes") || "").toString().trim();
    const mensaje = (data.get("mensaje") || "").toString().trim();

    // Validación mínima
    let ok = true;
    [["nombre", nombre], ["telefono", telefono], ["interes", interes]].forEach(
      ([name, value]) => {
        const field = form.querySelector(`[name="${name}"]`);
        if (!value) {
          field.classList.add("field-error");
          ok = false;
        } else {
          field.classList.remove("field-error");
        }
      }
    );
    if (!ok) return;

    const texto =
      `¡Hola Casa Prometeo! 👋%0A%0A` +
      `*Nombre:* ${nombre}%0A` +
      `*Teléfono:* ${telefono}%0A` +
      `*Me interesa:* ${interes}` +
      (mensaje ? `%0A*Mensaje:* ${mensaje}` : "");

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${texto}`;
    window.open(url, "_blank");
  });
}

/* ---------------- Carrusel de profesores ---------------- */
async function initCarousel() {
  const track = document.getElementById("track");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const dotsWrap = document.getElementById("dots");
  if (!track) return;

  let profesores = [];
  try {
    const res = await fetch("/api/profesores");
    if (!res.ok) throw new Error("HTTP " + res.status);
    profesores = await res.json();
  } catch (err) {
    track.innerHTML =
      '<p class="carousel-loading">No se pudieron cargar los profesores.</p>';
    console.error("Error cargando profesores:", err);
    return;
  }

  // Render de tarjetas
  track.innerHTML = profesores
    .map(
      (p) => `
      <article class="profe-card">
        <img class="profe-photo" src="${p.foto}" alt="Foto de ${escapeHtml(p.nombre)}"
             onerror="this.src='/assets/profes/placeholder.svg'" />
        <div class="profe-body">
          <span class="profe-subject">${escapeHtml(p.materia)}</span>
          <h3 class="profe-name">${escapeHtml(p.nombre)}</h3>
          <p class="profe-bio">${escapeHtml(p.bio)}</p>
        </div>
      </article>`
    )
    .join("");

  const cards = Array.from(track.children);
  let index = 0;
  let autoplayId = null;

  function visibleCount() {
    if (window.innerWidth <= 720) return 1;
    if (window.innerWidth <= 980) return 2;
    return 3;
  }

  function maxIndex() {
    return Math.max(0, cards.length - visibleCount());
  }

  function buildDots() {
    dotsWrap.innerHTML = "";
    const pages = maxIndex() + 1;
    for (let i = 0; i < pages; i++) {
      const b = document.createElement("button");
      b.setAttribute("aria-label", `Ir al grupo ${i + 1}`);
      b.addEventListener("click", () => {
        index = i;
        update();
        restartAutoplay();
      });
      dotsWrap.appendChild(b);
    }
  }

  function update() {
    index = Math.min(index, maxIndex());
    const card = cards[0];
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const step = card.getBoundingClientRect().width + gap;
    track.style.transform = `translateX(${-index * step}px)`;

    prevBtn.disabled = index === 0;
    nextBtn.disabled = index >= maxIndex();

    Array.from(dotsWrap.children).forEach((d, i) =>
      d.classList.toggle("active", i === index)
    );
  }

  function next() {
    index = index >= maxIndex() ? 0 : index + 1; // vuelve al inicio (loop)
    update();
  }
  function prev() {
    index = index <= 0 ? maxIndex() : index - 1;
    update();
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayId = setInterval(next, 4500);
  }
  function stopAutoplay() {
    if (autoplayId) clearInterval(autoplayId);
  }
  function restartAutoplay() {
    startAutoplay();
  }

  prevBtn.addEventListener("click", () => { prev(); restartAutoplay(); });
  nextBtn.addEventListener("click", () => { next(); restartAutoplay(); });

  // Pausa autoplay al pasar el mouse
  const carousel = document.getElementById("carousel");
  carousel.addEventListener("mouseenter", stopAutoplay);
  carousel.addEventListener("mouseleave", startAutoplay);

  // Swipe táctil
  let startX = 0;
  let dragging = false;
  track.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    dragging = true;
    stopAutoplay();
  }, { passive: true });
  track.addEventListener("touchend", (e) => {
    if (!dragging) return;
    dragging = false;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) (dx < 0 ? next() : prev());
    startAutoplay();
  });

  // Reconstruye al cambiar tamaño (cambia cuántas tarjetas se ven)
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { buildDots(); update(); }, 150);
  });

  buildDots();
  update();
  startAutoplay();
}

/* ---------------- Utilidad ---------------- */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
