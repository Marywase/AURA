document.addEventListener("DOMContentLoaded", () => {
  const API_KEY = "ecfac46c3e58e15948364327647d10b8";
  const BASE_URL = "https://api.themoviedb.org/3";
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/";
  const PLACEHOLDER_IMG =
    "https://placehold.co/200x300/000000/FFFFFF?text=No+Image";

  // --- Mobile Menu Element References ---
  const hamburgerCheckbox = document.getElementById("hamburgerCheckbox");
  const mobileNavOverlay = document.querySelector(".mobile-nav-overlay");
  const mobileMenuCloseBtn = document.querySelector(".mobile-menu-close-btn");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav a");
  const menuHeaderButtons = document.querySelectorAll(".menu-header .btn");
  const menuFooterLinks = document.querySelectorAll(".mobile-menu-footer a");

  // --- Movie Detail Page Element References ---
  const moviePoster = document.getElementById("movie-poster");
  const movieStudio = document.getElementById("movie-studio");
  const movieTitle = document.getElementById("movie-title");
  const movieQuality = document.getElementById("movie-quality");
  const movieGenres = document.querySelector("#movie-genres span");
  const movieReleaseDateText = document.querySelector(
    "#movie-release-date .date-text"
  );
  const movieRuntimeText = document.querySelector(
    "#movie-runtime .runtime-text"
  );
  const movieOverview = document.getElementById("movie-overview");
  const watchTrailerBtn = document.getElementById("watch-trailer-btn");
  const watchNowBtn = document.getElementById("watch-now-btn");

  // Trailer Modal Elements
  const trailerModal = document.getElementById("trailer-modal");
  const closeTrailerButton = trailerModal
    ? trailerModal.querySelector(".close-button")
    : null;
  const trailerPlayer = document.getElementById("trailer-player");

  // State Elements
  const loadingState = document.getElementById("loading-state");
  const errorState = document.getElementById("error-state");
  const movieContent = document.getElementById("movie-content");

  const setVisibility = (element, isVisible) => {
    if (element) {
      if (isVisible) {
        element.style.display = element === movieContent ? "flex" : "block";
        element.classList.add("visible");
      } else {
        element.classList.remove("visible");
        element.style.display = "none";
      }
    } else {
      console.warn(`Element for setVisibility is null:`, element);
    }
  };

  // --- Mobile Menu Logic ---
  if (hamburgerCheckbox && mobileNavOverlay) {
    hamburgerCheckbox.addEventListener("change", function () {
      if (this.checked) {
        mobileNavOverlay.classList.add("open");
        document.body.classList.add("no-scroll");
      } else {
        mobileNavOverlay.classList.remove("open");
        document.body.classList.remove("no-scroll");
      }
    });
  }

  if (mobileMenuCloseBtn && mobileNavOverlay) {
    mobileMenuCloseBtn.addEventListener("click", () => {
      mobileNavOverlay.classList.remove("open");
      if (hamburgerCheckbox) {
        hamburgerCheckbox.checked = false;
      }
      document.body.classList.remove("no-scroll");
    });
  }

  const closeMobileMenu = () => {
    mobileNavOverlay.classList.remove("open");
    if (hamburgerCheckbox) {
      hamburgerCheckbox.checked = false;
    }
    document.body.classList.remove("no-scroll");
  };

  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });
  menuHeaderButtons.forEach((button) => {
    button.addEventListener("click", closeMobileMenu);
  });
  menuFooterLinks.forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  const getContentParamsFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      id: params.get("id"),
      type: params.get("type") || "movie",
    };
  };

  const fetchContentDetails = async (contentId, contentType) => {
    setVisibility(loadingState, true);
    setVisibility(errorState, false);
    setVisibility(movieContent, false);

    if (!contentId) {
      console.error("No content ID found in URL.");
      setVisibility(loadingState, false);
      setVisibility(errorState, true);
      errorState.querySelector(
        "p"
      ).textContent = `No ${contentType} selected. Please go back to the listing.`;
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/${contentType}/${contentId}?api_key=${API_KEY}&append_to_response=videos,credits`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`${contentType} with ID ${contentId} not found.`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      console.log(`Fetched ${contentType} Data:`, data);

      document.title = `${data.title || data.name || "Details"} - teeflix`;

      if (data.backdrop_path) {
        const backdropUrl = `${IMAGE_BASE_URL}original${data.backdrop_path}`;
        document.body.style.backgroundImage = `linear-gradient(to bottom, rgba(0, 0, 0, 0.7), var(--primary-bg-color) 80%), url('${backdropUrl}')`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundRepeat = "no-repeat";
        document.body.style.backgroundAttachment = "fixed";
      } else {
        document.body.style.backgroundImage =
          "linear-gradient(to bottom, rgba(0,0,0,0.7), var(--primary-bg-color) 80%)";
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundRepeat = "no-repeat";
        document.body.style.backgroundAttachment = "fixed";
      }

      // Populate elements
      if (moviePoster) {
        moviePoster.src = data.poster_path
          ? `${IMAGE_BASE_URL}w500${data.poster_path}`
          : PLACEHOLDER_IMG;
        moviePoster.onerror = function () {
          this.onerror = null;
          this.src = PLACEHOLDER_IMG;
        };
      }
      if (movieTitle) {
        movieTitle.textContent = data.title || data.name || "N/A";
      }
      if (movieStudio) {
        if (contentType === "tv") {
          const networkNames =
            data.networks && data.networks.length > 0
              ? data.networks.map((network) => network.name)
              : data.production_companies &&
                data.production_companies.length > 0
              ? data.production_companies.map((company) => company.name)
              : [];
          movieStudio.textContent =
            networkNames.length > 0
              ? networkNames.join(", ")
              : "Unknown Network/Studio";
        } else {
          movieStudio.textContent =
            data.production_companies && data.production_companies.length > 0
              ? data.production_companies[0].name
              : "Unknown Studio";
        }
      }
      if (movieQuality) {
        movieQuality.textContent = "HD";
      }
      if (movieGenres) {
        movieGenres.textContent =
          data.genres && data.genres.length > 0
            ? data.genres.map((genre) => genre.name).join(", ")
            : "N/A";
      }
      if (movieReleaseDateText) {
        movieReleaseDateText.textContent =
          contentType === "tv" && data.first_air_date
            ? `First Air Date: ${data.first_air_date}`
            : data.release_date
            ? `Release Date: ${data.release_date}`
            : "N/A";
      }
      if (movieRuntimeText) {
        if (contentType === "tv") {
          if (data.episode_run_time && data.episode_run_time.length > 0) {
            const avgRuntime = data.episode_run_time[0];
            const hours = Math.floor(avgRuntime / 60);
            const minutes = avgRuntime % 60;
            movieRuntimeText.textContent = `${hours}h ${minutes}m (per episode)`;
          } else {
            movieRuntimeText.textContent = "N/A";
          }
        } else {
          if (data.runtime) {
            const hours = Math.floor(data.runtime / 60);
            const minutes = data.runtime % 60;
            movieRuntimeText.textContent = `${hours}h ${minutes}m`;
          } else {
            movieRuntimeText.textContent = "N/A";
          }
        }
      }
      if (movieOverview) {
        movieOverview.textContent = data.overview || "No overview available.";
      }

      // Dynamic watch now link
      if (watchNowBtn) {
        watchNowBtn.href = `watch-content.html?id=${contentId}&type=${contentType}`;
      }

      if (watchTrailerBtn) {
        const trailers = data.videos.results.filter(
          (video) => video.type === "Trailer" && video.site === "YouTube"
        );
        if (trailers.length > 0) {
          watchTrailerBtn.dataset.videoId = trailers[0].key;
          watchTrailerBtn.style.display = "inline-flex";
        } else {
          watchTrailerBtn.dataset.videoId = "";
          watchTrailerBtn.style.display = "none";
        }
      }

      setVisibility(loadingState, false);
      setVisibility(movieContent, true);
    } catch (error) {
      console.error(`Error fetching ${contentType} details:`, error);
      setVisibility(loadingState, false);
      setVisibility(errorState, true);
      if (errorState && errorState.querySelector("p")) {
        errorState.querySelector(
          "p"
        ).textContent = `Failed to load ${contentType} details: ${error.message}. Please try again later.`;
      }
      setVisibility(movieContent, false);
    }
  };

  // Watch Trailer Button
  if (watchTrailerBtn) {
    watchTrailerBtn.addEventListener("click", (event) => {
      event.preventDefault();
      const videoId = watchTrailerBtn.dataset.videoId;
      if (videoId) {
        if (trailerPlayer) {
          trailerPlayer.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        } else {
          console.warn("trailerPlayer element not found for trailer playback.");
        }
        if (trailerModal) {
          trailerModal.style.display = "flex";
        } else {
          console.warn("trailerModal element not found for display.");
        }
      } else {
        alert("No YouTube trailer available for this content.");
      }
    });
  }

  // Close Trailer Modal Button
  if (closeTrailerButton) {
    closeTrailerButton.addEventListener("click", () => {
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

  if (watchNowBtn) {
    watchNowBtn.addEventListener("click", (e) => {
      e.preventDefault();
      alert("Watch Now functionality to be implemented!");
    });
  }

  const { id, type } = getContentParamsFromUrl();
  fetchContentDetails(id, type);
});
