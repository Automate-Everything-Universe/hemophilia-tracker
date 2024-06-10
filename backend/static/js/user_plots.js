document.addEventListener('DOMContentLoaded', function () {
    const username = document.getElementById('username').textContent;
    fetchUserData(username);
});

function fetchUserData(username) {
    fetch(`/user-data/${username}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('peak_level').value = data.initialFactorLevel;
            document.getElementById('time_elapsed').value = data.timeElapsedUntilMeasurement;
            document.getElementById('second_level_measurement').value = data.factorMeasuredLevel;
            refillTimes = data.refillTimes;
            updateFactorLevels(refillTimes);
        })
        .catch(error => console.error('Error fetching user data:', error));
}

function updateFactorLevels(refillTimes) {
    const initialFactorLevel = document.getElementById('peak_level').value;
    const timeElapsedUntilMeasurement = document.getElementById('time_elapsed').value;
    const factorMeasuredLevel = document.getElementById('second_level_measurement').value;

    const localTime = new Date();
    const currentTime = localTime.toLocaleString('en-US', {
        weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: true
    });

    fetch('/data/update-factor-levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialFactorLevel, timeElapsedUntilMeasurement, factorMeasuredLevel, refillTimes, currentTime })
    })
    .then(response => response.json())
    .then(data => {
        plotFactorLevelChart(data);
        createOrUpdateDoughnutChart(data);
    })
    .catch(error => console.error('Error updating data:', error));
}

// Include all the plotting functions (plotFactorLevelChart, createOrUpdateDoughnutChart, etc.) from app.js
