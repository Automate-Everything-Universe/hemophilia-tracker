document.addEventListener('DOMContentLoaded', function() {
    const username = document.getElementById('username').value;
    fetchUserData(username);
    setEditButtonHandler();
    setSaveButtonHandler();
    setCancelButtonHandler();
    setAddDateTimeHandler();
});

function fetchUserData(username) {
    fetchWithToken(`/users/${username}/data`)
        .then(checkResponseStatus)
        .then(response => response.json())
        .then(setUserData)
        .catch(handleError);
}

function checkResponseStatus(response) {
    if (!response.ok) {
        if (response.status === 401) {
            logout();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
}

function setUserData(data) {
    document.getElementById('email').value = data.email;
    document.getElementById('first_name').value = data.first_name;
    document.getElementById('last_name').value = data.last_name;
    document.getElementById('peak_level').value = data.peak_level;
    setInitialDates(data.weekly_infusions);
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
            <button type="button" onclick="removeSignupDate(${index})" class="ml-2 bg-transparent hover:text-red-500 text-red-400">✖</button>
        `;
        selectedDatesDiv.appendChild(dateTag);
    });

    if (!isEditMode()) {
        document.querySelectorAll('.ml-2').forEach(showElement);
    } else {
        document.querySelectorAll('.ml-2').forEach(hideElement);
    }
}

function removeSignupDate(index) {
    dates.splice(index, 1);
    updateSignupDateList();
}

function saveUserData() {
    const userData = {
        email: document.getElementById('email').value,
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        peak_level: parseFloat(document.getElementById('peak_level').value),
        weekly_infusions: dates
    };

    fetchWithToken(`/users/${document.getElementById('username').value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(() => {
        hideInputElements();
        window.location.reload();
    })
    .catch(handleError);
}

function cancelChanges() {
    const username = document.getElementById('username').value;
    fetchUserData(username);
    hideInputElements();
}

function hideInputElements() {
    document.querySelectorAll('.p-4 input').forEach(setInputReadonly);
    document.querySelectorAll('.ml-2').forEach(hideElement);
    hideElement(document.getElementById('saveButton'));
    hideElement(document.getElementById('add_event'));
    hideElement(document.getElementById('cancelButton'));
    showElement(document.getElementById('editButton'));
}

function setInputReadonly(input) {
    input.setAttribute('readonly', 'true');
    input.classList.replace('text-blue-800', 'text-gray-500');
}

function hideElement(element) {
    element.classList.add('hidden');
}

function showElement(element) {
    element.classList.remove('hidden');
}

function addDateTimeSignup() {
    const datetimePicker = document.getElementById('datetimePickerSignup');
    if (datetimePicker.value) {
        dates.push(datetimePicker.value);
        sortDates();
        updateSignupDateList();
        datetimePicker._flatpickr.clear();
        datetimePicker.innerText = `New event`;
    }

    hideElement(document.getElementById('addDateTimeSignup'));
}

function setEditButtonHandler() {
    document.getElementById('editButton').addEventListener('click', function() {
        document.querySelectorAll('.p-4 input').forEach(makeInputEditable);
        document.querySelectorAll('.ml-2').forEach(showElement);
        showElement(document.getElementById('saveButton'));
        showElement(document.getElementById('cancelButton'));
        showElement(document.getElementById('deleteButton'));
        showElement(document.getElementById('add_event'));
        hideElement(document.getElementById('editButton'));
    });
}

function makeInputEditable(input) {
    input.removeAttribute('readonly');
    input.classList.replace('text-gray-500', 'text-blue-800');
}

function setSaveButtonHandler() {
    document.getElementById('saveButton').addEventListener('click', saveUserData);
}

function setCancelButtonHandler() {
    document.getElementById('cancelButton').addEventListener('click', cancelChanges);
}

function setAddDateTimeHandler() {
    document.getElementById('addDateTimeSignup').addEventListener('click', addDateTimeSignup);
}

function handleError(error) {
    console.error('Error:', error);
}

function isEditMode() {
    return !document.getElementById('editButton').classList.contains('hidden');
}
