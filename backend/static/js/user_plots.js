document.addEventListener('DOMContentLoaded', function () {
    const username = document.getElementById('username').value;
    fetchUserDataForPlot(username);
});

function fetchUserDataForPlot(username) {
    fetch(`/user-data/${username}`)
        .then(response => response.json())
        .then(data => {
            updateFactorLevels(data);
        })
        .catch(error => console.error('Error fetching user data:', error));
}

function updateFactorLevels(data) {
    const localTime = new Date();
    const currentTime = localTime.toLocaleString('en-US', {
        weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: true
    });
    const decayConstant = data.decayConstant;
    const peakLevel = data.peakLevel;
    const refillTimes = data.refillTimes;

    fetch('/data/update-factor-levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decayConstant, peakLevel, refillTimes, currentTime })
    })
    .then(response => response.json())
    .then(data => {
        plotFactorLevelChart(data);
        createOrUpdateDoughnutChart(data);
    })
    .catch(error => console.error('Error updating data:', error));
}

// Include all the plotting functions (plotFactorLevelChart, createOrUpdateDoughnutChart, etc.) from app.js
