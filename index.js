// Global data used by both explore and city pages
// ==========================
const cityData = {
    "hartford": {
        schools: ["Hartford Public High School", "University of Hartford"],
        healthcare: ["Hartford Hospital", "Saint Francis Hospital"],
        transportation: ["CT Transit Bus System", "Union Station"],
        lifestyle: ["Bushnell Park", "Mark Twain House"]
    },
    "new york city": {
        schools: ["Columbia University", "NYU"],
        healthcare: ["Mount Sinai Hospital", "NY Presbyterian Hospital"],
        transportation: ["NYC Subway", "MTA Bus System"],
        lifestyle: ["Central Park", "Broadway"]
    },
    "los angeles": {
        schools: ["UCLA", "USC"],
        healthcare: ["Cedars-Sinai", "UCLA Medical Center"],
        transportation: ["Metro Rail", "LAX Airport"],
        lifestyle: ["Hollywood", "Santa Monica Pier"]
    }
};

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}


function initToggleButtons() {
    document.querySelectorAll(".toggle-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const content = btn.nextElementSibling;
            content.style.display = content.style.display === "none" ? "block" : "none";
        });
    });
}



document.addEventListener("DOMContentLoaded", () => {

    initLandingPage();
    initExplorePage();
    initWishIKnewPage();
    initProfilePage();
    initCityPage();

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
         if (cityData[cityLower]) {
            // Featured city from your cityData object
            resultsDiv.innerHTML = renderCityCategories(cityLower) + 
                                   `<button id="saveLocationBtn">Save This Location</button>`;
            initSaveLocation(city, lat, lon);
            initToggleButtons();
        } else {
            // City not in featured list, fetch Wikipedia info
            await fetchWikipediaSummary(city, lat, lon, resultsDiv);
        }
    })();
}

//city list with no search 
function renderFeaturedCities(container) {
    container.innerHTML = `<h2>Explore Featured Cities</h2>` +
        Object.keys(cityData).map(city => {
            const latLon = {
                "hartford": "41.7637,-72.6851",
                "new york city": "40.7128,-74.0060",
                "los angeles": "34.0522,-118.2437"
            };
            const coords = latLon[city].split(',');
            return `<p><a href="explore.html?city=${encodeURIComponent(city)}&lat=${coords[0]}&lon=${coords[1]}">${capitalize(city)}</a></p>`;
        }).join("") +
        `<p>Click on a city name above to explore more details.</p>`;
}

// wiki search info for non-featured cities
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
 initSaveLocation(city, lat, lon);
    } catch (err) {
        container.innerHTML = "<p>Unable to load city information.</p>";
        console.error(err);
    }
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

function initToggleButtons() {
    document.querySelectorAll(".toggle-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const content = btn.nextElementSibling;
            content.style.display = content.style.display === "none" ? "block" : "none";
        });
    });
}

// Helper: capitalize first letter
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Render city categories (schools, healthcare, lifestyle, etc.)
function renderCityCategories(cityLower) {
    if (!cityData[cityLower]) return "";
    let html = `<h2>${capitalize(cityLower)}</h2>`;
    Object.keys(cityData[cityLower]).forEach(category => {
        html += `
            <div class="category-section">
                <button class="toggle-btn">${capitalize(category)}</button>
                <div class="category-content" style="display:none;">
                    <ul>${cityData[cityLower][category].map(item => `<li>${item}</li>`).join("")}</ul>
                </div>
            </div>
        `;
    });
    return html;
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
    const communityTips = JSON.parse(localStorage.getItem("communityTips") || "[]");

// Update counters
    document.getElementById("savedCount").textContent = savedLocations.length;
    document.getElementById("tipsCount").textContent = communityTips.length;

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

    // Clear all saved locations
    const clearBtn = document.getElementById("clearAllBtn");
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to clear all saved locations?")) {
                localStorage.removeItem("savedLocations");
                initProfilePage(); // Re-render
            }
        });
    }
}

//city page 

function initCityPage() {
    if (!window.location.pathname.includes("city.html")) return;

    const params = new URLSearchParams(window.location.search);
    const city = params.get("city");
    const cityInfoDiv = document.getElementById("cityInfo");
    const breadcrumb = document.getElementById("breadcrumb");
    if (!cityInfoDiv) return;

    if (breadcrumb) {
        breadcrumb.innerHTML = `<a href="index.html">Home</a> &gt; <a href="explore.html">Explore</a> &gt; ${capitalize(city)}`;
    }

    if (!city || !cityData[city.toLowerCase()]) {
        cityInfoDiv.innerHTML = `<h2>${capitalize(city)}</h2><p>Information coming soon.</p>`;
        return;
    }

    const cityLower = city.toLowerCase();
    cityInfoDiv.innerHTML = renderCityCategories(cityLower);
    initToggleButtons();
}