document.addEventListener("DOMContentLoaded", () => {

    initLandingPage();
    initExplorePage();
    initWishIKnewPage();
    initProfilePage();

});

// Landing Page function

function initLandingPage() {
    const searchBtn = document.getElementById("searchBtn");
    if (!searchBtn) return;

    searchBtn.addEventListener("click", async () => {
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
                    alert("City not found. Please try again.");
                    return;
                }

                const lat = data[0].lat;
                const lon = data[0].lon;

                //redirection to explore page
                window.location.href = `explore.html?city=${encodeURIComponent(city)}&lat=${lat}&lon=${lon}`;
            } catch (error) {
                console.error("Error fetching location:", error);
                alert("Something went wrong. Please try again later.");
            }
        });
    }




//Explore page function
function initExplorePage() {
    if (!window.location.pathname.includes("explore.html")) return;

    (async function () {
        const params = new URLSearchParams(window.location.search);
        const city = params.get("city");
        const lat = params.get("lat");
        const lon = params.get("lon");
        const resultsDiv = document.getElementById("results");
    
        if (!resultsDiv) return;

        if (!city) {
            renderFeaturedCities(resultsDiv);
            return;
        }

        const cityLower = city.toLowerCase();

        const featuredCities = {
            "hartford": `
                <h2>Welcome to Hartford, Connecticut</h2>
                <p><strong>Population:</strong> 120,060</p>
                <p><strong>Famous Landmarks:</strong> Bushnell Park, Mark Twain House</p>
                <p><strong>Known For:</strong> Insurance Capital of the World</p>
                <button id="saveLocationBtn">Save This Location</button>
            `,
            "new york city": `
                <h2>Welcome to New York City</h2>
                <p><strong>Population:</strong> 8.3 million (2020)</p>
                <p><strong>Famous Landmarks:</strong> Statue of Liberty, Times Square, Central Park</p>
                <button id="saveLocationBtn">Save This Location</button>
            `,
            "los angeles": `
                <h2>Welcome to Los Angeles, California</h2>
                <p><strong>Population:</strong> 3.9 million (2020)</p>
                <p><strong>Known For:</strong> Hollywood, Beaches, Entertainment Industry</p>
                <button id="saveLocationBtn">Save This Location</button>
            `
        };

        if (featuredCities[cityLower]) {
            resultsDiv.innerHTML = featuredCities[cityLower];
        } else {
            await fetchWikipediaSummary(city, lat, lon, resultsDiv);
        }

        initSaveLocation(city, lat, lon);
    })(); // End of async IIFE
}

    async function fetchWikipediaSummary(city, lat, lon, container) {
    try {
        const response = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city)}`
        );
        const data = await response.json();

        container.innerHTML = `
            <h2>Welcome to ${city}</h2>
            <p>${data.extract || "Information coming soon."}</p>
            <p><strong>Coordinates:</strong> ${lat}, ${lon}</p>
            <button id="saveLocationBtn">Save This Location</button>
        `;
    } catch {
        container.innerHTML = "<p>Unable to load city information.</p>";
    }
}

// default featured cities if user visits explore.html with no search query
function renderFeaturedCities(container) {
    container.innerHTML = `
        <h2>Explore Featured Cities</h2>
        <p><a href="explore.html?city=Hartford&lat=41.7637&lon=-72.6851">Hartford</a></p>
        <p><a href="explore.html?city=New York City&lat=40.7128&lon=-74.0060">New York City</a></p>
        <p><a href="explore.html?city=Los Angeles&lat=34.0522&lon=-118.2437">Los Angeles</a></p>
        <p>Click on a city name above to explore more details.</p>
    `;
}

// Save location function
function initSaveLocation(city, lat, lon) {
    const btn = document.getElementById("saveLocationBtn");
    if (!btn) return;

    btn.addEventListener("click", () => {
        const saved = JSON.parse(localStorage.getItem("savedLocations") || "[]");

        if (saved.some(loc => loc.city.toLowerCase() === city.toLowerCase())) {
            alert("Location already saved.");
            return;
        }

        saved.push({
            city,
            lat,
            lon,
            note: "",
            savedAt: new Date().toLocaleDateString()
        });

        localStorage.setItem("savedLocations", JSON.stringify(saved));
        alert("Location saved!");
    });
}

// Wish I Knew Page

(function() {    
    const tipForm = document.getElementById("tipForm");
    if (!tipForm) return;

        const userTipInput = document.getElementById("userTip");
        const tipCategory = document.getElementById("tipCategory");
        const tipsList = document.getElementById("tipsList");
        const submitMessage = document.getElementById("submitMessage");
        const filterCategory = document.getElementById("filterCategory");

        // Load saved tips from localStorage
        const savedTips = JSON.parse(localStorage.getItem("communityTips") || "[]");
        
        function renderTips(filter = "All") {
        tipsList.innerHTML = "";
        savedTips.forEach((tip, index) => {
            if (filter !== "All" && tip.category !== filter) return;

            const li = document.createElement("li");
            li.className = "tip-card";

            li.innerHTML = `
                <strong>${tip.category}</strong><br>
                <p>${tip.text}</p>
                <button class="delete-btn" data-index="${index}">Delete</button>
            `;
            tipsList.appendChild(li);
        });
    }

        // render tips
        renderTips();

        //form submission
    tipForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const tipText = userTipInput.value.trim();
        const category = tipCategory.value;

        if (!tipText) {
            alert("Please enter a tip before clicking submit");
            return;
        }

        const newTip = { text: tipText, category: category };
        savedTips.push(newTip);
        localStorage.setItem("communityTips", JSON.stringify(savedTips));

        renderTips(filterCategory?.value || "All");
        userTipInput.value = "";
        tipCategory.value = "General";


        if (submitMessage) {
            submitMessage.style.display = "block";
            setTimeout(() => { submitMessage.style.display = "none"; }, 2000);
        }
    });

    //delte option 
     tipsList.addEventListener("click", function(event) {
        if (event.target.classList.contains("delete-btn")) {
            const index = event.target.dataset.index;
            savedTips.splice(index, 1);
            localStorage.setItem("communityTips", JSON.stringify(savedTips));
            renderTips(filterCategory?.value || "All");
        }
    });

    //change filter
     filterCategory?.addEventListener("change", function() {
        renderTips(filterCategory.value);
    });

})();

// profile page
function initProfilePage() {
    if (!window.location.pathname.includes("profile.html")) return;

    const savedLocationsList = document.getElementById("savedLocationsList");
    const savedLocations = JSON.parse(localStorage.getItem("savedLocations") || "[]");

    if (!savedLocationsList) return;

    savedLocationsList.innerHTML = "";

    savedLocations.forEach((loc, index) => {
        const li = document.createElement("li");
        li.className = "location-card";

        li.innerHTML = `
            <strong>${loc.city}</strong> (${loc.lat}, ${loc.lon})<br>
            <p>Note: ${loc.note || "None"}</p>
            <p>Saved on: ${loc.savedAt}</p>
            <button class="delete-btn" data-index="${index}">Delete</button>
        `;
        savedLocationsList.appendChild(li);
    });

    savedLocationsList.addEventListener("click", (event) => {
        if (event.target.classList.contains("delete-btn")) {
            const index = event.target.dataset.index;
            savedLocations.splice(index, 1);
            localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
            initProfilePage(); // Re-render list
        }
    });
}