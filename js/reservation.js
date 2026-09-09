/* =============================================================
   CAFÉ BLOOM — reservation.js
   Handles: minimum date, field validation, confirmation modal,
   and resetting the reservation form.
   ============================================================= */

(function () {
  "use strict";

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);

  const PHONE_RE = /^[0-9+\-\s]{7,15}$/;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setMinDate() {
    const dateInput = $("#date");
    if (!dateInput) return;
    const today = new Date();
    const iso = today.toISOString().split("T")[0];
    dateInput.setAttribute("min", iso);
  }

  function setFieldError(id, message) {
    const field = document.getElementById(id).closest(".form-field");
    const errorEl = $("#err-" + id);
    if (message) {
      field.classList.add("invalid");
      if (errorEl) errorEl.textContent = message;
    } else {
      field.classList.remove("invalid");
      if (errorEl) errorEl.textContent = "";
    }
    return !message;
  }

  function validateForm(data) {
    let valid = true;

    if (!data.fullName.trim()) { setFieldError("fullName", "Please enter your name."); valid = false; }
    else setFieldError("fullName", "");

    if (!EMAIL_RE.test(data.email.trim())) { setFieldError("email", "Please enter a valid email."); valid = false; }
    else setFieldError("email", "");

    if (!PHONE_RE.test(data.phone.trim())) { setFieldError("phone", "Please enter a valid phone number."); valid = false; }
    else setFieldError("phone", "");

    const guests = Number(data.guests);
    if (!guests || guests < 1) { setFieldError("guests", "At least 1 guest is required."); valid = false; }
    else setFieldError("guests", "");

    if (!data.date) { setFieldError("date", "Please choose a date."); valid = false; }
    else {
      const chosen = new Date(data.date + "T00:00:00");
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (chosen < today) { setFieldError("date", "Date cannot be in the past."); valid = false; }
      else setFieldError("date", "");
    }

    if (!data.time) { setFieldError("time", "Please choose a time."); valid = false; }
    else setFieldError("time", "");

    return valid;
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  }
  function formatTime(timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour = ((h + 11) % 12) + 1;
    return hour + ":" + String(m).padStart(2, "0") + " " + period;
  }

  function showConfirmation(data) {
    const backdrop = $("#confirmModalBackdrop");
    const details = $("#confirmDetails");
    if (details) {
      details.innerHTML = `
        <p><strong>Name:</strong> ${data.fullName}</p>
        <p><strong>Date:</strong> ${formatDate(data.date)}</p>
        <p><strong>Time:</strong> ${formatTime(data.time)}</p>
        <p><strong>Guests:</strong> ${data.guests}</p>
        <p><strong>Seating:</strong> ${data.seating}</p>
      `;
    }
    if (backdrop) backdrop.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeConfirmation() {
    const backdrop = $("#confirmModalBackdrop");
    if (backdrop) backdrop.hidden = true;
    document.body.style.overflow = "";
  }

  function initForm() {
    const form = $("#reservationForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = {
        fullName: $("#fullName").value,
        email: $("#email").value,
        phone: $("#phone").value,
        guests: $("#guests").value,
        date: $("#date").value,
        time: $("#time").value,
        seating: $("#seating").value,
        request: $("#request").value,
      };

      if (!validateForm(data)) {
        if (window.CafeBloom) window.CafeBloom.showToast("Please fix the highlighted fields.", "fa-circle-exclamation");
        return;
      }

      showConfirmation(data);
      form.reset();
      setMinDate();
    });

    $("#confirmClose") && $("#confirmClose").addEventListener("click", closeConfirmation);
    $("#confirmModalBackdrop") && $("#confirmModalBackdrop").addEventListener("click", (e) => {
      if (e.target.id === "confirmModalBackdrop") closeConfirmation();
    });
    document.addEventListener("keydown", (e) => {
      const backdrop = $("#confirmModalBackdrop");
      if (backdrop && !backdrop.hidden && e.key === "Escape") closeConfirmation();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setMinDate();
    initForm();
  });
})();
