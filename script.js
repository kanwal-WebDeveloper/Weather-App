const apiKey = "904f939c52f09f09feaec03f43e066bb";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");

async function checkWeather(city) {
    if (!city) return; // if input is empty, do nothing

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&q=${city}&appid=${apiKey}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            // Show error UI
            document.querySelector(".error").style.display = "block";
            document.querySelector(".weather").style.display = "none";
            return;
        }

        const data = await response.json();

        // Hide error and show weather
        document.querySelector(".error").style.display = "none";
        document.querySelector(".weather").style.display = "block";

        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";

        // Weather icon mapping
        const weatherMap = {
            "Clouds": "images/clouds.png",
            "Clear": "images/clear.png",
            "Rain": "images/rain.png",
            "Drizzle": "images/drizzle.png",
            "Mist": "images/mist.png"
        };

        weatherIcon.src = weatherMap[data.weather[0].main] || "images/default.png";

    } catch (error) {
        console.error("Error fetching weather:", error);
        document.querySelector(".error").style.display = "block";
        document.querySelector(".weather").style.display = "none";
    }
}

// Event listeners
searchBtn.addEventListener("click", () => checkWeather(searchBox.value.trim()));
searchBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter") checkWeather(searchBox.value.trim());
});
