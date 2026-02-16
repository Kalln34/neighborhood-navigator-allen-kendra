document.getElementById("searchBtn").addEventListener("click", function() {
    const city = document.getElementById("cityInput").value.trim();

    if (city === "") {
        alert("Please enter a city or town.");
        return;
    }

    window.location.href = `explore.html?city=${encodeURIComponent(city)}`;
});

if (window.location.pathname.includes(explore.html)) {
    const param = new URLSearchParams(window.location.search);
    const city = URLSearchParams.get("city");

    const resultsDiv = document.getElementById("results");

    if (city) {
        resultsDiv.innerHTML = `<h2>Showing neighborhoods in ${city}</h2>`;
    } else {
        resultsDiv.innerHTML = "<p>Please search for a city first.</p>";
    }
}