const API_KEY = "904f939c52f09f09feaec03f43e066bb";
const BASE_CURRENT = "https://api.openweathermap.org/data/2.5/weather";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const errorBox = document.getElementById("errorBox");
const errorTextSpan = document.getElementById("errorText");
const weatherContainer = document.getElementById("weatherContent");

// Helper functions
function hideError() {
    errorBox.style.display = "none";
}

function showError(message = "Invalid city name or network issue") {
    errorTextSpan.innerText = message;
    errorBox.style.display = "flex";
    weatherContainer.innerHTML = `<div class="loading-placeholder"><i class="fas fa-cloud-rain" style="font-size: 2rem;"></i><p>⚠️ ${message}</p><p style="font-size:12px;">Please try again</p></div>`;
}

function getFormattedDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const datePart = now.toLocaleDateString(undefined, options);
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timePart = `${hours}:${minutes} ${ampm}`;
    return `${datePart} • ${timePart}`;
}

function formatLocalTime(timestampUTC, timezoneOffsetSec) {
    const utcDate = new Date(timestampUTC * 1000);
    const localTime = new Date(utcDate.getTime() + timezoneOffsetSec * 1000);
    let hours = localTime.getUTCHours();
    const minutes = localTime.getUTCMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
}

async function fetchSevenDayForecast(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;
    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error("forecast failed");
        const data = await resp.json();
        return data;
    } catch (err) {
        console.warn("Forecast error", err);
        return null;
    }
}

function buildForecastHTML(forecastData) {
    if (!forecastData || !forecastData.daily) {
        return `<div class="forecast-day" style="text-align:center;">Forecast unavailable</div>`;
    }
    const days = forecastData.daily.time;
    const maxTemps = forecastData.daily.temperature_2m_max;
    const minTemps = forecastData.daily.temperature_2m_min;
    
    let forecastHTML = '';
    for (let i = 0; i < days.length && i < 7; i++) {
        const dateStr = days[i];
        const dayDate = new Date(dateStr);
        const dayName = dayDate.toLocaleDateString(undefined, { weekday: 'short' });
        const high = Math.round(maxTemps[i]);
        const low = Math.round(minTemps[i]);
        forecastHTML += `
            <div class="forecast-day">
                <span class="day">${dayName}</span>
                <div class="forecast-temp">
                    <span class="high">${high}°</span>
                    <span class="low">${low}°</span>
                </div>
            </div>
        `;
    }
    return forecastHTML;
}

// Core function to display weather from data object
function renderWeatherUI(weatherData, forecastData) {
    const cityDisplay = weatherData.name + (weatherData.sys?.country ? `, ${weatherData.sys.country}` : "");
    const temp = Math.round(weatherData.main.temp);
    const feelsLike = Math.round(weatherData.main.feels_like);
    const condition = weatherData.weather[0].description;
    const humidityVal = weatherData.main.humidity;
    const windMs = weatherData.wind.speed;
    const windKmh = (windMs * 3.6).toFixed(1);
    const pressureVal = weatherData.main.pressure;
    const visibilityKm = (weatherData.visibility / 1000).toFixed(1);
    const sunriseUTC = weatherData.sys.sunrise;
    const sunsetUTC = weatherData.sys.sunset;
    const timezoneOffsetSec = weatherData.timezone;
    const sunriseLocal = formatLocalTime(sunriseUTC, timezoneOffsetSec);
    const sunsetLocal = formatLocalTime(sunsetUTC, timezoneOffsetSec);
    const currentDateTime = getFormattedDateTime();
    
    const weatherMain = weatherData.weather[0].main;
    let conditionIcon = `<i class="fas fa-cloud-sun"></i>`;
    if (weatherMain === "Clear") conditionIcon = `<i class="fas fa-sun"></i>`;
    else if (weatherMain === "Rain") conditionIcon = `<i class="fas fa-cloud-rain"></i>`;
    else if (weatherMain === "Clouds") conditionIcon = `<i class="fas fa-cloud"></i>`;
    else if (weatherMain === "Mist" || weatherMain === "Fog") conditionIcon = `<i class="fas fa-smog"></i>`;
    else if (weatherMain === "Snow") conditionIcon = `<i class="fas fa-snowflake"></i>`;
    else if (weatherMain === "Thunderstorm") conditionIcon = `<i class="fas fa-bolt"></i>`;
    
    let forecastHTML = `<div class="forecast-row">${buildForecastHTML(forecastData)}</div>`;
    if (!forecastData) {
        forecastHTML = `<div class="forecast-row"><div class="forecast-day">Forecast data temporarily unavailable</div></div>`;
    }
    
    const completeUI = `
        <div class="weather-overview">
            <div class="temp-section">
                <div class="city-name">
                    <i class="fas fa-location-dot"></i> ${cityDisplay}
                </div>
                <div class="big-temp">${temp}°C</div>
                <div class="feels-like">Feels like ${feelsLike}°C</div>
                <div class="condition-text">${conditionIcon}  ${condition.charAt(0).toUpperCase() + condition.slice(1)}</div>
                <div class="datetime">
                    <i class="far fa-calendar-alt"></i> ${currentDateTime}
                </div>
                <div class="sun-times">
                    <div class="sun-item"><i class="fas fa-sunrise"></i> Sunrise <strong>${sunriseLocal}</strong></div>
                    <div class="sun-item"><i class="fas fa-sunset"></i> Sunset <strong>${sunsetLocal}</strong></div>
                </div>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-tint"></i></div>
                    <div class="stat-info">
                        <p>${humidityVal}%</p>
                        <p>Humidity</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-wind"></i></div>
                    <div class="stat-info">
                        <p>${windKmh} km/h</p>
                        <p>Wind Speed</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-gauge-high"></i></div>
                    <div class="stat-info">
                        <p>${pressureVal} hPa</p>
                        <p>Pressure</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-eye"></i></div>
                    <div class="stat-info">
                        <p>${visibilityKm} km</p>
                        <p>Visibility</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="forecast-section">
            <div class="forecast-header">
                <h3><i class="fas fa-calendar-week"></i> 7-Day Forecast</h3>
                <a href="#" id="fullForecastLink" style="cursor:default;">View full forecast →</a>
            </div>
            ${forecastHTML}
        </div>
    `;
    weatherContainer.innerHTML = completeUI;
    const fakeLink = document.getElementById("fullForecastLink");
    if (fakeLink) fakeLink.addEventListener("click", (e) => e.preventDefault());
}

// Fetch weather by city name
async function updateWeatherForCity(cityName) {
    if (!cityName || cityName.trim() === "") {
        showError("Please enter a city name");
        return false;
    }
    weatherContainer.innerHTML = `<div class="loading-placeholder"><i class="fas fa-spinner fa-pulse"></i><p>Fetching weather for ${cityName}...</p></div>`;
    hideError();

    try {
        const currentUrl = `${BASE_CURRENT}?q=${encodeURIComponent(cityName)}&units=metric&appid=${API_KEY}`;
        const currResp = await fetch(currentUrl);
        if (!currResp.ok) {
            if (currResp.status === 404) showError("City not found! Please enter a valid city");
            else showError("Network issue, please try again");
            return false;
        }
        const weatherData = await currResp.json();
        const lat = weatherData.coord.lat;
        const lon = weatherData.coord.lon;
        const forecastData = await fetchSevenDayForecast(lat, lon);
        renderWeatherUI(weatherData, forecastData);
        return true;
    } catch (err) {
        console.error(err);
        showError("Connection error. Check internet or try again.");
        return false;
    }
}

// Fetch weather by coordinates (for IP-based lat/lon)
async function updateWeatherForCoords(lat, lon) {
    weatherContainer.innerHTML = `<div class="loading-placeholder"><i class="fas fa-spinner fa-pulse"></i><p>Detecting your location via IP...</p></div>`;
    hideError();
    try {
        const url = `${BASE_CURRENT}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error("Weather API error");
        const weatherData = await resp.json();
        const forecastData = await fetchSevenDayForecast(lat, lon);
        renderWeatherUI(weatherData, forecastData);
        return true;
    } catch (err) {
        console.error("Coords weather error", err);
        return false;
    }
}

// IP-based location detection (NO POPUP)
async function detectUserLocationViaIP() {
    weatherContainer.innerHTML = `<div class="loading-placeholder"><i class="fas fa-globe fa-pulse"></i><p>Identifying your location...</p><p style="font-size:12px;">Using IP address (no popup)</p></div>`;
    try {
        // Using free ip-api.com (no API key required, JSON)
        const ipResponse = await fetch('http://ip-api.com/json/');
        const ipData = await ipResponse.json();
        
        if (ipData.status === 'success') {
            const lat = ipData.lat;
            const lon = ipData.lon;
            const city = ipData.city;
            // Optional: you can show city name in loading message
            weatherContainer.innerHTML = `<div class="loading-placeholder"><i class="fas fa-spinner fa-pulse"></i><p>Getting weather for ${city}...</p></div>`;
            const success = await updateWeatherForCoords(lat, lon);
            if (!success) {
                updateWeatherForCity("Islamabad");
            }
        } else {
            // IP detection failed, fallback to default
            updateWeatherForCity("Islamabad");
        }
    } catch (err) {
        console.warn("IP Geolocation error:", err);
        updateWeatherForCity("Islamabad");
    }
}

// Event listeners
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city === "") {
        showError("Please enter a city name");
        return;
    }
    updateWeatherForCity(city);
});

cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const city = cityInput.value.trim();
        if (city) updateWeatherForCity(city);
        else showError("Please enter a city name");
    }
});

// Start the app: IP-based detection (NO POPUP)
detectUserLocationViaIP();

// Update date/time every minute
setInterval(() => {
    const datetimeElem = document.querySelector(".datetime");
    if (datetimeElem && weatherContainer && !weatherContainer.innerHTML.includes("loading")) {
        const newDateTime = getFormattedDateTime();
        datetimeElem.innerHTML = `<i class="far fa-calendar-alt"></i> ${newDateTime}`;
    }
}, 60000);
