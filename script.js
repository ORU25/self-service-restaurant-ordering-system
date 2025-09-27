// script.js
// Interaksi halaman menggunakan DOM Manipulation dan Event Listener
// Fitur:
// 1. Menangkap promo yang dipilih user dari kartu promo
// 2. Menampilkan pilihan dine-in / take-away di modal dan memberi feedback
// 3. Menampilkan ringkasan pesanan dinamis di bawah section promo
// 4. Menyimpan preferensi terakhir di localStorage (promo & tipe order)
// 5. Animasi sederhana dan aksesibilitas tambahan

(function () {
  const promoButtons = document.querySelectorAll(".promo-btn");
  const selectedPromoEl = document.getElementById("selectedPromo");
  const clearPromoBtn = document.getElementById("clearPromoBtn");
  const dineInBtn = document.getElementById("dineInBtn");
  const takeAwayBtn = document.getElementById("takeAwayBtn");
  const orderFeedback = document.getElementById("orderFeedback");
  const orderSummary = document.getElementById("orderSummary");
  const orderSummaryText = document.getElementById("orderSummaryText");
  const modalEl = document.getElementById("pesanModal");
  const toastContainer = document.getElementById("toastContainer");
  const backToTopBtn = document.getElementById("backToTop");
  const navbar = document.querySelector(".navbar");

  let chosenPromo = null;
  let orderType = null;

  // Restore previous session from localStorage
  const savedState = JSON.parse(
    localStorage.getItem("selfServiceState") || "{}"
  );
  if (savedState.promo || savedState.orderType) {
    chosenPromo = savedState.promo || null;
    orderType = savedState.orderType || null;
    if (chosenPromo && orderType) {
      renderOrderSummary();
    }
  }

  // Utility to save state
  function saveState() {
    localStorage.setItem(
      "selfServiceState",
      JSON.stringify({ promo: chosenPromo, orderType })
    );
  }

  // Render summary
  function renderOrderSummary() {
    if (!orderType) return;
    orderSummary.classList.remove("d-none");
    const time = new Date().toLocaleString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    orderSummaryText.textContent = `Tipe Pesanan: ${orderType} | Promo: ${
      chosenPromo || "Tidak Ada"
    } | Waktu: ${time}`;
  }

  // Toast helper
  function showToast(message, type = "info") {
    if (!toastContainer) return;
    const typeClassMap = {
      success: "bg-success text-white",
      info: "bg-info text-white",
      warning: "bg-warning",
      danger: "bg-danger text-white",
    };
    const wrapper = document.createElement("div");
    wrapper.className = "toast align-items-center show border-0 mb-2";
    wrapper.setAttribute("role", "alert");
    wrapper.setAttribute("aria-live", "assertive");
    wrapper.setAttribute("aria-atomic", "true");
    wrapper.innerHTML = `
      <div class="toast-body ${
        typeClassMap[type] || typeClassMap.info
      } rounded">${message}
        <button type="button" class="btn-close btn-close-white ms-2 float-end" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>`;
    toastContainer.appendChild(wrapper);
    const toast = new bootstrap.Toast(wrapper, { delay: 3500 });
    toast.show();
    wrapper.addEventListener("hidden.bs.toast", () => wrapper.remove());
  }

  // Clear feedback area
  function clearFeedback() {
    orderFeedback.innerHTML = "";
  }

  // Show feedback message
  function showFeedback(message, type = "info") {
    clearFeedback();
    const alert = document.createElement("div");
    alert.className = `alert alert-${type} py-2 px-3 fade show`;
    alert.setAttribute("role", "alert");
    alert.textContent = message;
    orderFeedback.appendChild(alert);
  }

  // Handle promo button click
  promoButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      chosenPromo = btn.getAttribute("data-promo");
      selectedPromoEl.textContent = `Promo dipilih: ${chosenPromo}`;
      selectedPromoEl.classList.add("animate__animated", "animate__fadeIn");
      clearPromoBtn.classList.remove("d-none");
      // remove animation classes after animation ends
      setTimeout(() => {
        selectedPromoEl.classList.remove(
          "animate__animated",
          "animate__fadeIn"
        );
      }, 800);
      saveState();
      showToast(`Promo dipilih: ${chosenPromo}`, "info");
    });
  });

  // Clear promo handler
  clearPromoBtn.addEventListener("click", () => {
    if (!chosenPromo) return;
    const removed = chosenPromo;
    chosenPromo = null;
    selectedPromoEl.textContent = "";
    clearPromoBtn.classList.add("d-none");
    showFeedback(`Promo \"${removed}\" dihapus.`, "warning");
    saveState();
    if (orderType) renderOrderSummary();
    showToast("Promo dihapus", "warning");
  });

  // Order type selection handlers
  function handleOrderType(type) {
    orderType = type;
    showFeedback(
      `Anda memilih: ${type}${
        chosenPromo ? ` dengan promo "${chosenPromo}"` : ""
      }.`,
      "success"
    );
    saveState();
    renderOrderSummary();
    // Auto close modal after short delay
    setTimeout(() => {
      const modalInstance =
        bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modalInstance.hide();
    }, 1100);
    showToast(
      `Pesanan: ${type}${chosenPromo ? ` + Promo: ${chosenPromo}` : ""}`,
      "success"
    );
  }

  dineInBtn.addEventListener("click", () => handleOrderType("Makan di Tempat"));
  takeAwayBtn.addEventListener("click", () => handleOrderType("Bawa Pulang"));

  // Accessibility: allow keyboard shortcuts (Alt+1 dine-in, Alt+2 take-away)
  document.addEventListener("keydown", (e) => {
    if (e.altKey && e.key === "1") {
      dineInBtn.focus();
      dineInBtn.click();
    } else if (e.altKey && e.key === "2") {
      takeAwayBtn.focus();
      takeAwayBtn.click();
    }
  });

  // Reset state when modal is opened again (optional) - keep selection? We'll just clear feedback
  modalEl.addEventListener("show.bs.modal", () => {
    clearFeedback();
    if (chosenPromo) {
      selectedPromoEl.textContent = `Promo dipilih: ${chosenPromo}`;
      clearPromoBtn.classList.remove("d-none");
    } else {
      selectedPromoEl.textContent = "";
      clearPromoBtn.classList.add("d-none");
    }
  });

  // Add subtle hover effect via JS (example DOM manipulation)
  [dineInBtn, takeAwayBtn].forEach((btn) => {
    btn.addEventListener("mouseenter", () => btn.classList.add("shadow"));
    btn.addEventListener("mouseleave", () => btn.classList.remove("shadow"));
  });

  // Scroll interactions (navbar shrink + back to top visibility)
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (navbar) {
      if (y > 40) navbar.classList.add("navbar-scrolled");
      else navbar.classList.remove("navbar-scrolled");
    }
    if (backToTopBtn) {
      if (y > 450) backToTopBtn.classList.add("show");
      else backToTopBtn.classList.remove("show");
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Intersection observer for cards reveal
  const cards = document.querySelectorAll(".card");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((ent) => {
          if (ent.isIntersecting) {
            ent.target.classList.add("card-reveal");
            io.unobserve(ent.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    cards.forEach((c) => io.observe(c));
  } else {
    // Fallback
    cards.forEach((c) => c.classList.add("card-reveal"));
  }
})();
