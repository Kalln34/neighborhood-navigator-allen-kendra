document.getElementById("searchBtn").addEventListener("click", function() {
    const city = document.getElementById("cityInput").value.trim();

    if (city === "") {
        alert("Please enter a city or town.");
        return;
    }

    window.location.href = `explore.html?city=${encodeURIComponent(city)}`;
});