const apiKey = 'api_key';
const searchBtn = document.getElementById('search-btn');
const backBtn = document.getElementById('back-btn');
const weatherInfoDiv = document.getElementById('weather-info');
const forecastDiv = document.getElementById('forecast');
const historyDiv = document.getElementById('city-history');
const cityNameDiv = document.getElementById('city-name');

let cityHistory = JSON.parse(localStorage.getItem('cityHistory')) || [];

// Fetch current weather data
const getWeather = async (city) => {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        if (data.cod === 200) {
            displayWeather(data);
            getForecast(data.coord.lat, data.coord.lon);
            addCityToHistory(city);
            backBtn.classList.remove('hidden');
        } else {
            weatherInfoDiv.innerHTML = `<p class="error">${data.message}</p>`;
        }
    } catch (error) {
        console.error("Error fetching weather data: ", error);
    }
};

// Display current weather data
const displayWeather = (data) => {
    weatherInfoDiv.innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <p>Temperature: ${data.main.temp}°C</p>
        <p>Condition: ${data.weather[0].description}</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
        <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
    `;
    cityNameDiv.innerText = data.name;
};

// Fetch 5-day forecast data
const getForecast = async (lat, lon) => {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        console.error("Error fetching forecast data: ", error);
    }
};

// Display 5-day forecast
const displayForecast = (data) => {
    forecastDiv.innerHTML = '';
    const forecastList = data.list.filter(item => item.dt_txt.includes('12:00:00'));
    forecastList.forEach(item => {
        const condition = item.weather[0].main.toLowerCase();
        let backgroundImage = '';
        if (condition.includes('rain')) {
            backgroundImage = 'url("images/rainy.jpg")';
        } else if (condition.includes('cloud')) {
            backgroundImage = 'url("images/cloudy.jpg")';
        } else if (condition.includes('sun')) {
            backgroundImage = 'url("images/sunny.jpg")';
        } else {
            backgroundImage = 'url("images/default.jpg")';
        }

        forecastDiv.innerHTML += `
            <div class="forecast-day" style="background-image: ${backgroundImage};">
                <p>${new Date(item.dt_txt).toLocaleDateString()}</p>
                <p>${item.main.temp}°C</p>
                <p>${item.weather[0].description}</p>
                <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].description}">
            </div>
        `;
    });
};

// Maintain history of cities
const addCityToHistory = (city) => {
    if (!cityHistory.includes(city)) {
        cityHistory.push(city);
        localStorage.setItem('cityHistory', JSON.stringify(cityHistory));
        renderCityHistory();
    }
};

const renderCityHistory = () => {
    historyDiv.innerHTML = '';
    cityHistory.forEach((city, index) => {
        const cityButton = document.createElement('button');
        cityButton.textContent = city;

        // Add event listener to fetch weather for the selected city
        cityButton.addEventListener('click', () => {
            getWeather(city);
        });

        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-btn');
        deleteButton.addEventListener('click', () => {
            deleteCityFromHistory(index);
        });

        // Append city button and delete button
        historyDiv.appendChild(cityButton);
        historyDiv.appendChild(deleteButton);
    });
};

// Function to delete city from history
const deleteCityFromHistory = (index) => {
    cityHistory.splice(index, 1); // Remove the city from history
    localStorage.setItem('cityHistory', JSON.stringify(cityHistory)); // Update local storage
    renderCityHistory(); // Re-render the history
};

// Reset the app to allow entering a new city
backBtn.addEventListener('click', () => {
    weatherInfoDiv.innerHTML = '';
    forecastDiv.innerHTML = '';
    backBtn.classList.add('hidden');
    document.getElementById('city-input').value = '';
    cityNameDiv.innerText = '';
});

// Search button functionality
searchBtn.addEventListener('click', () => {
    const city = document.getElementById('city-input').value.trim();
    if (city) {
        getWeather(city);
    }
});

// Load city history on page load
renderCityHistory();
