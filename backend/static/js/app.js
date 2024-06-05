document.addEventListener('DOMContentLoaded', function () {
    fetchDefaultValues();

    document.getElementById('updateButton').addEventListener('click', updateFactorLevels);
    const datetimePickerBtn = document.getElementById('datetimePicker');

    const addDateTimeBtn = document.getElementById('addDateTime');
    console.log('addDateTimeBtn:', addDateTimeBtn); // Debugging

    if (datetimePickerBtn && addDateTimeBtn) {
        datetimePickerBtn.addEventListener('click', function() {
            addDateTimeBtn.classList.remove('hidden');
        });
    } else {
        console.error('Buttons not found'); // Debugging
    }
});

function fetchDefaultValues() {
    fetch('data/default-values')
        .then(response => response.json())
        .then(data => {
            document.getElementById('initial_percentage').value = data.initial_percentage;
            document.getElementById('decay_time').value = data.decay_time;
            document.getElementById('decay_rate').value = data.decay_rate;
            setInitialDates(data.refill_times);
            updateFactorLevels();
        })
        .catch(error => console.error('Error fetching default data:', error));
}


function updateFactorLevels() {
    const initialPercentage = document.getElementById('initial_percentage').value;
    const decayTime = document.getElementById('decay_time').value;
    const decayRate = document.getElementById('decay_rate').value;
    const refillTimes = getRefillTimes();

    const localTime = new Date();
    const currentTime = localTime.toLocaleString('en-US', {
        weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: true
    });

    fetch('data/update-factor-levels', {
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