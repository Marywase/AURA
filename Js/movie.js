const API_KEY = "ecfac46c3e58e15948364327647d10b8";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE_URL = "https://image.tmdb.org/t/p/";
const PLACEHOLDER_IMG =
  "https://placehold.co/200x300/000000/FFFFFF?text=No+Image";

// DOM Elements
const movieGrid = document.getElementById("movie-grid");
const movieCountSpan = document.querySelector(".movie-count");
const sortSelect = document.getElementById("sort-by");
const contentTypeSelect = document.getElementById("content-type");
const genreSelect = document.getElementById("genre");
const countrySelect = document.getElementById("country");
const releaseYearSelect = document.getElementById("release-year");
const ageRatingSelect = document.getElementById("age-rating");

const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const pageButtonsContainer = document.getElementById("page-buttons");
const paginationDropdown = document.getElementById("pagination-dropdown");
const loadingIndicator = document.getElementById("loading-indicator");
const noResultsMessage = document.getElementById("no-results");
const themeToggleBtn = document.getElementById("themeToggle");

let currentPage = 1;
let totalPages = 1;
let totalResults = 0;
let genres = [];

// Function to show/hide loading indicator
function showLoading(show) {
  loadingIndicator.style.display = show ? "block" : "none";
  movieGrid.style.display = show ? "none" : "grid";
  noResultsMessage.style.display = "none";
}

// Function to show/hide no results message
function showNoResults(show) {
  noResultsMessage.style.display = show ? "block" : "none";
  movieGrid.style.display = show ? "none" : "none";
}

// Function to set the theme
function setTheme(theme) {
  document.body.classList.remove("light-mode", "dark-mode");
  document.body.classList.add(theme);
  localStorage.setItem("theme", theme);

  if (theme === "dark-mode") {
    themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
  }
}

// Function to fetch genres and populate the genre dropdown
async function fetchGenres() {
  try {
    const response = await fetch(
      `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`
    );
    const data = await response.json();
    genres = data.genres;
    genres.forEach((genre) => {
      const option = document.createElement("option");
      option.value = genre.id;
      option.textContent = genre.name;
      genreSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching genres:", error);
  }
}

// Function to generate years for the release year dropdown
function populateReleaseYears() {
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= 1900; year--) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    releaseYearSelect.appendChild(option);
  }
}

function setBodyBackground(imageUrl) {
  const body = document.body;
  if (imageUrl) {
    body.style.backgroundImage = `url('${imageUrl}')`;
    body.style.backgroundSize = "cover";
    body.style.backgroundPosition = "center";
    body.style.backgroundRepeat = "no-repeat";
    body.style.backgroundAttachment = "fixed";
    body.classList.add("has-dynamic-bg");
  } else {
    body.style.backgroundImage = `none`;
    body.classList.remove("has-dynamic-bg");
  }
}

// Main function to fetch and display movies
async function fetchMovies() {
  showLoading(true);
  movieGrid.innerHTML = "";
  showNoResults(false);

  const sortBy = sortSelect.value;
  const genreId = genreSelect.value;
  const countryCode = countrySelect.value;
  const releaseYear = releaseYearSelect.value;
  const ageRating = ageRatingSelect.value;
  const contentType = contentTypeSelect.value || "movie";

  let url = `${BASE_URL}/discover/${contentType}?api_key=${API_KEY}&page=${currentPage}&sort_by=${sortBy}`;

  if (genreId) {
    url += `&with_genres=${genreId}`;
  }
  if (countryCode) {
    url += `&with_origin_country=${countryCode}`;
  }
  if (releaseYear) {
    url += `&primary_release_year=${releaseYear}`;
  }
  if (ageRating) {
    url += `&certification_country=US&certification=${ageRating}`;
  }

  try {
    console.log("Fetching URL:", url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    totalResults = data.total_results;
    totalPages = data.total_pages;

    totalPages = Math.min(totalPages, 500);
    if (currentPage > totalPages && totalPages > 0) {
      currentPage = totalPages;
      fetchMovies();
      return;
    }

    movieCountSpan.textContent = `Found ${totalResults} material`;

    if (data.results.length === 0) {
      showNoResults(true);
      updatePaginationControls();
      showLoading(false);
      setBodyBackground(null);
      return;
    }

    // ---  Dynamic Body Background from the first movie  ---
    const firstMovie = data.results[0];
    let backgroundImageUrl = null;
    if (firstMovie && firstMovie.backdrop_path) {
      backgroundImageUrl = `${IMG_BASE_URL}original${firstMovie.backdrop_path}`;
    } else if (firstMovie && firstMovie.poster_path) {
      backgroundImageUrl = `${IMG_BASE_URL}w780${firstMovie.poster_path}`;
    }
    setBodyBackground(backgroundImageUrl);

    data.results.forEach((movie) => {
      const movieItem = document.createElement("a");
      movieItem.classList.add("movie-item");

      const currentContentType = contentTypeSelect.value || "movie";
      movieItem.href = `movie-detail.html?id=${movie.id}&type=${currentContentType}`;

      const movieCardDiv = document.createElement("div");
      movieCardDiv.classList.add("movie-card");

      const posterPath = movie.poster_path
        ? `${IMG_BASE_URL}w500${movie.poster_path}`
        : PLACEHOLDER_IMG;
      const title = movie.title || movie.name || "Untitled";

      movieCardDiv.innerHTML = `
                <img src="${posterPath}" alt="${title} Poster" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}';">
                ${
                  movie.release_date &&
                  new Date(movie.release_date).getFullYear() ===
                    new Date().getFullYear()
                    ? '<span class="new-badge">NEW</span>'
                    : ""
                }
            `;
      movieItem.appendChild(movieCardDiv);

      const movieTitleElement = document.createElement("h3");
      movieTitleElement.textContent = title;
      movieItem.appendChild(movieTitleElement);

      movieGrid.appendChild(movieItem);
    });
    showLoading(false);
  } catch (error) {
    console.error("Error fetching movies:", error);
    movieCountSpan.textContent = `Error fetching movies`;
    showLoading(false);
    showNoResults(true);
    setBodyBackground(null);
  } finally {
    updatePaginationControls();
  }
}

// Function to update pagination buttons and info
function updatePaginationControls() {
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;

  pageButtonsContainer.innerHTML = "";
  paginationDropdown.innerHTML = "";

  const maxPageButtons = 7;
  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }

  if (startPage > 1) {
    const button = document.createElement("button");
    button.textContent = "1";
    button.onclick = () => {
      currentPage = 1;
      fetchMovies();
    };
    pageButtonsContainer.appendChild(button);
    if (startPage > 2) {
      const ellipsis = document.createElement("span");
      ellipsis.textContent = "...";
      ellipsis.classList.add("ellipsis");
      pageButtonsContainer.appendChild(ellipsis);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    if (i === currentPage) {
      button.classList.add("active");
    }
    button.onclick = () => {
      currentPage = i;
      fetchMovies();
    };
    pageButtonsContainer.appendChild(button);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const ellipsis = document.createElement("span");
      ellipsis.textContent = "...";
      ellipsis.classList.add("ellipsis");
      pageButtonsContainer.appendChild(ellipsis);
    }
    const button = document.createElement("button");
    button.textContent = totalPages;
    button.onclick = () => {
      currentPage = totalPages;
      fetchMovies();
    };
    pageButtonsContainer.appendChild(button);
  }

  for (let i = 1; i <= totalPages; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `${i}/${totalPages}`;
    if (i === currentPage) {
      option.selected = true;
    }
    paginationDropdown.appendChild(option);
  }

  if (totalPages <= 1) {
    paginationDropdown.style.display = "none";
  } else {
    paginationDropdown.style.display = "inline-block";
  }
}

// Event Listeners for Filters
sortSelect.addEventListener("change", () => {
  currentPage = 1;
  fetchMovies();
});
contentTypeSelect.addEventListener("change", () => {
  currentPage = 1;
  fetchMovies();
});
genreSelect.addEventListener("change", () => {
  currentPage = 1;
  fetchMovies();
});
countrySelect.addEventListener("change", () => {
  currentPage = 1;
  fetchMovies();
});
releaseYearSelect.addEventListener("change", () => {
  currentPage = 1;
  fetchMovies();
});
ageRatingSelect.addEventListener("change", () => {
  currentPage = 1;
  fetchMovies();
});

// Event Listener for Pagination dropdown
paginationDropdown.addEventListener("change", (event) => {
  currentPage = parseInt(event.target.value);
  fetchMovies();
});

// Event Listeners for Pagination
prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchMovies();
  }
});

nextPageBtn.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    fetchMovies();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const hamburgerCheckbox = document.getElementById("hamburgerCheckbox");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileNavLinks = mobileMenu.querySelectorAll(".mobile-nav a");

  hamburgerCheckbox.addEventListener("change", () => {
    if (hamburgerCheckbox.checked) {
      mobileMenu.classList.add("menu-open");
      document.body.style.overflow = "hidden";
    } else {
      mobileMenu.classList.remove("menu-open");
      document.body.style.overflow = "";
    }
  });

  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      hamburgerCheckbox.checked = false;
      mobileMenu.classList.remove("menu-open");
      document.body.style.overflow = "";
    });
  });
});

// Theme Toggle Logic
const savedTheme = localStorage.getItem("theme") || "light-mode";
setTheme(savedTheme);

themeToggleBtn.addEventListener("click", () => {
  if (document.body.classList.contains("light-mode")) {
    setTheme("dark-mode");
  } else {
    setTheme("light-mode");
  }
});

fetchGenres();
populateReleaseYears();
fetchMovies();
