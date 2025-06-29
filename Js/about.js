const API_KEY = "ecfac46c3e58e15948364327647d10b8";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w300";

document.addEventListener("DOMContentLoaded", () => {
  fetchPosters();
  runTypewriter();
  setupObserver();
  renderTestimonialWall();
});

//  Movie Poster Background
async function fetchPosters() {
  const endpoint = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;
  const container = document.getElementById("netflixBackground");
  if (!container) return;

  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    const screenWidth = window.innerWidth;
    const repeatCount = screenWidth < 480 ? 25 : screenWidth < 768 ? 20 : 15;
    const fragment = document.createDocumentFragment();

    for (let r = 0; r < repeatCount; r++) {
      data.results.forEach((movie) => {
        if (movie.poster_path) {
          const img = document.createElement("img");
          img.src = `${IMAGE_BASE_URL}${movie.poster_path}`;
          img.alt = movie.title || "Movie Poster";
          fragment.appendChild(img);
        }
      });
    }

    container.appendChild(fragment);
  } catch (error) {
    console.error("❌ Poster load failed:", error);
    container.innerHTML = `<p style="color: white;">Failed to load posters.</p>`;
  }
}

//  Typewriter Effect
function runTypewriter() {
  const text = "Welcome to Aura";
  const typeTarget = document.getElementById("typewriter");
  if (!typeTarget) return;

  let index = 0;
  typeTarget.textContent = "";

  function type() {
    if (index < text.length) {
      typeTarget.textContent += text.charAt(index);
      index++;
      setTimeout(type, 100);
    }
  }

  type();
}

//  Fade-in Observer
function setupObserver() {
  const targets = document.querySelectorAll(".behind-aura");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("visible", entry.isIntersecting);
      });
    },
    { threshold: 0.25 }
  );

  targets.forEach((target) => observer.observe(target));
}

// Testimonial Wall + Slide-in Effect
function renderTestimonialWall() {
  const testimonialsData = [
    {
      text: "Aura has completely transformed how I experience cinema online...",
      author: "Edwel M.",
      icon: "E",
      bgColor: "#ff6600",
    },
    {
      text: "This is my absolute favorite movie platform in 2024...",
      author: "Abigail F.",
      icon: "A",
      bgColor: "#fcc906",
    },
    {
      text: "As a film student, I genuinely love how Aura blends design and depth...",
      author: "Lee S.",
      icon: "L",
      bgColor: "#e63674",
    },
    {
      text: "Aura gave me a place to fall in love with cinema again...",
      author: "Amaka S.",
      icon: "A",
      bgColor: "#9ba8d2",
    },
    {
      text: "All-in-one platform! I can track, rate, and share my thoughts on films I love...",
      author: "Jacob S.",
      icon: "J",
      bgColor: "#c11d19",
    },
    {
      text: "Aura is my go-to for curated film content...",
      author: "Ali A.",
      icon: "A",
      bgColor: "#36baa7",
    },
    {
      text: "The search filters? Immaculate. The mood-based movie grid? Genius...",
      author: "Favour E.",
      icon: "F",
      bgColor: "#e4a2b2",
    },
    {
      text: "Aura helps me organize all my watchlists...",
      author: "Maria A.",
      icon: "M",
      bgColor: "#348799",
    },
    {
      text: "Aura is what happens when film curation meets excellent design...",
      author: "Muhammad N.",
      icon: "M",
      bgColor: "#67483e",
    },
    {
      text: "I always struggled to decide what to watch — until Aura...",
      author: "Ahmed K.",
      icon: "A",
      bgColor: "#8fa82d",
    },
    {
      text: "As a privacy-focused user, I appreciate Aura’s minimal sign-up...",
      author: "Jonas D.",
      icon: "J",
      bgColor: "#c084fc",
    },
    {
      text: "Aura isn’t just a movie site — it’s a feeling...",
      author: "Vince C.",
      icon: "V",
      bgColor: "#FF4C4C",
    },
  ];

  const grid = document.getElementById("testimonials-grid");
  if (!grid) return;

  testimonialsData.forEach((testimonial, index) => {
    const card = document.createElement("div");
    card.className = "testimonial-card";
    card.style.transitionDelay = `${index * 100}ms`;

    card.innerHTML = `
      <p class="testimonial-text">${testimonial.text}</p>
      <div class="testimonial-footer">
        <span class="author-name">${testimonial.author}</span>
        <div class="icon-circle" style="background-color: ${testimonial.bgColor}">${testimonial.icon}</div>
      </div>
    `;

    grid.appendChild(card);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".testimonial-card").forEach((card) => {
    observer.observe(card);
  });
}
