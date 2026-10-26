# 🌦️ LiveWeather — Modern Weather Application

A modern, responsive, and visually stunning real-time weather intelligence dashboard built purely with **HTML5, CSS3, and Vanilla JavaScript**, powered by the **OpenWeather API**.

LiveWeather delivers an intuitive SaaS-grade interface featuring real-time meteorological metrics, daylight cycle tracking, dynamic weather-responsive backdrop animations, hourly forecasts, and 5-day outlooks with seamless Celsius/Fahrenheit conversion.

---

## ✨ Advanced Features & Capabilities

- **Interactive HTML5 Canvas Particle Engine**: Physics-based real-time weather particles (slanted raindrops with puddle ripples, fluffy drifting snowflakes with sinusoidal oscillation, golden solar dust motes, and ambient thunderstorm lightning flashes) that adapt dynamically to weather conditions.
- **Interactive Leaflet Radar / Satellite Map**: Geographic map widget featuring custom pulsed beacon marker, coordinates badge, and recenter navigation.
- **Real-Time Air Quality Index (AQI)**: Full OpenWeather Air Pollution API integration displaying live AQI levels (Good to Very Poor), contextual health advisories, and pollutant breakdown ($\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{O}_3$, $\text{NO}_2$).
- **Dynamic SVG Temperature Trend Curve**: Real-time cubic Bezier temperature spline connecting hourly periods with soft gradient area fill.
- **Raycast-Style Command Palette (`⌘K` / `Ctrl + K`)**: Keyboard-driven floating command center for instant city searches, GPS location detection, and unit/theme toggles.
- **Saved Cities & Favorites System**: Star/bookmark current locations with 1-click access pills persisted in `localStorage`.
- **Daylight & Celestial Sun Arc Tracker**: Live sunrise, sunset, and daylight progression percentage calculated from the searched city's exact timezone offset.
- **5-Day Weather Outlook**: Daily highs and lows with Apple-style continuous temperature range bars.
- **Weather Highlights Bento**: Humidity, rotating $360^\circ$ wind compass, barometric pressure, visibility, cloud coverage, and derived solar UV exposure index.
- **Instantaneous Unit Toggle (°C / °F)**: Recalculates all temperatures and metrics on the fly without extra network requests.

---

## 🛠️ Technology Stack

- **Structure**: Semantic HTML5 with ARIA accessibility roles.
- **Styling**: Vanilla CSS3 (Custom Properties, Flexbox, CSS Grid, Glassmorphism, CSS Transitions & Keyframes).
- **Logic**: Vanilla JavaScript (ES6+, `async/await`, Fetch API, native DOM manipulation).
- **Weather Data**: [OpenWeather API](https://openweathermap.org/api) (Current Weather Data & 5-Day / 3-Hour Forecast).
- **Icons**: [Lucide Icons](https://lucide.dev/) via CDN & official OpenWeather condition assets.
- **Typography**: Google Fonts ([Outfit](https://fonts.google.com/specimen/Outfit) & [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)).

> **Strict Constraint Compliance**: No external UI frameworks (No React, Angular, Vue, Bootstrap, or Tailwind CSS). Pure Vanilla web standards only.

---

## 📁 Project Structure

```text
weather-app/
│
├── index.html       # Semantic HTML5 layout, modals, and accessibility markup
├── style.css        # CSS variables, glassmorphic styling, themes & responsiveness
├── script.js        # Core JavaScript application engine & OpenWeather API integration
├── .gitignore       # Git exclusion rules for API keys and environment files
└── README.md        # Comprehensive documentation and setup instructions
```

---

## 🔑 Getting an OpenWeather API Key

To retrieve live global weather data, you need a free OpenWeather API key:

1. Visit [OpenWeather Sign Up](https://home.openweathermap.org/users/sign_up) and create a free account.
2. Confirm your email address to activate your account.
3. Navigate to the [API Keys Tab](https://home.openweathermap.org/api_keys).
4. Copy your default API key or generate a new key named `LiveWeather`.
5. **Important Note**: Newly generated OpenWeather API keys typically take **10 to 30 minutes** to become active on OpenWeather's worldwide servers. If you receive an HTTP 401 error initially, please allow a short time for the key to propagate.

---

## ⚙️ API Configuration

The application is configured in `script.js` with keys for both weather data and map tiles:
```javascript
const CONFIG = {
  apiKey: "9f2903ea0c4e300f511f1206cd384e88",      // OpenWeather API Key
  cartoApiKey: "cb1_4v95_2_e125014b43a826f01e565c7d", // Carto Basemaps API Key
  // ...
};
```
- **OpenWeather API Key**: Powers live weather, 5-day forecast, and Air Quality (AQI) telemetry.
- **Carto Basemap API Key**: Authenticates high-resolution dark and light vector/raster map tiles for the Leaflet radar map widget.

---

## 🚀 How to Run the Project Locally

Because LiveWeather uses standard modern HTML, CSS, and JavaScript, you can run it using any static web server or directly in your browser.

### Option A: Using VS Code Live Server (Fastest)
1. Install the **Live Server** extension by Ritwick Dey in VS Code.
2. Right-click on `index.html`.
3. Select **"Open with Live Server"**.
4. The app will open at `http://127.0.0.1:5500`.

### Option B: Using Python
If you have Python installed:
```bash
# Python 3.x
python -m http.server 8000
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

### Option C: Using Node.js (npx)
```bash
npx serve .
```

---

## 🔒 Security Considerations

1. **Client-Side API Visibility**: Any API key included in client-side JavaScript or entered in browser `localStorage` can be viewed by end users inspecting browser network traffic.
2. **Production Recommendation**: For commercial or production deployments, route weather requests through a secure serverless backend (e.g., Cloudflare Workers, Next.js API Routes, Express, or Vercel Edge Functions) where your `OPENWEATHER_API_KEY` is kept in secret server environment variables.
3. **Repository Cleanliness**: The repository includes `.gitignore` to prevent secret and configuration leakage.

---

## 🧪 Testing Checklist

- [x] **Initial Load**: Dashboard loads cleanly with smooth animations, displaying default location data.
- [x] **City Search**: Searching for cities such as *Mumbai*, *Nashik*, *Pune*, *Delhi*, *London*, and *Tokyo* updates current weather and forecast without page reload.
- [x] **Keyboard Navigation**: Pressing `Enter` submits searches; pressing `Ctrl + K` or `/` focuses search; pressing `Esc` clears input or closes modals.
- [x] **Unit Conversion**: Toggling between **°C** and **°F** recalculates all current, feels-like, min/max, hourly, and 5-day forecast temperatures instantaneously without extra API calls.
- [x] **Light / Dark Mode**: Theme toggle alternates between daylight glassmorphism and deep cosmic navy mode; persists after refreshing via `localStorage`.
- [x] **Geolocation**: Clicking **"My Location"** requests browser coordinates and loads current local weather.
- [x] **Hourly Forecast**: Displays 3-hour increments with horizontal scroll controls and interactive hover cards.
- [x] **5-Day Forecast**: Calendar grouping accurately computes daily minimum and maximum temperatures.
- [x] **Responsive Layout**: Fluid experience across mobile (<480px), tablet (768px), and desktop (1024px+).
- [x] **Error Handling**: Displays friendly non-blocking notification banners for empty inputs, invalid city names, and rate limits without raw browser `alert()` popups.

---

## 🔮 Future Enhancements

- Interactive radar precipitation maps using Leaflet.js / OpenLayers.
- Severe weather alert banner integration with official meteorological warnings.
- Multiple saved favorite cities drawer.
- Historical weather comparisons and air quality index (AQI) radar breakdown.

---

## 👨‍💻 Author & Portfolio

- **Project**: LiveWeather — Modern Weather Application
- **Role**: Frontend Engineering & UI/UX Design
- **Built With**: HTML5, CSS3, Vanilla JavaScript, OpenWeather API
- **License**: MIT
