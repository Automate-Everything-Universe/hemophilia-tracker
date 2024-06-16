document.addEventListener('DOMContentLoaded', function () {
    fetchMeasurements();
    document.getElementById('addMeasurementBtn').addEventListener('click', submitMeasurementForm);

});

function fetchMeasurements() {
    const username = document.getElementById('username').value;
    fetchWithToken(`/users/${username}/measurements/`)
        .then(response => response.json())
        .then(data => {
            const measurementsList = document.getElementById('measurementsList');
            const noMeasurementsMessage = document.getElementById('noMeasurementsMessage');
            measurementsList.innerHTML = '';
            if (data.length === 0) {
                noMeasurementsMessage.classList.remove('hidden');
            } else {
                noMeasurementsMessage.classList.add('hidden');
                data.forEach(measurement => {
                    const measurementItem = document.createElement('div');
                    measurementItem.className = 'p-4 shadow rounded bg-white';
                    measurementItem.innerHTML = `
                        <div class="mb-4">
                            <label for="measurement_date_${measurement.id}" class="block text-sm font-medium text-gray-700"><strong>Measurement Date:</strong> ${new Date(measurement.measurement_date).toLocaleString()}</label>
                            <label for="halving_time_${measurement.id}" class="block text-sm font-medium text-gray-700"><strong>Factor halving time (hours):</strong> ${measurement.halving_time.toFixed(1)}</label>
                            <label for="peak_level_${measurement.id}" class="block text-sm font-medium text-gray-700"><strong>Peak Factor Level After Infusion (%):</strong> ${measurement.peak_level}</label>
                            <label for="time_elapsed_${measurement.id}" class="block text-sm font-medium text-gray-700"><strong>Time Elapsed Until Factor
                        Level Measurement (hours):</strong> ${measurement.time_elapsed}</label>
                            <label for="second_level_measurement_${measurement.id}" class="block text-sm font-medium text-gray-700"><strong>Factor Level at Time of Measurement (%):</strong> ${measurement.second_level_measurement}</label>
                            <label for="comment_${measurement.id}" class="block text-sm font-medium text-gray-700"><strong>Comment:</strong> ${measurement.comment || ''}</label>
                        </div>
                        <button onclick="deleteMeasurement(${measurement.id})" class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                    `;
                    measurementsList.appendChild(measurementItem);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching measurements:', error);
            const noMeasurementsMessage = document.getElementById('noMeasurementsMessage');
            noMeasurementsMessage.textContent = 'Error fetching measurements. Please try again later.';
            noMeasurementsMessage.classList.remove('hidden');
        });
}


function submitMeasurementForm(event) {
    console.log('Submitting measurement form');
    const username = document.getElementById('username').value;
    const measurementData = {
        measurement_date: document.getElementById('measurement_date').value,
        peak_level: parseFloat(document.getElementById('measurement_peak_level').value),
        time_elapsed: parseFloat(document.getElementById('measurement_time_elapsed').value),
        second_level_measurement: parseFloat(document.getElementById('measurement_second_level_measurement').value),
        comment: document.getElementById('measurement_comment').value
    };

    fetchWithToken(`/users/${username}/measurements/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(measurementData)
    })
    .then(response => response.json())
    .then(data => {
        fetchMeasurements();
        document.getElementById('measurementForm').reset();
    })
    .catch(error => console.error('Error adding measurement:', error));
}

function deleteMeasurement(id) {
    const username = document.getElementById('username').value;
    fetchWithToken(`/users/${username}/measurements/${id}`, {
        method: 'DELETE'
    })
    .then(() => fetchMeasurements())
    .catch(error => console.error('Error deleting measurement:', error));
}
