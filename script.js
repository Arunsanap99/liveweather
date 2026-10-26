/**
 * ============================================================================
 * LiveWeather — Advanced Meteorological Intelligence Engine
 * Features:
 *   1. Canvas Atmospheric Particle Physics (Rain, Snow, Sun Motes, Thunder)
 *   2. Interactive Leaflet Radar / Geographic Position Map
 *   3. Real-Time Air Quality Index (AQI) & Pollutant Breakdown
 *   4. Dynamic SVG Temperature Spline Curve
 *   5. Multi-City Favorites / Bookmarks Persistence
 *   6. Raycast-Style Command Palette (Ctrl + K)
 *   7. Dynamic Solar Arc Tracking & Real-Time Unit Switching
 * ============================================================================
 */

/* ----------------------------------------------------------------------------
 * 1. Configuration & Global State
 * ---------------------------------------------------------------------------- */
const CONFIG = {
  apiKey: (window.ENV_CONFIG && window.ENV_CONFIG.apiKey && window.ENV_CONFIG.apiKey !== "YOUR_OPENWEATHER_API_KEY") 
    ? window.ENV_CONFIG.apiKey 
    : "9f2903ea0c4e300f511f1206cd384e88",
  cartoApiKey: (window.ENV_CONFIG && window.ENV_CONFIG.cartoApiKey) || "cb1_4v95_2_e125014b43a826f01e565c7d",
  endpoints: {
    weather: "https://api.openweathermap.org/data/2.5/weather",
    forecast: "https://api.openweathermap.org/data/2.5/forecast",
    airPollution: "https://api.openweathermap.org/data/2.5/air_pollution"
  },
  defaultCity: "Nashik",
  storageKeys: {
    theme: "liveweather_theme",
    unit: "liveweather_unit",
    favorites: "liveweather_favorites",
    particles: "liveweather_particles"
  }
};

const appState = {
  currentUnit: "metric", // "metric" (°C) or "imperial" (°F)
  currentTheme: "dark",
  activeCity: "",
  activeCoordinates: { lat: 19.9833, lon: 73.8 },
  activeWeatherData: null,
  activeForecastData: null,
  activeAqiData: null,
  favorites: [],
  particlesEnabled: true,
  isLoading: false,
  activeMapLayer: "satellite",
  mapInstance: null,
  mapMarker: null,
  currentBaseTileLayer: null,
  currentOverlayTileLayer: null
};

/* ----------------------------------------------------------------------------
 * 2. DOM Elements Cache
 * ---------------------------------------------------------------------------- */
const DOM = {
  // Navigation & Search
  searchForm: document.getElementById("searchForm"),
  cityInput: document.getElementById("cityInput"),
  clearSearchBtn: document.getElementById("clearSearchBtn"),
  searchSubmitBtn: document.getElementById("searchSubmitBtn"),
  locationBtn: document.getElementById("locationBtn"),
  unitCelsius: document.getElementById("unitCelsius"),
  unitFahrenheit: document.getElementById("unitFahrenheit"),
  themeToggleBtn: document.getElementById("themeToggleBtn"),
  toggleParticlesBtn: document.getElementById("toggleParticlesBtn"),
  toggleFavoriteBtn: document.getElementById("toggleFavoriteBtn"),
  heroBookmarkBtn: document.getElementById("heroBookmarkBtn"),
  heroStarIcon: document.getElementById("heroStarIcon"),
  quickChipsContainer: document.getElementById("quickChipsContainer"),
  savedCitiesContainer: document.getElementById("savedCitiesContainer"),

  // Feedback & Banners
  alertBanner: document.getElementById("alertBanner"),
  alertMessage: document.getElementById("alertMessage"),
  alertCloseBtn: document.getElementById("alertCloseBtn"),
  loadingIndicator: document.getElementById("loadingIndicator"),
  loadingText: document.getElementById("loadingText"),
  weatherDashboard: document.getElementById("weatherDashboard"),
  footerStatusText: document.getElementById("footerStatusText"),

  // Hero Card
  cityName: document.getElementById("cityName"),
  countryCode: document.getElementById("countryCode"),
  currentDateTime: document.getElementById("currentDateTime"),
  weatherConditionBadge: document.getElementById("weatherConditionBadge"),
  weatherConditionText: document.getElementById("weatherConditionText"),
  currentTemp: document.getElementById("currentTemp"),
  tempUnitSymbol: document.getElementById("tempUnitSymbol"),
  feelsLikeTemp: document.getElementById("feelsLikeTemp"),
  maxTemp: document.getElementById("maxTemp"),
  minTemp: document.getElementById("minTemp"),
  weatherIconImg: document.getElementById("weatherIconImg"),
  sunriseTime: document.getElementById("sunriseTime"),
  sunsetTime: document.getElementById("sunsetTime"),
  sunProgressFill: document.getElementById("sunProgressFill"),
  sunProgressOrb: document.getElementById("sunProgressOrb"),
  sunDaylightStatus: document.getElementById("sunDaylightStatus"),

  // Hourly Forecast & Curve
  hourlyForecastContainer: document.getElementById("hourlyForecastContainer"),
  hourlyScrollLeft: document.getElementById("hourlyScrollLeft"),
  hourlyScrollRight: document.getElementById("hourlyScrollRight"),
  tempCurveLine: document.getElementById("tempCurveLine"),
  tempCurveArea: document.getElementById("tempCurveArea"),

  // 5-Day Forecast
  fiveDayForecastContainer: document.getElementById("fiveDayForecastContainer"),

  // Map
  interactiveMap: document.getElementById("interactiveMap"),
  mapLatLonText: document.getElementById("mapLatLonText"),
  recenterMapBtn: document.getElementById("recenterMapBtn"),
  mapLayerSelector: document.getElementById("mapLayerSelector"),

  // AQI
  aqiQualityBadge: document.getElementById("aqiQualityBadge"),
  aqiScoreNum: document.getElementById("aqiScoreNum"),
  aqiRatingText: document.getElementById("aqiRatingText"),
  aqiAdviceText: document.getElementById("aqiAdviceText"),
  pm25Val: document.getElementById("pm25Val"),
  pm10Val: document.getElementById("pm10Val"),
  o3Val: document.getElementById("o3Val"),
  no2Val: document.getElementById("no2Val"),

  // Highlights
  humidityVal: document.getElementById("humidityVal"),
  humidityProgress: document.getElementById("humidityProgress"),
  humidityDesc: document.getElementById("humidityDesc"),
  windSpeedVal: document.getElementById("windSpeedVal"),
  windSpeedUnit: document.getElementById("windSpeedUnit"),
  compassPointer: document.getElementById("compassPointer"),
  windDirText: document.getElementById("windDirText"),
  windGustDesc: document.getElementById("windGustDesc"),
  pressureVal: document.getElementById("pressureVal"),
  pressureStatus: document.getElementById("pressureStatus"),
  visibilityVal: document.getElementById("visibilityVal"),
  visibilityUnit: document.getElementById("visibilityUnit"),
  visibilityProgress: document.getElementById("visibilityProgress"),
  visibilityDesc: document.getElementById("visibilityDesc"),
  cloudsVal: document.getElementById("cloudsVal"),
  cloudsProgress: document.getElementById("cloudsProgress"),
  cloudsDesc: document.getElementById("cloudsDesc"),
  uvVal: document.getElementById("uvVal"),
  uvUnit: document.getElementById("uvUnit"),
  uvProgress: document.getElementById("uvProgress"),
  uvDesc: document.getElementById("uvDesc"),

  // Canvas
  weatherCanvas: document.getElementById("weatherCanvas"),

  // Command Palette
  commandPaletteModal: document.getElementById("commandPaletteModal"),
  paletteSearchInput: document.getElementById("paletteSearchInput"),
  paletteCloseBtn: document.getElementById("paletteCloseBtn"),
  paletteResults: document.getElementById("paletteResults")
};

/* ----------------------------------------------------------------------------
 * 3. Application Lifecycle Initialization
 * ---------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initLucideIcons();
  loadPreferences();
  initCanvasPhysics();
  initLeafletMap();
  registerEvents();

  // Load default city
  const initialCity = appState.activeCity || CONFIG.defaultCity;
  fetchCompleteWeatherData({ type: "city", value: initialCity });
});

function initLucideIcons() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

function loadPreferences() {
  // Theme
  const savedTheme = localStorage.getItem(CONFIG.storageKeys.theme) || "dark";
  setTheme(savedTheme, false);

  // Unit
  const savedUnit = localStorage.getItem(CONFIG.storageKeys.unit) || "metric";
  setTemperatureUnit(savedUnit, false);

  // Favorites
  try {
    const rawFavs = localStorage.getItem(CONFIG.storageKeys.favorites);
    appState.favorites = rawFavs ? JSON.parse(rawFavs) : ["Nashik", "Mumbai", "London"];
  } catch {
    appState.favorites = ["Nashik", "Mumbai", "London"];
  }
  renderSavedCitiesPills();

  // Particles Toggle
  const savedParticles = localStorage.getItem(CONFIG.storageKeys.particles);
  if (savedParticles !== null) {
    appState.particlesEnabled = savedParticles === "true";
  }
  updateParticlesToggleBtn();
}

/* ----------------------------------------------------------------------------
 * 4. Event Listeners Setup
 * ---------------------------------------------------------------------------- */
function registerEvents() {
  // Search Form
  if (DOM.searchForm) {
    DOM.searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleSearch();
    });
  }

  // City Input clear & keyboard
  if (DOM.cityInput) {
    DOM.cityInput.addEventListener("input", () => {
      if (DOM.clearSearchBtn) {
        DOM.clearSearchBtn.hidden = DOM.cityInput.value.trim().length === 0;
      }
    });

    DOM.cityInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        clearSearchInput();
      }
    });
  }

  if (DOM.clearSearchBtn) {
    DOM.clearSearchBtn.addEventListener("click", clearSearchInput);
  }

  // Quick Chips & Saved Cities
  if (DOM.quickChipsContainer) {
    DOM.quickChipsContainer.addEventListener("click", (e) => {
      const chip = e.target.closest(".pill-chip");
      if (chip && chip.dataset.city) {
        DOM.cityInput.value = chip.dataset.city;
        handleSearch();
      }
    });
  }

  // Geolocation
  if (DOM.locationBtn) {
    DOM.locationBtn.addEventListener("click", handleCurrentLocationRequest);
  }

  // Unit Switches
  if (DOM.unitCelsius) {
    DOM.unitCelsius.addEventListener("click", () => setTemperatureUnit("metric", true));
  }
  if (DOM.unitFahrenheit) {
    DOM.unitFahrenheit.addEventListener("click", () => setTemperatureUnit("imperial", true));
  }

  // Theme Toggle
  if (DOM.themeToggleBtn) {
    DOM.themeToggleBtn.addEventListener("click", toggleTheme);
  }

  // Particle Effects Toggle
  if (DOM.toggleParticlesBtn) {
    DOM.toggleParticlesBtn.addEventListener("click", toggleParticles);
  }

  // Bookmarking / Favorites
  if (DOM.toggleFavoriteBtn) {
    DOM.toggleFavoriteBtn.addEventListener("click", toggleCurrentCityFavorite);
  }
  if (DOM.heroBookmarkBtn) {
    DOM.heroBookmarkBtn.addEventListener("click", toggleCurrentCityFavorite);
  }

  // Recenter Map
  if (DOM.recenterMapBtn) {
    DOM.recenterMapBtn.addEventListener("click", () => {
      if (appState.mapInstance) {
        appState.mapInstance.setView([appState.activeCoordinates.lat, appState.activeCoordinates.lon], 11, { animate: true });
      }
    });
  }

  // Map Layer Switcher
  if (DOM.mapLayerSelector) {
    DOM.mapLayerSelector.addEventListener("click", (e) => {
      const btn = e.target.closest(".layer-pill");
      if (btn && btn.dataset.layer) {
        setMapLayer(btn.dataset.layer);
      }
    });
  }

  // Hourly Carousel Arrows
  if (DOM.hourlyScrollLeft) {
    DOM.hourlyScrollLeft.addEventListener("click", () => {
      DOM.hourlyForecastContainer.scrollBy({ left: -280, behavior: "smooth" });
    });
  }
  if (DOM.hourlyScrollRight) {
    DOM.hourlyScrollRight.addEventListener("click", () => {
      DOM.hourlyForecastContainer.scrollBy({ left: 280, behavior: "smooth" });
    });
  }

  // Alert Banner Dismiss
  if (DOM.alertCloseBtn) {
    DOM.alertCloseBtn.addEventListener("click", hideError);
  }

  // Command Palette
  window.addEventListener("keydown", (e) => {
    // Open Palette with Ctrl + K or Cmd + K or '/'
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openCommandPalette();
    } else if (e.key === "/" && document.activeElement !== DOM.cityInput && document.activeElement !== DOM.paletteSearchInput) {
      e.preventDefault();
      openCommandPalette();
    } else if (e.key === "Escape" && DOM.commandPaletteModal && !DOM.commandPaletteModal.hidden) {
      closeCommandPalette();
    }
  });

  if (DOM.paletteCloseBtn) {
    DOM.paletteCloseBtn.addEventListener("click", closeCommandPalette);
  }
  if (DOM.commandPaletteModal) {
    DOM.commandPaletteModal.addEventListener("click", (e) => {
      if (e.target === DOM.commandPaletteModal) closeCommandPalette();
    });
  }

  if (DOM.paletteSearchInput) {
    DOM.paletteSearchInput.addEventListener("input", handlePaletteFilter);
    DOM.paletteSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const firstItem = DOM.paletteResults.querySelector(".palette-item:not([hidden])");
        if (firstItem) {
          executePaletteAction(firstItem);
        } else if (DOM.paletteSearchInput.value.trim()) {
          DOM.cityInput.value = DOM.paletteSearchInput.value.trim();
          closeCommandPalette();
          handleSearch();
        }
      }
    });
  }

  if (DOM.paletteResults) {
    DOM.paletteResults.addEventListener("click", (e) => {
      const item = e.target.closest(".palette-item");
      if (item) executePaletteAction(item);
    });
  }
}

function clearSearchInput() {
  if (DOM.cityInput) {
    DOM.cityInput.value = "";
    DOM.cityInput.focus();
  }
  if (DOM.clearSearchBtn) {
    DOM.clearSearchBtn.hidden = true;
  }
}

/* ----------------------------------------------------------------------------
 * 5. Weather Data Fetching Pipeline (Fetch API + async/await)
 * ---------------------------------------------------------------------------- */
function handleSearch() {
  const query = DOM.cityInput ? DOM.cityInput.value.trim() : "";
  if (!query) {
    showError("Please enter a valid city name to search.");
    if (DOM.cityInput) DOM.cityInput.focus();
    return;
  }

  if (appState.isLoading) return;
  hideError();
  fetchCompleteWeatherData({ type: "city", value: query });
}

function handleCurrentLocationRequest() {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your current browser.");
    return;
  }

  showLoading("Triangulating current location coordinates...");
  hideError();

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      fetchCompleteWeatherData({ type: "coords", lat, lon });
    },
    (err) => {
      hideLoading();
      showError("Location access unavailable or denied. Please search by city name.");
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
}

/**
 * Master Data Fetcher: Parallel API requests for Current, Forecast, and AQI
 */
async function fetchCompleteWeatherData(target) {
  showLoading("Retrieving meteorological telemetry...");
  hideError();

  const key = CONFIG.apiKey;

  try {
    // 1. Current Weather
    let currentWeatherUrl = "";
    if (target.type === "city") {
      currentWeatherUrl = `${CONFIG.endpoints.weather}?q=${encodeURIComponent(target.value)}&appid=${key}&units=metric`;
    } else {
      currentWeatherUrl = `${CONFIG.endpoints.weather}?lat=${target.lat}&lon=${target.lon}&appid=${key}&units=metric`;
    }

    const currentRes = await fetch(currentWeatherUrl);
    if (!currentRes.ok) {
      const errJson = await currentRes.json().catch(() => ({}));
      throw { status: currentRes.status, message: errJson.message || "Failed to load current weather" };
    }
    const currentData = await currentRes.json();

    const lat = currentData.coord.lat;
    const lon = currentData.coord.lon;

    // 2 & 3. 5-Day Forecast & Air Pollution in parallel
    const forecastUrl = `${CONFIG.endpoints.forecast}?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;
    const aqiUrl = `${CONFIG.endpoints.airPollution}?lat=${lat}&lon=${lon}&appid=${key}`;

    const [forecastRes, aqiRes] = await Promise.all([
      fetch(forecastUrl).then((r) => (r.ok ? r.json() : null)),
      fetch(aqiUrl).then((r) => (r.ok ? r.json() : null))
    ]);

    // Commit to state
    appState.activeWeatherData = currentData;
    appState.activeForecastData = forecastRes;
    appState.activeAqiData = aqiRes;
    appState.activeCity = currentData.name;
    appState.activeCoordinates = { lat, lon };

    // Render components
    renderAllViews();
    updateMapPosition(lat, lon, currentData.name);
    updateAtmosphericParticleMood(currentData);
    updateBookmarkStatus();

    if (DOM.footerStatusText) {
      DOM.footerStatusText.textContent = `Connected • ${currentData.name} synced at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
  } catch (error) {
    console.error("LiveWeather Fetch Error:", error);
    if (error.status === 404) {
      showError(`Location "${target.value || "specified"}" not found. Please verify spelling.`);
    } else if (error.status === 401) {
      showError("API authorization error. Please check your OpenWeather API key.");
    } else if (!navigator.onLine) {
      showError("Network offline. Please check your internet connection.");
    } else {
      showError(error.message || "An unexpected error occurred while fetching weather telemetry.");
    }
  } finally {
    hideLoading();
  }
}

/* ----------------------------------------------------------------------------
 * 6. Rendering Engine & Modular Components
 * ---------------------------------------------------------------------------- */
function renderAllViews() {
  const current = appState.activeWeatherData;
  const forecast = appState.activeForecastData;
  const aqi = appState.activeAqiData;

  if (!current) return;

  renderHeroCard(current);

  if (forecast && forecast.list) {
    renderHourlyForecast(forecast.list, current.timezone);
    renderFiveDayForecast(forecast.list, current.timezone);
    renderTemperatureTrendCurve(forecast.list);
  }

  if (aqi && aqi.list && aqi.list[0]) {
    renderAqiWidget(aqi.list[0]);
  }

  renderHighlights(current);
  applyWeatherMoodClasses(current);

  initLucideIcons();
}

/**
 * Render Hero Current Weather Card
 */
function renderHeroCard(data) {
  const unit = appState.currentUnit;

  if (DOM.cityName) DOM.cityName.textContent = data.name;
  if (DOM.countryCode) DOM.countryCode.textContent = (data.sys && data.sys.country) ? data.sys.country : "—";

  const localDate = getCityLocalDate(data.dt, data.timezone);
  if (DOM.currentDateTime) {
    DOM.currentDateTime.textContent = formatDateTime(localDate);
  }

  const weather = (data.weather && data.weather[0]) ? data.weather[0] : { main: "Clear", description: "Clear Sky", icon: "01d" };
  if (DOM.weatherConditionText) {
    DOM.weatherConditionText.textContent = capitalize(weather.description || weather.main);
  }

  const tempVal = convertTemp(data.main.temp, unit);
  const feelsLikeVal = convertTemp(data.main.feels_like, unit);
  const maxVal = convertTemp(data.main.temp_max, unit);
  const minVal = convertTemp(data.main.temp_min, unit);
  const unitSymbol = unit === "imperial" ? "°F" : "°C";

  if (DOM.currentTemp) DOM.currentTemp.textContent = Math.round(tempVal);
  if (DOM.tempUnitSymbol) DOM.tempUnitSymbol.textContent = unitSymbol;
  if (DOM.feelsLikeTemp) DOM.feelsLikeTemp.textContent = `${Math.round(feelsLikeVal)}${unitSymbol}`;
  if (DOM.maxTemp) DOM.maxTemp.textContent = `${Math.round(maxVal)}${unitSymbol}`;
  if (DOM.minTemp) DOM.minTemp.textContent = `${Math.round(minVal)}${unitSymbol}`;

  if (DOM.weatherIconImg) {
    DOM.weatherIconImg.src = `https://openweathermap.org/img/wn/${weather.icon}@4x.png`;
    DOM.weatherIconImg.alt = weather.description;
  }

  renderSunCycle(data.sys, data.dt, data.timezone);
}

function renderSunCycle(sys, currentDt, timezone) {
  if (!sys || !sys.sunrise || !sys.sunset) return;

  const sunriseDate = getCityLocalDate(sys.sunrise, timezone);
  const sunsetDate = getCityLocalDate(sys.sunset, timezone);

  if (DOM.sunriseTime) DOM.sunriseTime.textContent = formatTimeOnly(sunriseDate);
  if (DOM.sunsetTime) DOM.sunsetTime.textContent = formatTimeOnly(sunsetDate);

  const total = sys.sunset - sys.sunrise;
  const elapsed = currentDt - sys.sunrise;

  let percent = 0;
  let status = "Nighttime";

  if (currentDt < sys.sunrise) {
    percent = 0;
    status = "Awaiting dawn";
  } else if (currentDt > sys.sunset) {
    percent = 100;
    status = "Sunset passed";
  } else {
    percent = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
    const hoursLeft = Math.max(0, Math.round((sys.sunset - currentDt) / 3600));
    status = `${hoursLeft} hr daylight remaining`;
  }

  if (DOM.sunProgressFill) DOM.sunProgressFill.style.width = `${percent}%`;
  if (DOM.sunProgressOrb) DOM.sunProgressOrb.style.left = `${percent}%`;
  if (DOM.sunDaylightStatus) DOM.sunDaylightStatus.textContent = status;
}

/**
 * Render Hourly Forecast Carousel Strip
 */
function renderHourlyForecast(list, timezone) {
  if (!DOM.hourlyForecastContainer) return;
  DOM.hourlyForecastContainer.innerHTML = "";

  const unit = appState.currentUnit;
  const unitSymbol = unit === "imperial" ? "°F" : "°C";
  const hours = list.slice(0, 10);

  hours.forEach((item, index) => {
    const itemDate = getCityLocalDate(item.dt, timezone);
    const timeFormatted = index === 0 ? "Now" : formatTimeOnly(itemDate);
    const weather = item.weather[0] || { main: "Clear", description: "Clear", icon: "01d" };
    const tempConverted = Math.round(convertTemp(item.main.temp, unit));

    const card = document.createElement("div");
    card.className = `hourly-item ${index === 0 ? "active" : ""}`;
    card.innerHTML = `
      <span class="hourly-time">${timeFormatted}</span>
      <img class="hourly-icon-img" src="https://openweathermap.org/img/wn/${weather.icon}@2x.png" alt="${weather.description}" loading="lazy" />
      <span class="hourly-temp">${tempConverted}${unitSymbol}</span>
      <span class="hourly-condition" title="${weather.description}">${weather.main}</span>
    `;
    DOM.hourlyForecastContainer.appendChild(card);
  });
}

/**
 * Render Dynamic SVG Temperature Spline Curve
 */
function renderTemperatureTrendCurve(list) {
  if (!DOM.tempCurveLine || !DOM.tempCurveArea) return;

  const pointsCount = 10;
  const items = list.slice(0, pointsCount);
  const temps = items.map((i) => i.main.temp);

  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const span = Math.max(1, max - min);

  const width = 920;
  const height = 55;
  const paddingY = 8;

  const coords = temps.map((t, i) => {
    const x = (i / (pointsCount - 1)) * width;
    // Invert y: highest temp has smallest y (top)
    const norm = (t - min) / span;
    const y = height - paddingY - norm * (height - paddingY * 2);
    return { x, y };
  });

  // Build cubic Bezier spline
  let pathD = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i];
    const p1 = coords[i + 1];
    const mx = (p0.x + p1.x) / 2;
    pathD += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  DOM.tempCurveLine.setAttribute("d", pathD);

  // Area path closes at bottom
  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;
  DOM.tempCurveArea.setAttribute("d", areaD);
}

/**
 * Render 5-Day Outlook with Apple-style Range Bars
 */
function renderFiveDayForecast(list, timezone) {
  if (!DOM.fiveDayForecastContainer) return;
  DOM.fiveDayForecastContainer.innerHTML = "";

  const unit = appState.currentUnit;
  const grouped = {};

  list.forEach((entry) => {
    const localDate = getCityLocalDate(entry.dt, timezone);
    const dateKey = localDate.toISOString().split("T")[0];

    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        date: localDate,
        entries: [],
        minTemp: entry.main.temp_min,
        maxTemp: entry.main.temp_max
      };
    }

    grouped[dateKey].entries.push(entry);
    if (entry.main.temp_min < grouped[dateKey].minTemp) grouped[dateKey].minTemp = entry.main.temp_min;
    if (entry.main.temp_max > grouped[dateKey].maxTemp) grouped[dateKey].maxTemp = entry.main.temp_max;
  });

  const dates = Object.keys(grouped).slice(0, 5);

  let overallMin = Infinity;
  let overallMax = -Infinity;
  dates.forEach((d) => {
    if (grouped[d].minTemp < overallMin) overallMin = grouped[d].minTemp;
    if (grouped[d].maxTemp > overallMax) overallMax = grouped[d].maxTemp;
  });
  const tempSpan = Math.max(1, overallMax - overallMin);

  dates.forEach((key, index) => {
    const day = grouped[key];
    const midEntry = day.entries.find((e) => {
      const h = getCityLocalDate(e.dt, timezone).getHours();
      return h >= 11 && h <= 15;
    }) || day.entries[Math.floor(day.entries.length / 2)];

    const weather = midEntry ? midEntry.weather[0] : { main: "Clear", description: "Sunny", icon: "01d" };
    const dayName = index === 0 ? "Today" : day.date.toLocaleDateString("en-US", { weekday: "short" });
    const formattedDate = day.date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const minConverted = Math.round(convertTemp(day.minTemp, unit));
    const maxConverted = Math.round(convertTemp(day.maxTemp, unit));

    const leftPercent = Math.max(0, Math.round(((day.minTemp - overallMin) / tempSpan) * 100));
    const widthPercent = Math.max(15, Math.min(100 - leftPercent, Math.round(((day.maxTemp - day.minTemp) / tempSpan) * 100)));

    const item = document.createElement("div");
    item.className = "fiveday-item";
    item.innerHTML = `
      <div class="fiveday-date-col">
        <span class="fiveday-day-name">${dayName}</span>
        <span class="fiveday-calendar-date">${formattedDate}</span>
      </div>
      <div class="fiveday-weather-col">
        <img class="fiveday-icon-img" src="https://openweathermap.org/img/wn/${weather.icon}@2x.png" alt="${weather.description}" loading="lazy" />
        <span class="fiveday-condition-label">${weather.main}</span>
      </div>
      <div class="fiveday-range-col">
        <div class="fiveday-range-bar-track">
          <div class="fiveday-range-bar-fill" style="left: ${leftPercent}%; width: ${widthPercent}%;"></div>
        </div>
      </div>
      <div class="fiveday-temp-col">
        <span class="temp-max-val">${maxConverted}°</span>
        <span class="temp-min-val">${minConverted}°</span>
      </div>
    `;
    DOM.fiveDayForecastContainer.appendChild(item);
  });
}

/**
 * Render Air Quality Index (AQI) Widget
 */
function renderAqiWidget(aqiData) {
  const aqiIndex = aqiData.main ? aqiData.main.aqi : 1; // 1 to 5
  const comps = aqiData.components || {};

  const aqiDescriptions = {
    1: { rating: "Good", advice: "Air quality is considered satisfactory, and air pollution poses little or no risk.", color: "#10B981" },
    2: { rating: "Fair", advice: "Air quality is acceptable; moderate concern for very sensitive individuals.", color: "#84CC16" },
    3: { rating: "Moderate", advice: "Members of sensitive groups may experience mild respiratory symptoms.", color: "#F59E0B" },
    4: { rating: "Poor", advice: "Everyone may begin to experience health effects; sensitive groups may experience more serious effects.", color: "#EF4444" },
    5: { rating: "Very Poor", advice: "Health warnings of emergency conditions. The entire population is likely to be affected.", color: "#8B5CF6" }
  };

  const meta = aqiDescriptions[aqiIndex] || aqiDescriptions[1];

  if (DOM.aqiScoreNum) {
    DOM.aqiScoreNum.textContent = aqiIndex;
    DOM.aqiScoreNum.style.color = meta.color;
  }
  if (DOM.aqiQualityBadge) {
    DOM.aqiQualityBadge.textContent = `${meta.rating} (AQI ${aqiIndex})`;
    DOM.aqiQualityBadge.style.color = meta.color;
    DOM.aqiQualityBadge.style.background = `${meta.color}20`;
  }
  if (DOM.aqiRatingText) DOM.aqiRatingText.textContent = `Air Quality is ${meta.rating}`;
  if (DOM.aqiAdviceText) DOM.aqiAdviceText.textContent = meta.advice;

  // Active Segment highlight
  const segments = document.querySelectorAll(".aqi-segment");
  segments.forEach((seg, idx) => {
    seg.classList.toggle("active", idx === aqiIndex - 1);
  });

  // Pollutants breakdown
  if (DOM.pm25Val) DOM.pm25Val.textContent = (comps.pm2_5 || 12.0).toFixed(1);
  if (DOM.pm10Val) DOM.pm10Val.textContent = (comps.pm10 || 24.0).toFixed(1);
  if (DOM.o3Val) DOM.o3Val.textContent = (comps.o3 || 38.0).toFixed(1);
  if (DOM.no2Val) DOM.no2Val.textContent = (comps.no2 || 8.5).toFixed(1);
}

/**
 * Render Highlights 6-Card Grid
 */
function renderHighlights(current) {
  const unit = appState.currentUnit;

  // Humidity
  const humidity = current.main.humidity || 0;
  if (DOM.humidityVal) DOM.humidityVal.textContent = humidity;
  if (DOM.humidityProgress) DOM.humidityProgress.style.width = `${humidity}%`;
  if (DOM.humidityDesc) {
    DOM.humidityDesc.textContent = humidity < 35 ? "Dry atmospheric air" : humidity < 65 ? "Optimal comfort range" : "High moisture content";
  }

  // Wind
  const rawSpeed = current.wind ? current.wind.speed : 0;
  const deg = current.wind ? current.wind.deg || 0 : 0;
  let speedText = "";
  let unitText = "km/h";

  if (unit === "imperial") {
    speedText = Math.round(rawSpeed * 2.23694);
    unitText = "mph";
  } else {
    speedText = Math.round(rawSpeed * 3.6);
    unitText = "km/h";
  }

  if (DOM.windSpeedVal) DOM.windSpeedVal.textContent = speedText;
  if (DOM.windSpeedUnit) DOM.windSpeedUnit.textContent = unitText;
  if (DOM.compassPointer) DOM.compassPointer.style.transform = `rotate(${deg}deg)`;
  if (DOM.windDirText) DOM.windDirText.textContent = `${getCardinal(deg)} (${deg}°)`;
  if (DOM.windGustDesc) DOM.windGustDesc.textContent = speedText < 15 ? "Gentle breeze" : speedText < 35 ? "Moderate airflow" : "Strong gale gusts";

  // Pressure
  const pressure = current.main.pressure || 1013;
  if (DOM.pressureVal) DOM.pressureVal.textContent = pressure;
  if (DOM.pressureStatus) {
    DOM.pressureStatus.textContent = pressure > 1020 ? "High barometric pressure" : pressure < 1005 ? "Low pressure (storm front)" : "Normal sea-level equilibrium";
  }

  // Visibility
  const rawVis = current.visibility !== undefined ? current.visibility : 10000;
  let visDisplay = 0;
  let visUnit = "km";
  if (unit === "imperial") {
    visDisplay = (rawVis / 1609.34).toFixed(1);
    visUnit = "mi";
  } else {
    visDisplay = (rawVis / 1000).toFixed(1);
    visUnit = "km";
  }
  if (DOM.visibilityVal) DOM.visibilityVal.textContent = visDisplay;
  if (DOM.visibilityUnit) DOM.visibilityUnit.textContent = visUnit;
  if (DOM.visibilityProgress) DOM.visibilityProgress.style.width = `${Math.min(100, (rawVis / 10000) * 100)}%`;
  if (DOM.visibilityDesc) DOM.visibilityDesc.textContent = rawVis >= 10000 ? "Clear optical clarity" : "Light mist / reduced range";

  // Clouds
  const clouds = (current.clouds && current.clouds.all !== undefined) ? current.clouds.all : 0;
  if (DOM.cloudsVal) DOM.cloudsVal.textContent = clouds;
  if (DOM.cloudsProgress) DOM.cloudsProgress.style.width = `${clouds}%`;
  if (DOM.cloudsDesc) DOM.cloudsDesc.textContent = clouds < 20 ? "Open sunny skies" : clouds < 75 ? "Scattered clouds" : "Dense overcast";

  // UV Exposure
  const uvEst = estimateUv(current);
  if (DOM.uvVal) DOM.uvVal.textContent = uvEst.val.toFixed(1);
  if (DOM.uvUnit) DOM.uvUnit.textContent = uvEst.rating;
  if (DOM.uvProgress) DOM.uvProgress.style.left = `${Math.min(95, (uvEst.val / 11) * 100)}%`;
  if (DOM.uvDesc) DOM.uvDesc.textContent = uvEst.advice;
}

function estimateUv(current) {
  const localDate = getCityLocalDate(current.dt, current.timezone);
  const hour = localDate.getHours();

  if (hour < 7 || hour > 18) {
    return { val: 0.0, rating: "Low", advice: "No protection required" };
  }
  const solarFactor = Math.sin(((hour - 6) / 12) * Math.PI);
  const cloudFraction = ((current.clouds && current.clouds.all) || 0) / 100;
  const val = Math.max(0, 8.5 * solarFactor * (1 - cloudFraction * 0.5));

  if (val < 3) return { val, rating: "Low", advice: "Minimal sun protection needed" };
  if (val < 6) return { val, rating: "Moderate", advice: "Wear sunscreen & sunglasses" };
  if (val < 8) return { val, rating: "High", advice: "Cover up and seek midday shade" };
  return { val, rating: "Very High", advice: "Take extra precautions outdoors" };
}

/* ----------------------------------------------------------------------------
 * 7. Interactive Multi-Layer Map Integration (Zero Watermark)
 * ---------------------------------------------------------------------------- */
const MAP_LAYERS_CONFIG = {
  satellite: {
    base: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    overlay: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 18,
    attribution: "Esri Satellite Imagery"
  },
  dark: {
    base: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    overlay: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 16,
    attribution: "Esri Dark Canvas"
  },
  streets: {
    base: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    overlay: null,
    maxZoom: 19,
    attribution: "OpenStreetMap"
  },
  radar: {
    base: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    overlay: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${CONFIG.apiKey}`,
    maxZoom: 16,
    attribution: "OpenWeather Precipitation Radar"
  }
};

function setMapLayer(layerName) {
  if (!appState.mapInstance) return;
  const layerCfg = MAP_LAYERS_CONFIG[layerName] || MAP_LAYERS_CONFIG.satellite;
  appState.activeMapLayer = layerName;

  // Remove existing tile layers
  if (appState.currentBaseTileLayer) {
    appState.mapInstance.removeLayer(appState.currentBaseTileLayer);
    appState.currentBaseTileLayer = null;
  }
  if (appState.currentOverlayTileLayer) {
    appState.mapInstance.removeLayer(appState.currentOverlayTileLayer);
    appState.currentOverlayTileLayer = null;
  }

  // Add base layer
  appState.currentBaseTileLayer = L.tileLayer(layerCfg.base, {
    maxZoom: layerCfg.maxZoom || 18
  }).addTo(appState.mapInstance);

  // Add overlay layer if available
  if (layerCfg.overlay) {
    appState.currentOverlayTileLayer = L.tileLayer(layerCfg.overlay, {
      maxZoom: layerCfg.maxZoom || 18,
      opacity: layerName === "radar" ? 0.75 : 0.95
    }).addTo(appState.mapInstance);
  }

  // Ensure marker stays on top
  if (appState.mapMarker) {
    appState.mapMarker.bringToFront();
  }

  // Update UI pill buttons
  if (DOM.mapLayerSelector) {
    const pills = DOM.mapLayerSelector.querySelectorAll(".layer-pill");
    pills.forEach((p) => {
      p.classList.toggle("active", p.dataset.layer === layerName);
    });
  }
}

function initLeafletMap() {
  if (!DOM.interactiveMap || typeof L === "undefined") return;

  try {
    const { lat, lon } = appState.activeCoordinates;
    appState.mapInstance = L.map("interactiveMap", {
      zoomControl: true,
      attributionControl: false
    }).setView([lat, lon], 10);

    // Initial layer selection
    setMapLayer(appState.activeMapLayer || "satellite");

    // Custom Pulse Icon
    const pulseIcon = L.divIcon({
      className: "custom-map-icon",
      html: '<div class="map-pulse-beacon"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    appState.mapMarker = L.marker([lat, lon], { icon: pulseIcon }).addTo(appState.mapInstance);
  } catch (e) {
    console.warn("Leaflet map initialization skipped:", e);
  }
}

function updateMapPosition(lat, lon, cityName) {
  if (DOM.mapLatLonText) {
    const ns = lat >= 0 ? "N" : "S";
    const ew = lon >= 0 ? "E" : "W";
    DOM.mapLatLonText.textContent = `${Math.abs(lat).toFixed(2)}° ${ns}, ${Math.abs(lon).toFixed(2)}° ${ew}`;
  }

  if (!appState.mapInstance || !appState.mapMarker) return;

  appState.mapInstance.flyTo([lat, lon], 11, { duration: 1.5 });
  appState.mapMarker.setLatLng([lat, lon]);
  appState.mapMarker.bindPopup(`<b>${cityName}</b><br>Live Telemetry`).openPopup();
}

function updateMapTileTheme(theme) {
  if (!appState.mapInstance) return;
  // If user selected dark or streets, adapt to theme; otherwise keep satellite/radar
  if (appState.activeMapLayer === "dark" || appState.activeMapLayer === "streets") {
    setMapLayer(theme === "dark" ? "dark" : "streets");
  }
}

/* ----------------------------------------------------------------------------
 * 8. HTML5 Canvas Atmospheric Particle Simulation Engine
 * ---------------------------------------------------------------------------- */
let canvasState = {
  ctx: null,
  width: 0,
  height: 0,
  particles: [],
  currentMode: "CLEAR", // "RAIN", "SNOW", "CLEAR", "STORM"
  animId: null
};

function initCanvasPhysics() {
  const canvas = DOM.weatherCanvas;
  if (!canvas) return;

  canvasState.ctx = canvas.getContext("2d");
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  setupParticlesForMode("CLEAR");
  startParticleLoop();
}

function resizeCanvas() {
  if (!DOM.weatherCanvas) return;
  canvasState.width = DOM.weatherCanvas.width = window.innerWidth;
  canvasState.height = DOM.weatherCanvas.height = window.innerHeight;
}

function setupParticlesForMode(mode) {
  canvasState.currentMode = mode;
  canvasState.particles = [];

  const count = mode === "RAIN" || mode === "STORM" ? 140 : mode === "SNOW" ? 80 : 45;

  for (let i = 0; i < count; i++) {
    canvasState.particles.push(createParticle(mode));
  }
}

function createParticle(mode) {
  const w = canvasState.width || window.innerWidth;
  const h = canvasState.height || window.innerHeight;

  if (mode === "RAIN" || mode === "STORM") {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      speed: 12 + Math.random() * 8,
      len: 14 + Math.random() * 10,
      opacity: 0.2 + Math.random() * 0.4
    };
  } else if (mode === "SNOW") {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      radius: 1.5 + Math.random() * 2.5,
      speed: 0.8 + Math.random() * 1.5,
      swing: Math.random() * Math.PI * 2,
      swingSpeed: 0.02 + Math.random() * 0.02,
      opacity: 0.3 + Math.random() * 0.5
    };
  } else {
    // CLEAR / SUNNY / CLOUD: Golden ambient dust motes
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      radius: 1.0 + Math.random() * 2.0,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.2 - Math.random() * 0.5,
      opacity: 0.15 + Math.random() * 0.35
    };
  }
}

function startParticleLoop() {
  if (canvasState.animId) cancelAnimationFrame(canvasState.animId);

  function render() {
    if (appState.particlesEnabled && canvasState.ctx) {
      drawParticles();
    } else if (canvasState.ctx) {
      canvasState.ctx.clearRect(0, 0, canvasState.width, canvasState.height);
    }
    canvasState.animId = requestAnimationFrame(render);
  }
  render();
}

function drawParticles() {
  const ctx = canvasState.ctx;
  const w = canvasState.width;
  const h = canvasState.height;
  const mode = canvasState.currentMode;

  ctx.clearRect(0, 0, w, h);

  if (mode === "RAIN" || mode === "STORM") {
    ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();

    canvasState.particles.forEach((p) => {
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - 2, p.y + p.len);

      p.y += p.speed;
      p.x -= 1;
      if (p.y > h) {
        p.y = -p.len;
        p.x = Math.random() * w;
      }
    });
    ctx.stroke();

    // Occasional subtle lightning flash for storm
    if (mode === "STORM" && Math.random() < 0.006) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
      ctx.fillRect(0, 0, w, h);
    }
  } else if (mode === "SNOW") {
    ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
    canvasState.particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      p.y += p.speed;
      p.swing += p.swingSpeed;
      p.x += Math.sin(p.swing) * 0.7;

      if (p.y > h) {
        p.y = -5;
        p.x = Math.random() * w;
      }
    });
  } else {
    // Golden / Solar ambient particles
    ctx.fillStyle = "rgba(251, 191, 36, 0.35)";
    canvasState.particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;

      if (p.y < -5) p.y = h + 5;
      if (p.x < -5) p.x = w + 5;
      if (p.x > w + 5) p.x = -5;
    });
  }
}

function updateAtmosphericParticleMood(data) {
  const id = data.weather && data.weather[0] ? data.weather[0].id : 800;

  if (id >= 200 && id < 300) {
    setupParticlesForMode("STORM");
  } else if (id >= 300 && id < 600) {
    setupParticlesForMode("RAIN");
  } else if (id >= 600 && id < 700) {
    setupParticlesForMode("SNOW");
  } else {
    setupParticlesForMode("CLEAR");
  }
}

function toggleParticles() {
  appState.particlesEnabled = !appState.particlesEnabled;
  localStorage.setItem(CONFIG.storageKeys.particles, appState.particlesEnabled);
  updateParticlesToggleBtn();
}

function updateParticlesToggleBtn() {
  if (DOM.toggleParticlesBtn) {
    DOM.toggleParticlesBtn.classList.toggle("active", appState.particlesEnabled);
  }
}

/* ----------------------------------------------------------------------------
 * 9. Favorites & Bookmarks Management
 * ---------------------------------------------------------------------------- */
function toggleCurrentCityFavorite() {
  const city = appState.activeCity;
  if (!city) return;

  const index = appState.favorites.indexOf(city);
  if (index > -1) {
    appState.favorites.splice(index, 1);
  } else {
    appState.favorites.unshift(city);
    if (appState.favorites.length > 8) appState.favorites.pop();
  }

  localStorage.setItem(CONFIG.storageKeys.favorites, JSON.stringify(appState.favorites));
  renderSavedCitiesPills();
  updateBookmarkStatus();
}

function updateBookmarkStatus() {
  const isFav = appState.favorites.includes(appState.activeCity);
  if (DOM.heroBookmarkBtn) DOM.heroBookmarkBtn.classList.toggle("active", isFav);
  if (DOM.toggleFavoriteBtn) DOM.toggleFavoriteBtn.classList.toggle("active", isFav);
}

function renderSavedCitiesPills() {
  if (!DOM.savedCitiesContainer) return;
  DOM.savedCitiesContainer.innerHTML = "";

  appState.favorites.forEach((city) => {
    const pill = document.createElement("button");
    pill.className = "pill-chip saved-chip";
    pill.dataset.city = city;
    pill.textContent = `★ ${city}`;
    DOM.savedCitiesContainer.appendChild(pill);
  });
}

/* ----------------------------------------------------------------------------
 * 10. Command Palette Modal Engine (Ctrl + K)
 * ---------------------------------------------------------------------------- */
function openCommandPalette() {
  if (!DOM.commandPaletteModal) return;
  DOM.commandPaletteModal.hidden = false;
  if (DOM.paletteSearchInput) {
    DOM.paletteSearchInput.value = "";
    DOM.paletteSearchInput.focus();
  }
  handlePaletteFilter();
}

function closeCommandPalette() {
  if (DOM.commandPaletteModal) {
    DOM.commandPaletteModal.hidden = true;
  }
}

function handlePaletteFilter() {
  const query = DOM.paletteSearchInput ? DOM.paletteSearchInput.value.toLowerCase().trim() : "";
  const items = DOM.paletteResults.querySelectorAll(".palette-item");

  items.forEach((item) => {
    const text = item.textContent.toLowerCase();
    const match = text.includes(query);
    item.hidden = !match;
  });
}

function executePaletteAction(item) {
  const action = item.dataset.action;
  const value = item.dataset.value;

  closeCommandPalette();

  if (action === "locate") {
    handleCurrentLocationRequest();
  } else if (action === "toggle-theme") {
    toggleTheme();
  } else if (action === "toggle-unit") {
    const nextUnit = appState.currentUnit === "metric" ? "imperial" : "metric";
    setTemperatureUnit(nextUnit, true);
  } else if (action === "city" && value) {
    DOM.cityInput.value = value;
    handleSearch();
  }
}

/* ----------------------------------------------------------------------------
 * 11. Unit & Theme Controls
 * ---------------------------------------------------------------------------- */
function setTemperatureUnit(unit, persist = true) {
  appState.currentUnit = unit;
  if (persist) localStorage.setItem(CONFIG.storageKeys.unit, unit);

  if (DOM.unitCelsius && DOM.unitFahrenheit) {
    DOM.unitCelsius.classList.toggle("active", unit === "metric");
    DOM.unitCelsius.setAttribute("aria-pressed", unit === "metric");
    DOM.unitFahrenheit.classList.toggle("active", unit === "imperial");
    DOM.unitFahrenheit.setAttribute("aria-pressed", unit === "imperial");
  }

  if (appState.activeWeatherData) {
    renderAllViews();
  }
}

function toggleTheme() {
  const nextTheme = appState.currentTheme === "dark" ? "light" : "dark";
  setTheme(nextTheme, true);
}

function setTheme(theme, persist = true) {
  appState.currentTheme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  if (persist) localStorage.setItem(CONFIG.storageKeys.theme, theme);
  updateMapTileTheme(theme);
}

function applyWeatherMoodClasses(data) {
  const body = document.body;
  const id = data.weather && data.weather[0] ? data.weather[0].id : 800;

  body.classList.remove(
    "weather-mood-clear",
    "weather-mood-clouds",
    "weather-mood-rain",
    "weather-mood-drizzle",
    "weather-mood-snow",
    "weather-mood-thunderstorm"
  );

  if (id >= 200 && id < 300) body.classList.add("weather-mood-thunderstorm");
  else if (id >= 300 && id < 600) body.classList.add("weather-mood-rain");
  else if (id >= 600 && id < 700) body.classList.add("weather-mood-snow");
  else if (id === 800) body.classList.add("weather-mood-clear");
  else body.classList.add("weather-mood-clouds");
}

/* ----------------------------------------------------------------------------
 * 12. Feedback & Helper Utilities
 * ---------------------------------------------------------------------------- */
function showLoading(msg = "Loading telemetry...") {
  appState.isLoading = true;
  if (DOM.loadingText) DOM.loadingText.textContent = msg;
  if (DOM.loadingIndicator) DOM.loadingIndicator.hidden = false;
  if (DOM.weatherDashboard) DOM.weatherDashboard.style.opacity = "0.5";
  if (DOM.searchSubmitBtn) DOM.searchSubmitBtn.disabled = true;
}

function hideLoading() {
  appState.isLoading = false;
  if (DOM.loadingIndicator) DOM.loadingIndicator.hidden = true;
  if (DOM.weatherDashboard) DOM.weatherDashboard.style.opacity = "1";
  if (DOM.searchSubmitBtn) DOM.searchSubmitBtn.disabled = false;
}

function showError(msg) {
  if (!DOM.alertBanner || !DOM.alertMessage) return;
  DOM.alertMessage.textContent = msg;
  DOM.alertBanner.hidden = false;
}

function hideError() {
  if (DOM.alertBanner) DOM.alertBanner.hidden = true;
}

function convertTemp(celsius, unit) {
  if (celsius === null || celsius === undefined) return 0;
  if (unit === "imperial") return (celsius * 9) / 5 + 32;
  return celsius;
}

function getCityLocalDate(utcSeconds, offsetSeconds = 0) {
  const utcMs = utcSeconds * 1000;
  const offsetMs = offsetSeconds * 1000;
  const clientOffsetMs = new Date().getTimezoneOffset() * 60 * 1000;
  return new Date(utcMs + offsetMs + clientOffsetMs);
}

function formatDateTime(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).replace(",", " •");
}

function formatTimeOnly(date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

function capitalize(str) {
  if (!str) return "";
  return str.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function getCardinal(deg) {
  const cardinals = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return cardinals[Math.round((deg % 360) / 22.5) % 16];
}
