(function () {
  const cfg = window.MINS_CONFIG || {};
  const $ = (q) => document.querySelector(q);
  const $$ = (q) => document.querySelectorAll(q);

  // Year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Inject contact
  const emailEl = $("#contactEmailText");
  const phoneEl = $("#contactPhoneText");
  const cityEl = $("#contactCityText");

  if (emailEl) emailEl.textContent = cfg.email || "minssolutionsti@gmail.com";
  if (phoneEl) phoneEl.textContent = cfg.whatsappNumber ? `+${cfg.whatsappNumber}` : "+57 XXX XXX XXXX";
  if (cityEl) cityEl.textContent = cfg.city || "Colombia";

  const topbar = $("#topbar-contact");
  if (topbar) {
    topbar.innerHTML = `
      <a class="hover:text-primary" href="mailto:${cfg.email || ""}">${cfg.email || "minssolutionsti@gmail.com"}</a>
      <span class="opacity-40">|</span>
      <a class="hover:text-primary" href="#contacto">Cotiza en 1 minuto</a>
    `;
  }

  // Portfolio link
  const portfolioBtn = $("#portfolioLinkBtn");
  if (portfolioBtn && cfg.portfolioUrl) portfolioBtn.href = cfg.portfolioUrl;

  // WhatsApp floating
  const waFloat = $("#whatsappFloat");
  if (waFloat && cfg.whatsappNumber) {
    const msg = encodeURIComponent(cfg.defaultWhatsappMessage || "Hola, quiero información.");
    waFloat.href = `https://wa.me/${cfg.whatsappNumber}?text=${msg}`;
  }

  // Toast
  const toast = $("#toast");
  let toastTimer = null;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }

  // Mobile menu
  const mobileBtn = $("#mobileMenuBtn");
  const mobileMenu = $("#mobileMenu");
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener("click", () => {
      const isHidden = mobileMenu.classList.contains("hidden");
      mobileMenu.classList.toggle("hidden");
      mobileBtn.setAttribute("aria-expanded", String(isHidden));
    });

    $$("[data-close-menu]").forEach((a) => {
      a.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
        mobileBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Theme toggle (localStorage)
  const themeToggle = $("#themeToggle");
  const themeIcon = $("#themeIcon");

  function setTheme(mode) {
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      localStorage.setItem("mins-theme", "dark");
      if (themeIcon) themeIcon.textContent = "light_mode";
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      localStorage.setItem("mins-theme", "light");
      if (themeIcon) themeIcon.textContent = "dark_mode";
    }
  }

  const savedTheme = localStorage.getItem("mins-theme");
  setTheme(savedTheme || "light");

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "light" : "dark");
    });
  }

  // Active section highlight
  const sections = ["#soluciones", "#proceso", "#portafolio", "#planes", "#contacto"]
    .map((id) => $(id))
    .filter(Boolean);

  const navLinks = $$(".navlink");

  function onScrollActive() {
    const y = window.scrollY + 120;
    let currentId = "#inicio";

    for (const sec of sections) {
      if (sec.offsetTop <= y) currentId = `#${sec.id}`;
    }

    navLinks.forEach((a) => {
      const isActive = a.getAttribute("href") === currentId;
      a.style.color = isActive ? "#00ABE4" : "";
    });
  }
  window.addEventListener("scroll", onScrollActive, { passive: true });
  onScrollActive();

  // Reveal on scroll
  const revealEls = $$(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("is-visible");
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => io.observe(el));

  // Portfolio filter
  const filterBtns = $$("#portfolioFilters .filter-btn");
  const portfolioItems = $$("#portfolioGrid .portfolio-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      const f = btn.dataset.filter;
      portfolioItems.forEach((card) => {
        const cat = card.dataset.category;
        const show = f === "all" || cat === f;
        card.style.display = show ? "" : "none";
      });
    });
  });

  // Form validation + WhatsApp send
  const form = $("#leadForm");

  function setError(name, msg) {
    const p = document.querySelector(`[data-error-for="${name}"]`);
    if (p) p.textContent = msg || "";
  }

  function validate(formEl) {
    let ok = true;
    const name = formEl.name.value.trim();
    const email = formEl.email.value.trim();
    const service = formEl.service.value.trim();
    const message = formEl.message.value.trim();

    setError("name", "");
    setError("email", "");
    setError("service", "");
    setError("message", "");

    if (name.length < 2) { setError("name", "Escribe tu nombre."); ok = false; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError("email", "Correo no válido."); ok = false; }
    if (!service) { setError("service", "Selecciona un servicio."); ok = false; }
    if (message.length < 10) { setError("message", "Cuéntanos un poco más (mínimo 10 caracteres)."); ok = false; }

    return { ok, data: { name, email, service, message } };
  }

  function buildLeadText(d) {
    return `Hola, soy ${d.name}.
Quiero cotizar: ${d.service}.
Detalles: ${d.message}
Correo: ${d.email}
Enviado desde la web de Mins Solutions TI.`;
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const { ok, data } = validate(form);
      if (!ok) return;

      if (!cfg.whatsappNumber) {
        showToast("Configura tu WhatsApp en assets/js/config.js");
        return;
      }

      const text = encodeURIComponent(buildLeadText(data));
      window.open(`https://wa.me/${cfg.whatsappNumber}?text=${text}`, "_blank", "noopener");
      form.reset();
      showToast("Mensaje listo para enviar por WhatsApp.");
    });
  }

  // Send by email
  const sendEmailBtn = $("#sendEmailBtn");
  if (sendEmailBtn) {
    sendEmailBtn.addEventListener("click", () => {
      if (!form) return;
      const { ok, data } = validate(form);
      if (!ok) return;

      const subject = encodeURIComponent(`Cotización - ${data.service}`);
      const body = encodeURIComponent(buildLeadText(data));
      window.location.href = `mailto:${cfg.email || ""}?subject=${subject}&body=${body}`;
      form.reset();
      showToast("Se abrió tu correo para enviar el mensaje.");
    });
  }

  // Back to top
  const backToTop = $("#backToTop");
  function onScrollTopButton() {
    if (!backToTop) return;
    if (window.scrollY > 700) backToTop.classList.remove("hidden");
    else backToTop.classList.add("hidden");
  }
  window.addEventListener("scroll", onScrollTopButton, { passive: true });
  onScrollTopButton();

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // JSON-LD injection
  const ld = $("#ld-json-business");
  if (ld) {
    const json = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: cfg.businessName || "Mins Solutions TI",
      founder: cfg.founder || "Iván Mejía Triana",
      areaServed: "CO",
      email: cfg.email || undefined,
      url: window.location.href,
      address: {
        "@type": "PostalAddress",
        addressCountry: "CO",
        addressLocality: (cfg.city || "Colombia"),
      }
    };
    ld.textContent = JSON.stringify(json);
  }
})();
function enviarPorWhatsApp() {
  const WHATSAPP_NUMBER = "573XXXXXXXXX"; // ← Reemplaza con tu número real

  // IDs corregidos según tu HTML real
  const nombre   = document.getElementById("nombre")?.value.trim()  || "";
  const email    = document.getElementById("email")?.value.trim()   || "";
  const servicio = document.getElementById("service")?.value.trim() || "";
  const mensaje  = document.getElementById("message")?.value.trim() || "";

  // Validación con mensajes específicos por campo
  if (!nombre) {
    document.querySelector("[data-error-for='name']").textContent = "El nombre es obligatorio.";
    document.getElementById("nombre").focus();
    return;
  }
  if (!servicio) {
    document.querySelector("[data-error-for='service']").textContent = "Selecciona un servicio.";
    document.getElementById("service").focus();
    return;
  }
  if (!mensaje || mensaje.length < 10) {
    document.querySelector("[data-error-for='message']").textContent = "Escribe al menos 10 caracteres.";
    document.getElementById("message").focus();
    return;
  }

  // Limpiar errores previos
  document.querySelectorAll(".error").forEach(el => el.textContent = "");

  // Construir mensaje estructurado
  const texto = `
🚀 *Nueva solicitud - Mins Solutions TI*

👤 *Nombre:* ${nombre}
📧 *Email:* ${email || "No indicado"}
💼 *Servicio de interés:* ${servicio}

💬 *Detalles:*
${mensaje}
  `.trim();

  // ── 5. Codificar y abrir WhatsApp ──────────────────────────────────
  const url = `https://wa.link/6kxvnf`;
  window.open(url, "_blank");
}
