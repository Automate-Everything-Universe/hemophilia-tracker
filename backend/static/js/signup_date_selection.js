document.addEventListener('DOMContentLoaded', function () {
    flatpickr("#datetimePickerSignup", {
        enableTime: true,
        dateFormat: "l h:i K", // Monday 03:30 PM
        weekNumbers: true,
        time_24hr: false,
        position: "above",
        onChange: function(selectedDates, dateStr, instance) {
            const datetimePickerBtn = document.getElementById('datetimePickerSignup');
            datetimePickerBtn.innerText = dateStr;

            const addDateTimeBtn = document.getElementById('addDateTimeSignup');
            addDateTimeBtn.classList.remove('hidden');
        }
    });

    const addDateTimeBtn = document.getElementById('addDateTimeSignup');
    const datetimePickerBtn = document.getElementById('datetimePickerSignup');

    if (datetimePickerBtn && addDateTimeBtn) {
        datetimePickerBtn.addEventListener('click', function () {
            addDateTimeBtn.classList.remove('hidden');
        });
        addDateTimeBtn.addEventListener('click', function () {
            addDateTimeSignup();
        });
    } else {
        console.error('Buttons not found'); // Debugging
    }
});

let dates = [];

function addDateTimeSignup() {
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

window.addDateTimeSignup = addDateTimeSignup;

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
}

function removeSignupDate(index) {
    dates.splice(index, 1);
    sortDates();
    updateSignupDateList();
}

function getSignupRefillTimes() {
    return dates;
}

function submitSignupForm(event) {
    event.preventDefault();

    const form = document.getElementById('signupForm');
    const formData = new FormData(form);

    const signupData = {
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        username: formData.get('username'),
        password: formData.get('password'),
        email: formData.get('email'),
        peak_level: formData.get('peak_level'),
        time_elapsed: formData.get('time_elapsed'),
        second_level_measurement: formData.get('second_level_measurement'),
        weekly_infusions: getSignupRefillTimes()
    };

    fetch('/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(signupData)
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(error => {
            alert(`Signup failed: ${error.detail}`);
            // Handle the error response from the server
            throw new Error(`Signup failed: ${error.detail}`);
          });
        }
        return response.json();
      })
      .then(data => {
        alert('Account created');
        console.log('Signup successful:', data);
        window.location.href = '/login'; // Redirect to the login page
      })
      .catch(error => {
        console.error('Error during signup:', error);
      });
      }

// document.getElementById('signupForm').onsubmit = submitSignupForm;
window.submitSignupForm = submitSignupForm;
