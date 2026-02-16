// Landing Page function

document.getElementById("searchBtn")?.addEventListener("click", async function() {
    const city = document.getElementById("cityInput").value.trim();

    if (!city) {
        alert("Please enter a city or town.");
        return;
    }

 //geocoding api
 
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city)}&format=json&limit=1`
        );

        const data = await response.json();

        if (data.length === 0) {
            alert("City not found. Please try again");
            return;
        }

        const lat = data[0].lat;
        const lon = data[0].lon;

//redirection to explore page

   window.location.href =
            `explore.html?city=${encodeURIComponent(city)}&lat=${lat}&lon=${lon}`;

    } catch (error) {
        console.error("Error fetching location:", error);
        alert("Something went wrong. Please try again later.");
    }
});



//Explore page function

if (window.location.pathname.includes("explore.html")) {
    const params = new URLSearchParams(window.location.search);
    const city = params.get("city");
    const lat = params.get("lat");
    const lon = params.get("lon");

    const resultsDiv = document.getElementById("results");

   if (city && lat && lon) {
        const cityLowerCase = city.toLowerCase();

        if (cityLowerCase === "hartford" || cityLowerCase === "new york city") {

             if (cityLowerCase === "hartford") {
                resultsDiv.innerHTML = `
                    <h2>Welcome to Hartford, Connecticut</h2>
                    <p><strong>Population:</strong> 120,060</p>
                    <p><strong>Famous Landmarks:</strong> Bushnell Park, Mark Twain House</p>
                    <p><strong>Fun Fact:</strong> Hartford is known as the "Insurance Capital of the World".</p>
                    <hr>
                    <p>For more information, check out the <a href="https://www.hartford.gov/">official Hartford website</a>.</p>
                `;
             } else if (cityLowerCase === "new york city") {
                resultsDiv.innerHTML = `
                    <h2>Welcome to New York City</h2>
                    <p><strong>Population:</strong> 8.3 million (2020)</p>
                    <p><strong>Famous Landmarks:</strong> Statue of Liberty, Times Square, Central Park</p>
                    <p><strong>Fun Fact:</strong> New York City is made up of five boroughs: Manhattan, Brooklyn, Queens, The Bronx, and Staten Island.</p>
                    <hr>
                    <p>For more information, visit the <a href="https://www.nyc.gov/">official NYC website</a>.</p>
                `;
             }
        } else {
            // City information not predefined
            resultsDiv.innerHTML = `
                <p>Information for this city is coming soon. Please check back later.</p>
            `;
        }

    } else {
        // If no city, show the "Explore" links for predefined cities
        resultsDiv.innerHTML = `
            <h2>Explore Predefined Cities</h2>
            <p><a href="explore.html?city=Hartford&lat=41.7637&lon=-72.6851">Hartford, Connecticut</a></p>
            <p><a href="explore.html?city=New York City&lat=40.7128&lon=-74.0060">New York City</a></p>
            <p>Click on a city name above to explore more details.</p>
        `;
    }
} else {
    // If the user hasn't searched or clicked a city link
    resultsDiv.innerHTML = "<p>Please search for a city first.</p>";
}

