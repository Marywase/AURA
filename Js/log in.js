const API_KEY = "ecfac46c3e58e15948364327647d10b8";
const BASE_URL = "https://api.themoviedb.org/3/";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const background = document.getElementById("background");

async function fetchPosters() {
  try {
    const res = await fetch(
      `${BASE_URL}movie/popular?api_key=${API_KEY}&language=en-US&page=1`
    );
    const data = await res.json();
    const movies = data.results.slice(0, 20);

    movies.forEach((movie) => {
      if (movie.poster_path) {
        const img = document.createElement("img");
        img.src = `${IMAGE_BASE_URL}${movie.poster_path}`;
        background.appendChild(img);
      }
    });
  } catch (err) {
    console.error("Failed to load posters", err);
  }
}

fetchPosters();

// Toggle Login/Sign Up Text
document.getElementById("toggleForm").addEventListener("click", (e) => {
  e.preventDefault();
  const heading = document.querySelector("h1");
  const toggleLink = document.getElementById("toggleForm");
  const btn = document.querySelector(".main-btn");

  if (heading.textContent === "Welcome back") {
    heading.textContent = "Create your account";
    toggleLink.textContent = "Log in";
    btn.textContent = "Sign up";
  } else {
    heading.textContent = "Welcome back";
    toggleLink.textContent = "Sign up";
    btn.textContent = "Continue";
  }
});
