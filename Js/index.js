const API_KEY = "ecfac46c3e58e15948364327647d10b8";
const BASE_URL = "https://api.themoviedb.org/3/";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/";
const POSTER_SIZE = "w500/";
const BACKDROP_SIZE = "original/";

// --- DOM Elements ---
const sliderContainer = document.querySelector(".slider-container");
const sliderContent = document.querySelector(".slider-content");
const sliderMovieTitle = document.getElementById("sliderMovieTitle");
const sliderMovieOverview = document.getElementById("sliderMovieOverview");
const sliderMoviePoster = document.getElementById("sliderMoviePoster");
const sliderLearnMoreBtn = document.getElementById("sliderLearnMoreBtn");
const leftArrow = document.getElementById("leftArrow");
const rightArrow = document.getElementById("rightArrow");

// Desktop Search Bar elements
const desktopSearchBar = document.getElementById("desktopSearchBar");
const desktopSearchInput = document.getElementById("desktopSearchInput");
const desktopSearchButton = document.getElementById("desktopSearchButton");

// Mobile Search Overlay elements
const mobileSearchOverlay = document.getElementById("mobileSearchOverlay");
const mobileSearchInput = document.getElementById("mobileSearchInput");
const mobileSearchOverlayButton = document.getElementById(
  "mobileSearchOverlayButton"
);
const closeMobileSearch = document.getElementById("closeMobileSearch");

const searchResultsSection = document.getElementById("searchResultsSection");
const searchResultsGrid = document.getElementById("searchResultsGrid");
const noResultsMessage = document.getElementById("noResultsMessage");

const themeToggle = document.getElementById("themeToggle");
const tvSeriesGrid = document.getElementById("tvSeriesGrid");
const actionMoviesGrid = document.getElementById("actionMoviesGrid");
const romanceMoviesGrid = document.getElementById("romanceMoviesGrid");
const thrillerMoviesGrid = document.getElementById("thrillerMoviesGrid");
const latestMoviesGrid = document.getElementById("latestMoviesGrid");

// Footer toggle elements
const footerToggleArrow = document.getElementById("footerToggleArrow");
const collapsibleFooterContent = document.querySelector(
  ".collapsible-footer-content"
);

// Mobile Header and Navigation Elements
const mobileMenuToggle = document.getElementById("mobileMenuToggle");
const mobileNavOverlay = document.getElementById("mobileNavOverlay");
const mobileMenuClose = document.getElementById("mobileMenuClose");
const mobileSearchIcon = document.getElementById("mobileSearchIcon");
const mobileNavbarLinks = document.querySelectorAll(".mobile-navbar a");
const mobileThemeToggle = document.getElementById("mobileThemeToggle");

// MODAL Elements
const trailerModal = document.getElementById("trailer-modal");
const closeButton = document.querySelector(
  "#trailer-modal .modal-content .close-button"
);
const trailerPlayer = document.getElementById("trailer-player");

let trendingMovies = [];
let currentSlideIndex = 0;

// Function to get just the YouTube video ID
async function getMovieTrailerId(movieId) {
  const res = await fetch(
    `${BASE_URL}movie/${movieId}/videos?api_key=${API_KEY}`
  );
  const data = await res.json();
  const trailer = data.results.find(
    (vid) => vid.type === "Trailer" && vid.site === "YouTube"
  );
  return trailer ? trailer.key : null;
}

// Function to Fetch Data
async function fetchData(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append("api_key", API_KEY);
  for (const key in params) {
    url.searchParams.append(key, params[key]);
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

// --- Slider Functionality ---
async function fetchTrendingMovies() {
  const data = await fetchData("trending/movie/week");
  if (data && data.results) {
    trendingMovies = data.results.filter(
      (movie) => movie.backdrop_path && movie.poster_path && movie.overview
    );
    if (trendingMovies.length > 0) {
      updateSlider(currentSlideIndex);
      sliderContent.classList.add("loaded");
    } else {
      sliderContent.innerHTML =
        '<p style="text-align: center; width: 100%;">No trending movies available.</p>';
    }
  } else {
    sliderContent.innerHTML =
      '<p style="text-align: center; width: 100%;">Failed to load trending movies.</p>';
  }
}

function updateSlider(index) {
  const movie = trendingMovies[index];
  if (movie) {
    sliderMovieTitle.textContent = movie.title;
    sliderMovieOverview.textContent =
      movie.overview || "No overview available.";
    sliderMoviePoster.src = movie.backdrop_path
      ? `${IMAGE_BASE_URL}${BACKDROP_SIZE}${movie.backdrop_path}`
      : "";
    sliderMoviePoster.alt = movie.title;
    if (sliderLearnMoreBtn) {
      sliderLearnMoreBtn.dataset.movieId = movie.id;
    }
  }
}

function showNextSlide() {
  currentSlideIndex = (currentSlideIndex + 1) % trendingMovies.length;
  updateSlider(currentSlideIndex);
}

function showPrevSlide() {
  currentSlideIndex =
    (currentSlideIndex - 1 + trendingMovies.length) % trendingMovies.length;
  updateSlider(currentSlideIndex);
}

// --- Movie Card Generation ---
function createMovieCard(movie) {
  const movieCard = document.createElement("div");
  movieCard.classList.add("movie-card");

  const posterPath = movie.poster_path
    ? `${IMAGE_BASE_URL}${POSTER_SIZE}${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Poster";

  const title = movie.media_type === "tv" ? movie.name : movie.title;
  const fallbackTitle = "Unknown Title";
  const releaseDate =
    movie.media_type === "tv" ? movie.first_air_date : movie.release_date;
  const releaseYear = releaseDate ? `(${releaseDate.substring(0, 4)})` : "";
  const typeText =
    movie.media_type === "tv" ? "TV Series" : "Download Hollywood Movie";

  movieCard.innerHTML = `
                <img src="${posterPath}" alt="${title || fallbackTitle}">
                <div class="movie-card-info">
                    <h3>${title || fallbackTitle}</h3>
                    <p class="movie-type">${releaseYear} | ${typeText}</p>
                </div>
            `;

  movieCard.addEventListener("click", () => {
    const detailType = movie.media_type === "tv" ? "tv" : "movie";
    window.location.href = `movie-detail.html?id=${movie.id}&type=${detailType}`;
  });

  return movieCard;
}

function displayMoviesInGrid(movies, gridElement) {
  gridElement.innerHTML = "";
  if (movies && movies.length > 0) {
    movies.forEach((movie) => {
      if (movie.poster_path) {
        gridElement.appendChild(createMovieCard(movie));
      }
    });
  } else {
    gridElement.innerHTML = "<p>No movies to display.</p>";
  }
}

// --- Fetch TV Series ---
async function fetchTvSeries() {
  const data = await fetchData("tv/popular", { page: 1 });
  if (data && data.results) {
    const seriesWithPosters = data.results
      .filter((series) => series.poster_path)
      .slice(0, 12);
    const formattedSeries = seriesWithPosters.map((s) => ({
      ...s,
      media_type: "tv",
    }));
    displayMoviesInGrid(formattedSeries, tvSeriesGrid);
  } else {
    tvSeriesGrid.innerHTML = "<p>Failed to load TV series.</p>";
  }
}

// --- Fetch Movies by Genre ---
async function fetchMoviesByGenre(genreId, gridElement, message = "movies") {
  const data = await fetchData("discover/movie", {
    page: 1,
    with_genres: genreId,
    sort_by: "popularity.desc",
  });
  if (data && data.results) {
    const moviesWithPosters = data.results
      .filter((movie) => movie.poster_path)
      .slice(0, 12);
    displayMoviesInGrid(moviesWithPosters, gridElement);
  } else {
    gridElement.innerHTML = `<p>Failed to load ${message}.</p>`;
  }
}

// --- Fetch Latest Movies ---
async function fetchLatestMovies() {
  const data = await fetchData("movie/now_playing", {
    page: 1,
    language: "en-US",
    region: "US",
  });
  if (data && data.results) {
    const moviesWithPosters = data.results
      .filter((movie) => movie.poster_path)
      .slice(0, 12);
    displayMoviesInGrid(moviesWithPosters, latestMoviesGrid);
  } else {
    latestMoviesGrid.innerHTML = "<p>Failed to load latest movies.</p>";
  }
}

// --- Search Functionality ---
async function handleSearch(inputElement) {
  const query = inputElement.value.trim();
  if (query === "") {
    searchResultsSection.classList.add("hidden");
    noResultsMessage.classList.add("hidden");
    searchResultsGrid.innerHTML = "";
    return;
  }

  if (mobileSearchOverlay.classList.contains("active")) {
    mobileSearchOverlay.classList.remove("active");
    mobileSearchInput.value = "";
  }

  searchResultsSection.classList.remove("hidden");
  searchResultsGrid.innerHTML =
    "<p style='color: #bbb; text-align: center; padding: 20px;'>Searching...</p>";
  noResultsMessage.classList.add("hidden");

  const data = await fetchData("search/movie", { query: query, page: 1 });

  if (data && data.results) {
    const moviesWithPosters = data.results.filter((movie) => movie.poster_path);

    if (moviesWithPosters.length > 0) {
      noResultsMessage.classList.add("hidden");
      displayMoviesInGrid(moviesWithPosters, searchResultsGrid);
    } else {
      searchResultsGrid.innerHTML = "";
      noResultsMessage.textContent =
        "No movies found with posters for your search.";
      noResultsMessage.classList.remove("hidden");
    }
  } else {
    searchResultsGrid.innerHTML = "";
    noResultsMessage.textContent =
      "Error fetching search results. Please try again later.";
    noResultsMessage.classList.remove("hidden");
  }

  searchResultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

// --- Watchlist Button Logic  ---
document.querySelectorAll(".watchlist-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const movieId = btn.getAttribute("data-id");
    const icon = btn.querySelector("i");
    const text = btn.querySelector("span");

    icon.className = "fas fa-check";
    text.textContent = "Added";
    btn.classList.add("added");

    toggleWatchlist(movieId, true);

    // Revert visual after 1.2s
    setTimeout(() => {
      icon.className = "fas fa-plus";
      text.textContent = "My List";
      btn.classList.remove("added");
    }, 1200);
  });
});

function toggleWatchlist(movieId, isAdded) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

  if (isAdded) {
    if (!watchlist.includes(movieId)) {
      watchlist.push(movieId);
    }
  }

  localStorage.setItem("watchlist", JSON.stringify(watchlist));
}

// --- Main Initialization Block  ---
document.addEventListener("DOMContentLoaded", () => {
  fetchTrendingMovies();
  fetchTvSeries();
  fetchMoviesByGenre(28, actionMoviesGrid, "action movies");
  fetchMoviesByGenre(10749, romanceMoviesGrid, "romance movies");
  fetchMoviesByGenre(53, thrillerMoviesGrid, "thriller movies");
  fetchLatestMovies();

  if (sliderLearnMoreBtn) {
    sliderLearnMoreBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      const movieId = event.currentTarget.dataset.movieId;

      if (movieId) {
        const videoId = await getMovieTrailerId(movieId);

        if (videoId) {
          if (trailerPlayer) {
            trailerPlayer.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
          }
          if (trailerModal) {
            trailerModal.style.display = "flex";
          }
        } else {
          alert("No YouTube trailer available for this content.");
        }
      } else {
        console.warn("Movie ID not found on slider trailer button.");
        alert("Could not find movie ID for trailer.");
      }
    });
  }

  if (closeButton) {
    closeButton.addEventListener("click", () => {
      if (trailerModal) {
        trailerModal.style.display = "none";
      }
      if (trailerPlayer) {
        trailerPlayer.innerHTML = "";
      }
    });
  }

  if (trailerModal) {
    window.addEventListener("click", (event) => {
      if (event.target === trailerModal) {
        trailerModal.style.display = "none";
        if (trailerPlayer) {
          trailerPlayer.innerHTML = "";
        }
      }
    });
  }

  // Desktop Search Input
  if (desktopSearchInput) {
    desktopSearchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleSearch(desktopSearchInput);
      }
    });
  }

  if (desktopSearchButton) {
    desktopSearchButton.addEventListener("click", () => {
      handleSearch(desktopSearchInput);
    });
  }

  // Mobile Search Icons
  if (mobileSearchIcon) {
    mobileSearchIcon.addEventListener("click", () => {
      mobileSearchOverlay.classList.add("active");
      mobileSearchInput.focus();
    });
  }

  if (closeMobileSearch) {
    closeMobileSearch.addEventListener("click", () => {
      mobileSearchOverlay.classList.remove("active");
      mobileSearchInput.value = "";
    });
  }

  if (mobileSearchOverlayButton) {
    mobileSearchOverlayButton.addEventListener("click", () => {
      handleSearch(mobileSearchInput);
    });
  }

  if (mobileSearchInput) {
    mobileSearchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleSearch(mobileSearchInput);
      }
    });
  }

  // Mobile Menu Toggle
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", () => {
      mobileNavOverlay.classList.toggle("active");
    });
  }

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener("click", () => {
      mobileNavOverlay.classList.remove("active");
    });
  }

  mobileNavbarLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileNavOverlay.classList.remove("active");
    });
  });

  // Theme Toggle Desktop
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("light-theme");
    });
  }

  // Theme Toggle Mobile
  if (mobileThemeToggle) {
    mobileThemeToggle.addEventListener("click", () => {
      document.body.classList.toggle("light-theme");
    });
  }

  // Footer Toggle
  if (footerToggleArrow && collapsibleFooterContent) {
    footerToggleArrow.addEventListener("click", () => {
      collapsibleFooterContent.classList.toggle("active");
      footerToggleArrow.classList.toggle("rotate");
    });
  }

  // Slider Navigation
  if (leftArrow) {
    leftArrow.addEventListener("click", showPrevSlide);
  }
  if (rightArrow) {
    rightArrow.addEventListener("click", showNextSlide);
  }
});

// --- Movie Card Generation ---
function createMovieCard(movie) {
  const movieCard = document.createElement("div");
  movieCard.classList.add("movie-card");

  const posterPath = movie.poster_path
    ? `${IMAGE_BASE_URL}${POSTER_SIZE}${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Poster";

  const title = movie.media_type === "tv" ? movie.name : movie.title;
  const fallbackTitle = "Unknown Title";
  const releaseDate =
    movie.media_type === "tv" ? movie.first_air_date : movie.release_date;
  const releaseYear = releaseDate ? `(${releaseDate.substring(0, 4)})` : "";
  const typeText =
    movie.media_type === "tv" ? "TV Series" : "Download Hollywood Movie";

  movieCard.innerHTML = `
                <img src="${posterPath}" alt="${title || fallbackTitle}">
                <div class="movie-card-info">
                    <h3>${title || fallbackTitle}</h3>
                    <p class="movie-type">${releaseYear} | ${typeText}</p>
                </div>
            `;

  movieCard.addEventListener("click", () => {
    const detailType = movie.media_type === "tv" ? "tv" : "movie";

    window.location.href = `movie-detail.html?id=${movie.id}&type=${detailType}`;
  });

  return movieCard;
}

function displayMoviesInGrid(movies, gridElement) {
  gridElement.innerHTML = "";
  if (movies && movies.length > 0) {
    movies.forEach((movie) => {
      if (movie.poster_path) {
        gridElement.appendChild(createMovieCard(movie));
      }
    });
  } else {
    gridElement.innerHTML = "<p>No movies to display.</p>";
  }
}

// --- Fetch TV Series ---
async function fetchTvSeries() {
  const data = await fetchData("tv/popular", { page: 1 });
  if (data && data.results) {
    const seriesWithPosters = data.results
      .filter((series) => series.poster_path)
      .slice(0, 12);
    const formattedSeries = seriesWithPosters.map((s) => ({
      ...s,
      media_type: "tv",
    }));
    displayMoviesInGrid(formattedSeries, tvSeriesGrid);
  } else {
    tvSeriesGrid.innerHTML = "<p>Failed to load TV series.</p>";
  }
}

// --- Fetch Movies by Genre ---
async function fetchMoviesByGenre(genreId, gridElement, message = "movies") {
  const data = await fetchData("discover/movie", {
    page: 1,
    with_genres: genreId,
    sort_by: "popularity.desc",
  });
  if (data && data.results) {
    const moviesWithPosters = data.results
      .filter((movie) => movie.poster_path)
      .slice(0, 12);
    displayMoviesInGrid(moviesWithPosters, gridElement);
  } else {
    gridElement.innerHTML = `<p>Failed to load ${message}.</p>`;
  }
}

// --- Fetch Latest Movies ---
async function fetchLatestMovies() {
  const data = await fetchData("movie/now_playing", {
    page: 1,
    language: "en-US",
    region: "US",
  });
  if (data && data.results) {
    const moviesWithPosters = data.results
      .filter((movie) => movie.poster_path)
      .slice(0, 12);
    displayMoviesInGrid(moviesWithPosters, latestMoviesGrid);
  } else {
    latestMoviesGrid.innerHTML = "<p>Failed to load latest movies.</p>";
  }
}

// --- Search Functionality ---
async function handleSearch(inputElement) {
  const query = inputElement.value.trim();
  if (query === "") {
    searchResultsSection.classList.add("hidden");
    noResultsMessage.classList.add("hidden");
    searchResultsGrid.innerHTML = "";
    return;
  }

  if (mobileSearchOverlay.classList.contains("active")) {
    mobileSearchOverlay.classList.remove("active");
    mobileSearchInput.value = ""; //
  }

  searchResultsSection.classList.remove("hidden");
  searchResultsGrid.innerHTML =
    "<p style='color: #bbb; text-align: center; padding: 20px;'>Searching...</p>";
  noResultsMessage.classList.add("hidden");

  const data = await fetchData("search/movie", { query: query, page: 1 });

  if (data && data.results) {
    const moviesWithPosters = data.results.filter((movie) => movie.poster_path);

    if (moviesWithPosters.length > 0) {
      noResultsMessage.classList.add("hidden");
      displayMoviesInGrid(moviesWithPosters, searchResultsGrid);
    } else {
      searchResultsGrid.innerHTML = "";
      noResultsMessage.textContent =
        "No movies found with posters for your search.";
      noResultsMessage.classList.remove("hidden");
    }
  } else {
    searchResultsGrid.innerHTML = "";
    noResultsMessage.textContent =
      "Error fetching search results. Please try again later.";
    noResultsMessage.classList.remove("hidden");
  }

  searchResultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

// --- Theme Toggling Functionality ---
function applyTheme(theme) {
  if (theme === "light") {
    document.body.classList.add("light-mode");
    // Desktop theme toggle icon
    if (themeToggle) {
      themeToggle.querySelector("i").classList.remove("fa-sun");
      themeToggle.querySelector("i").classList.add("fa-moon");
    }
    // Mobile theme toggle icon
    if (mobileThemeToggle) {
      mobileThemeToggle.querySelector("i").classList.remove("fa-sun");
      mobileThemeToggle.querySelector("i").classList.add("fa-moon");
    }
  } else {
    document.body.classList.remove("light-mode");
    // Desktop theme toggle icon
    if (themeToggle) {
      themeToggle.querySelector("i").classList.remove("fa-moon");
      themeToggle.querySelector("i").classList.add("fa-sun");
    }
    // Mobile theme toggle icon
    if (mobileThemeToggle) {
      mobileThemeToggle.querySelector("i").classList.remove("fa-moon");
      mobileThemeToggle.querySelector("i").classList.add("fa-sun");
    }
  }
}

function toggleTheme() {
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme === "light") {
    applyTheme("dark");
    localStorage.setItem("theme", "dark");
  } else {
    applyTheme("light");
    localStorage.setItem("theme", "light");
  }
}

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", () => {
  fetchTrendingMovies();
  fetchLatestMovies();

  fetchTvSeries();
  fetchMoviesByGenre(28, actionMoviesGrid, "action movies");
  fetchMoviesByGenre(10749, romanceMoviesGrid, "romance movies");
  fetchMoviesByGenre(53, thrillerMoviesGrid, "thriller movies");

  if (window.innerWidth > 992) {
    if (rightArrow && leftArrow) {
      rightArrow.addEventListener("click", showNextSlide);
      leftArrow.addEventListener("click", showPrevSlide);
    }
  }

  setInterval(showNextSlide, 8000);

  // Desktop Search event listeners
  if (desktopSearchButton && desktopSearchInput) {
    desktopSearchButton.addEventListener("click", () =>
      handleSearch(desktopSearchInput)
    );
    desktopSearchInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        handleSearch(desktopSearchInput);
      }
    });
  }

  const savedTheme = localStorage.getItem("theme") || "dark";
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }
  //  Mobile theme toggle event listener
  if (mobileThemeToggle) {
    mobileThemeToggle.addEventListener("click", toggleTheme);
  }

  // --- Footer Toggle Logic ---
  if (footerToggleArrow && collapsibleFooterContent) {
    footerToggleArrow.addEventListener("click", () => {
      collapsibleFooterContent.classList.toggle("expanded");
      footerToggleArrow.querySelector("i").classList.toggle("rotated");
    });
  } else {
    console.error(
      "Footer toggle elements not found. Make sure IDs are correct in HTML."
    );
  }

  const hamburgerCheckbox = document.getElementById("hamburgerCheckbox");
  const mobileNavOverlay = document.getElementById("mobileNavOverlay");

  if (hamburgerCheckbox && mobileNavOverlay) {
    hamburgerCheckbox.addEventListener("change", () => {
      if (hamburgerCheckbox.checked) {
        mobileNavOverlay.classList.add("open");
        document.body.style.overflow = "hidden";
      } else {
        mobileNavOverlay.classList.remove("open");
        document.body.style.overflow = "";
      }
    });

    document.querySelectorAll(".mobile-navbar a").forEach((link) => {
      link.addEventListener("click", () => {
        hamburgerCheckbox.checked = false;
        mobileNavOverlay.classList.remove("open");
        document.body.style.overflow = "";
      });
    });

    const mobileMenuClose = document.getElementById("mobileMenuClose");
    if (mobileMenuClose) {
      mobileMenuClose.addEventListener("click", () => {
        hamburgerCheckbox.checked = false;
        mobileNavOverlay.classList.remove("open");
        document.body.style.overflow = "";
      });
    }
  }

  // --- Mobile Search Icon functionality  ---
  if (
    mobileSearchIcon &&
    mobileSearchOverlay &&
    mobileSearchInput &&
    mobileSearchOverlayButton &&
    closeMobileSearch
  ) {
    mobileSearchIcon.addEventListener("click", () => {
      mobileSearchOverlay.classList.add("active");
      mobileSearchInput.focus();
      if (mobileNavOverlay.classList.contains("open")) {
        mobileNavOverlay.classList.remove("open");
        document.body.style.overflow = "";
      }
    });

    mobileSearchOverlayButton.addEventListener("click", () =>
      handleSearch(mobileSearchInput)
    );
    mobileSearchInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        handleSearch(mobileSearchInput);
      }
    });

    closeMobileSearch.addEventListener("click", () => {
      mobileSearchOverlay.classList.remove("active");
      mobileSearchInput.value = "";
    });
  }
});

// --- Watchlist Button Logic---
document.querySelectorAll(".watchlist-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const movieId = btn.getAttribute("data-id");
    const icon = btn.querySelector("i");
    const text = btn.querySelector("span");

    icon.className = "fas fa-check";
    text.textContent = "Added";
    btn.classList.add("added");

    toggleWatchlist(movieId, true);

    // Revert visual after 1.2s
    setTimeout(() => {
      icon.className = "fas fa-plus";
      text.textContent = "My List";
      btn.classList.remove("added");
    }, 1200);
  });
});
function toggleWatchlist(movieId, isAdded) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

  if (isAdded) {
    if (!watchlist.includes(movieId)) {
      watchlist.push(movieId);
    }
  }

  localStorage.setItem("watchlist", JSON.stringify(watchlist));
}

fetchTrendingMovies();

if (sliderLearnMoreBtn) {
  sliderLearnMoreBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    const movieId = event.currentTarget.dataset.movieId;

    if (movieId) {
      const videoId = await getMovieTrailerId(movieId);

      if (videoId) {
        if (trailerPlayer) {
          trailerPlayer.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        }
        if (trailerModal) {
          trailerModal.style.display = "flex";
        }
      } else {
        alert("No YouTube trailer available for this content.");
      }
    } else {
      console.warn("Movie ID not found on slider trailer button.");
      alert("Could not find movie ID for trailer.");
    }
  });
}

// Modal close button listener
if (closeButton) {
  closeButton.addEventListener("click", () => {
    if (trailerModal) {
      trailerModal.style.display = "none";
    }
    if (trailerPlayer) {
      trailerPlayer.innerHTML = "";
    }
  });
}

if (trailerModal) {
  window.addEventListener("click", (event) => {
    if (event.target === trailerModal) {
      trailerModal.style.display = "none";
      if (trailerPlayer) {
        trailerPlayer.innerHTML = "";
      }
    }
  });
}
