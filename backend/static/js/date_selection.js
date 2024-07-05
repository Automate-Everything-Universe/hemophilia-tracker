document.addEventListener('DOMContentLoaded', function () {
    const datetimePickerBtn = document.getElementById('datetimePicker');
    const addDateTimeBtn = document.getElementById('addDateTime');

    datetimePicker.addEventListener('change', function() {
        if (datetimePickerBtn.value) {
            const dateStr = formatDateTime(datetimePickerBtn.value);
            datetimePickerBtn.dataset.dateStr = dateStr;
            addDateTimeBtn.classList.remove('hidden');
        } else {
        console.error('Buttons not found');
    }
    });
});

let dates = [];

function formatDateTime(value) {
    const date = new Date(value);
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const day = daysOfWeek[date.getDay()];
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${day} ${hours}:${minutes} ${ampm}`;
}

function addDateTime() {
    const datetimePickerBtn = document.getElementById('datetimePicker');
    if (datetimePickerBtn.dataset.dateStr) {
        dates.push(datetimePickerBtn.dataset.dateStr);
        sortDates();
        updateDateList();
        datetimePickerBtn.value = '';
        datetimePickerBtn.dataset.dateStr = '';
    }

    const addDateTimeBtn = document.getElementById('addDateTime');
    if (addDateTimeBtn) {
        addDateTimeBtn.classList.add('hidden');
    }
}

function updateDateList() {
    const selectedDatesDiv = document.getElementById('selectedDates');
    selectedDatesDiv.innerHTML = '';

    dates.forEach((date, index) => {
        const dateTag = document.createElement('div');
        dateTag.className = 'bg-blue-100 text-blue-800 text-sm font-semibold mr-2 px-2.5 py-0.5 rounded inline-flex items-center';
        dateTag.innerHTML = `
            ${date}
            <button onclick="removeDate(${index})" class="ml-2 bg-transparent hover:text-red-500 text-red-400">✖</button>
        `;
        selectedDatesDiv.appendChild(dateTag);
    });
}

function removeDate(index) {
    dates.splice(index, 1);
    sortDates();
    updateDateList();
}

function setInitialDates(initialDates) {
    dates = initialDates;
    sortDates();
    updateDateList();
}

function getRefillTimes() {
    return dates;
}