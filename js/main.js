// ----------All Variables---------- //
const searchInput = document.getElementById('searchInput');
const locationBtn = document.getElementById('locationBtn');
const forecastList = Array.from(document.querySelectorAll('.forecast'));
const locationList = document.getElementById('locationList');
// --------------------------------- //


// ----------Day name Function---------- //
// returns full date name
function getDayName(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(date);
}
// ------------------------------------- //


// ----------User Location Function---------- //
// used to get the forecast of the user's current location
function currentLocation() {
    if (!navigator.geolocation) {
        console.error("Geolocation is not supported by your browser.");
        alert("Geolocation is not supported by your browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const query = `${latitude},${longitude}`;
            await getForecast(query);
        },
        (error) => {
            console.error("Failed to get your location:", error.message);
            alert("Could not fetch your location. Please allow location access and try again.");
        }
    );
}

locationBtn.addEventListener('click', currentLocation);
// ------------------------------------------ //


// ----------Search Function---------- //
// searches for all matching locations and displays them
async function searchLocations(query) {
    const url = `https://api.weatherapi.com/v1/search.json?key=fffd283a94fd47abb4c191456241512&q=${query}&days=3&aqi=no&alerts=no`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const locations = await response.json();
        locationList.innerHTML = ``;
        // Iterate over each matching location and fetch forecast details
        for (const location of locations) {
            let locationName = location?.name || 'Unknown location';
            let region = location?.region || 'Unknown region';
            let country = location?.country || 'Unknown country';
            locationList.innerHTML += `<option>${locationName}, ${region}, ${country}</option>`
        }

    } catch (error) {
        console.error('Failed to fetch location data:', error.message);
    }
}

//gets a single location's forecast
async function getForecast(query) {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=fffd283a94fd47abb4c191456241512&q=${query}&days=3&aqi=no&alerts=no`;
    try {
        const response = await fetch(url);
        if (!response.ok || response.status === 400) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        DisplayData(data);
    } catch (error) {
        console.error('Failed to fetch location data:', error);
    }
}

searchInput.addEventListener('keyup', (e) => {
    if (e.target.value != '')
        searchLocations(e.target.value);
})

locationList.addEventListener('click', (e) => {
    getForecast(e.target.innerText);
})
// ----------------------------------- //


// ----------Display Function---------- //
//displays the forecast in the html cards
function DisplayData(data) {
    const locationName = data.location?.name || 'Unknown location';
    const region = data.location?.region || 'Unknown region';
    const country = data.location?.country || 'Unknown country';

    data.forecast.forecastday.forEach((forecast, index) => {
        const date = forecast.date || 'Unknown date';
        const dayName = getDayName(date);

        if (index === 0) {
            const avgTemp = forecast.day?.avgtemp_c + ' °C' || 'Unknown temperature';
            const conditionText = forecast.day?.condition?.text || 'Unknown condition';
            const conditionIcon = forecast.day?.condition?.icon || 'No icon';
            const precipitation = forecast.day?.totalprecip_mm || 0;
            const windSpeed = forecast.day?.maxwind_kph || 0;
            const windDirection = forecast.hour.map(hour => hour.wind_dir)[0] || 'Unknown direction';

            forecastList[index].innerHTML =
                `   <div class="forecast-header text-center d-flex justify-content-center">
                        <div class="day px-2">${dayName}</div>
                    </div>
                    <div class="forecast-content text-center text-start py-3 d-flex flex-column">
                        <div class="location">${locationName}, ${region}, ${country}</div>
                        <div class="temp">
                            <div class="number">${avgTemp}</div>
                            <div class="forecast-icon ">
                                <img src="https:${conditionIcon}" alt="" width="90">
                            </div>
                        </div>
                        <div class="conditions text-center">
                            <p>${conditionText}</p>
                            <span><img src="./images/icon-umberella.png" alt="">${precipitation} mm</span>
                            <span><img src="./images/icon-wind.png" alt="">${windSpeed} km/h</span>
                            <span><img src="./images/icon-compass.png" alt="">${windDirection}</span>
                        </div>
                    </div>
                `

        } else {
            const conditionText = forecast.day?.condition?.text || 'Unknown condition';
            const conditionIcon = forecast.day?.condition?.icon || 'No icon';
            const maxTemp = forecast.day?.maxtemp_c + ' °C' || 'Unknown high temperature';
            const minTemp = forecast.day?.mintemp_c + ' °C' || 'Unknown low temperature';


            forecastList[index].innerHTML =
                `   <div class="forecast-header text-center">
                        <div class="day">${dayName}</div>
                    </div>
                    <div class="forecast-content text-center py-3">
                        <div class="forecast-icon">
                            <img src="https:${conditionIcon}" alt="" width="48">
                        </div>
                        <div class="temp">${maxTemp}</div>
                        <p>${minTemp}</p>
                        <p class="conditions">${conditionText}</p>
                    </div>`
        }
    });
}
// ------------------------------------ //
//default forecast
getForecast('alexandria');