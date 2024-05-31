
document.addEventListener('DOMContentLoaded', function () {
    flatpickr("#datetimePickerSignup", {
        enableTime: true,
        dateFormat: "l h:i K", // Monday 03:30 PM
        weekNumbers: true,
        time_24hr: false,
        onChange: function(selectedDates, dateStr, instance) {
            const addDateTimeSignupBtn = document.getElementById('addDateTimeSignup');
            if (dateStr) {
                addDateTimeSignupBtn.classList.remove('hidden');
            } else {
                addDateTimeSignupBtn.classList.add('hidden');
            }
        }
    });

    const datetimePickerSignupBtn = document.getElementById('datetimePickerSignup');
    const addDateTimeSignupBtn = document.getElementById('addDateTimeSignup');

    if (datetimePickerSignupBtn && addDateTimeSignupBtn) {
      datetimePickerSignupBtn.addEventListener('click', function () {
        addDateTimeSignupBtn.classList.remove('hidden');
      });
    } else {
      console.error('Buttons not found');
    }

    // Call addDateTimeSignup after definition
    addDateTimeSignup();

    let signupDates = [];

    function addDateTimeSignup() {
        const datetimePickerSignup = document.getElementById('datetimePickerSignup');
        if (datetimePickerSignup.value) {
            signupDates.push(datetimePickerSignup.value);
            sortSignupDates();
            updateSignupDateList();
            datetimePickerSignup._flatpickr.clear();
        }

        const addDateTimeSignupBtn = document.getElementById('addDateTimeSignup');
        if (addDateTimeSignupBtn) {
            addDateTimeSignupBtn.classList.add('hidden');
        }
    }

    function updateSignupDateList() {
        const selectedDatesDivSignup = document.getElementById('selectedDatesSignup');
        if (!selectedDatesDivSignup) return; // Check for null

        selectedDatesDivSignup.innerHTML = ''; // Clear the existing dates

        signupDates.forEach((date, index) => {
            const dateTag = document.createElement('div');
            dateTag.className = 'bg-blue-100 text-blue-800 text-sm font-semibold mr-2 px-2.5 py-0.5 rounded inline-flex items-center';
            dateTag.innerHTML = `
                ${date}
                <button type="button" onclick="removeSignupDate(${index})" class="ml-2 bg-transparent hover:text-red-500 text-red-400">✖</button>
            `;
            selectedDatesDivSignup.appendChild(dateTag);
        });
    }

    function removeSignupDate(index) {
        signupDates.splice(index, 1);
        sortSignupDates();
        updateSignupDateList();
    }

    function getSignupRefillTimes() {
        return signupDates;
    }

    function sortSignupDates() {
        const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

        signupDates.sort((a, b) => {
            const [dayA, timeA, periodA] = a.split(/[\s:]+/);
            const [dayB, timeB, periodB] = b.split(/[\s:]+/);
            const timeAandPeriodA = timeA + ":" + periodA;
            const timeBandPeriodB = timeB + ":" + periodB;
            const [hourA, minuteA] = timeAandPeriodA.split(":").map(Number);
            const [hourB, minuteB] = timeBandPeriodB.split(":").map(Number);

            const totalMinutesA = (dayOrder.indexOf(dayA) * 24 * 60) + ((periodA === "PM" && hourA !== 12 ? hourA + 12 : (periodA === "AM" && hourA === 12 ? 0 : hourA)) * 60) + minuteA;
            const totalMinutesB = (dayOrder.indexOf(dayB) * 24 * 60) + ((periodB === "PM" && hourB !== 12 ? hourB + 12 : (periodB === "AM" && hourB === 12 ? 0 : hourB)) * 60) + minuteB;

            return totalMinutesA - totalMinutesB;
        });
    }
});