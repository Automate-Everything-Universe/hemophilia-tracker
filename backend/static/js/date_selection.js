document.addEventListener('DOMContentLoaded', function () {
    flatpickr("#datetimePicker", {
        enableTime: true,
        dateFormat: "l h:i K", // Monday 03:30 PM
        weekNumbers: true,
        time_24hr: false
    });
});

let dates = [];

function addDateTime() {
    const datetimePicker = document.getElementById('datetimePicker');
    if (datetimePicker.value) {
        dates.push(datetimePicker.value);
        sortDates();
        updateDateList();
        datetimePicker._flatpickr.clear();
    }

    const addDateTimeBtn = document.getElementById('addDateTime');
    if (addDateTimeBtn) {
        addDateTimeBtn.classList.add('hidden');
    }
}

function updateDateList() {
    const selectedDatesDiv = document.getElementById('selectedDates');
    selectedDatesDiv.innerHTML = ''; // Clear the existing dates

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

