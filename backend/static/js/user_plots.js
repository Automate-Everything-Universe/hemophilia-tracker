document.addEventListener('DOMContentLoaded', function () {
    const username = document.getElementById('username').textContent;
    fetchUserData(username);
});

function fetchUserData(username) {
    fetch(`/user-data/${username}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('peak_level').value = data.initialPercentage;
            document.getElementById('time_elapsed').value = data.decayTime;
            document.getElementById('second_level_measurement').value = data.decayRate;
            refillTimes = data.refillTimes;
            updateFactorLevels(refillTimes);
        })
        .catch(error => console.error('Error fetching user data:', error));
}

function updateFactorLevels(refillTimes) {
    const initialPercentage = document.getElementById('peak_level').value;
    const decayTime = document.getElementById('time_elapsed').value;
    const decayRate = document.getElementById('second_level_measurement').value;

    const localTime = new Date();
    const currentTime = localTime.toLocaleString('en-US', {
        weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: true
    });

    fetch('/data/update-factor-levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialPercentage, decayTime, decayRate, refillTimes, currentTime })
    })
    .then(response => response.json())
    .then(data => {
        plotFactorLevelChart(data);
        createOrUpdateDoughnutChart(data);
    })
    .catch(error => console.error('Error updating data:', error));
}

// Include all the plotting functions (plotFactorLevelChart, createOrUpdateDoughnutChart, etc.) from app.js
