document.addEventListener('DOMContentLoaded', function() {
    const username = document.getElementById('username').value;
    fetchUserDataInputField(username);
});

function fetchUserDataInputField(username) {
    fetch(`/users/${username}/data`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('email').value = data.email;
            document.getElementById('first_name').value = data.first_name;
            document.getElementById('last_name').value = data.last_name;
            document.getElementById('peak_level').value = data.peak_level;
            setInitialDates(data.weekly_infusions);
        })
        .catch(error => console.error('Error fetching user data:', error));
}

function setInitialDates(initialDates) {
    dates = initialDates.split(', ');
    updateSignupDateList();
}

function updateSignupDateList() {
    const selectedDatesDiv = document.getElementById('selectedDatesSignup');
    selectedDatesDiv.innerHTML = '';

    dates.forEach((date, index) => {
        const dateTag = document.createElement('div');
        dateTag.className = 'bg-blue-100 text-blue-800 text-sm font-semibold mr-2 px-2.5 py-0.5 rounded inline-flex items-center';
        dateTag.innerHTML = `
            ${date}
            <button type="button" onclick="removeSignupDate(${index})" class="ml-2 bg-transparent hover:text-red-500 text-red-400 hidden">✖</button>
        `;
        selectedDatesDiv.appendChild(dateTag);
    });
}

function removeSignupDate(index) {
    dates.splice(index, 1);
    updateSignupDateList();
}

document.getElementById('editButton').addEventListener('click', function() {
    document.querySelectorAll('.p-4 input').forEach(function(input) {
        input.removeAttribute('readonly');
        input.classList.replace('text-gray-500', 'text-blue-800');
    });
    document.querySelectorAll('.ml-2').forEach(function(button) {
        button.classList.remove('hidden');
    });
    document.getElementById('saveButton').classList.remove('hidden');
    document.getElementById('cancelButton').classList.remove('hidden');
    document.getElementById('add_event').classList.remove('hidden');
    document.getElementById('editButton').classList.add('hidden');
});

function saveUserData() {
    const userData = {
        email: document.getElementById('email').value,
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        peak_level: parseFloat(document.getElementById('peak_level').value),
        weekly_infusions: dates
    };

    fetch(`/users/${document.getElementById('username').value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        hideInputElements()
    })
    .catch(error => console.error('Error saving user data:', error));
}

function cancelChanges() {
    const username = document.getElementById('username').value;
    fetch(`/users/${username}/data`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('email').value = data.email;
            document.getElementById('first_name').value = data.first_name;
            document.getElementById('last_name').value = data.last_name;
            document.getElementById('peak_level').value = data.peak_level;
            setInitialDates(data.weekly_infusions);
            hideInputElements();
        })
        .catch(error => console.error('Error fetching user data:', error));
}

function hideInputElements() {
        document.querySelectorAll('.p-4 input').forEach(function(input) {
            input.setAttribute('readonly', 'true');
        });
        document.querySelectorAll('.ml-2').forEach(function(button) {
            button.classList.add('hidden');
        });
        document.getElementById('saveButton').classList.add('hidden');
        document.getElementById('add_event').classList.add('hidden');
        document.getElementById('cancelButton').classList.add('hidden');
        document.getElementById('editButton').classList.remove('hidden');
        }

window.addDateTimeSignup = function() {
    const datetimePicker = document.getElementById('datetimePickerSignup');
    if (datetimePicker.value) {
        dates.push(datetimePicker.value);
        sortDates();
        updateSignupDateList();
        datetimePicker._flatpickr.clear();
        datetimePicker.innerText = `New event`;
    }

    const addDateTimeBtn = document.getElementById('addDateTimeSignup');
    if (addDateTimeBtn) {
        addDateTimeBtn.classList.add('hidden');
    }
}
