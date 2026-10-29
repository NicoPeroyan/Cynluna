document.documentElement.classList.replace("no-js", "js");

// Use the international country code and number without spaces or punctuation.
const WHATSAPP_NUMBER = "";

function initializeMobileMenu() {
  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".primary-navigation");

  if (!header || !menuButton || !navigation) return;

  const setMenuOpen = (isOpen) => {
    header.classList.toggle("menu-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación");
  };

  menuButton.addEventListener("click", () => {
    setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
  });

  navigation.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;

      event.preventDefault();
      setMenuOpen(false);
      target.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
      window.history.replaceState(null, "", link.getAttribute("href"));
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false);
  });

  window.matchMedia("(min-width: 681px)").addEventListener("change", () => setMenuOpen(false));
}

function initializeOrderDialog() {
  const dialog = document.querySelector(".order-dialog");
  const form = document.querySelector(".order-form");
  const productField = document.querySelector(".order-product");
  const selectedProduct = document.querySelector(".selected-product");
  const nameField = document.querySelector("#order-name");
  const closeButton = document.querySelector(".dialog-close");

  if (!dialog || !form || !productField || !selectedProduct || !nameField || !closeButton) return;

  let lastTrigger = null;

  document.querySelectorAll(".product-inquiry").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      lastTrigger = trigger;
      productField.value = trigger.dataset.product || "Producto artesanal";
      selectedProduct.textContent = productField.value;
      dialog.showModal();
      nameField.focus();
    });
  });

  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => lastTrigger?.focus());

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const message = `¡Hola! Soy ${formData.get("name")}. Me interesa consultar por ${formData.get("product")} en medida ${formData.get("measure")}, cantidad ${formData.get("quantity")}. ¿Tenés stock o tiempo estimado de elaboración?`;
    const phone = WHATSAPP_NUMBER.replace(/\D/g, "");
    const destination = phone ? `https://wa.me/${phone}` : "https://wa.me/";
    const whatsappUrl = `${destination}?text=${encodeURIComponent(message)}`;
    const whatsappWindow = window.open(whatsappUrl, "_blank");

    if (whatsappWindow) {
      whatsappWindow.opener = null;
      form.reset();
      dialog.close();
    } else {
      window.location.assign(whatsappUrl);
    }
  });
}

function initializeLazyImages() {
  const images = document.querySelectorAll("img[data-src]");

  const loadImage = (image) => {
    image.src = image.dataset.src;
    image.removeAttribute("data-src");
    image.decoding = "async";
  };

  // Defer image requests until catalog cards approach the viewport.
  if (!("IntersectionObserver" in window)) {
    images.forEach(loadImage);
    return;
  }

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      loadImage(entry.target);
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "250px 0px" });

  images.forEach((image) => imageObserver.observe(image));
}

initializeMobileMenu();
initializeOrderDialog();
initializeLazyImages();