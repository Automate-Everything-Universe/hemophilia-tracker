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


function plotFactorLevelChart(data) {
    const hours = data.hours.map(hour => new Date(new Date(data.start_of_week).getTime() + hour * 3600000));
    const trace = {
        x: hours,
        y: data.levels,
        mode: 'lines',
        name: 'Factor Level Over Time',
        marker: { color: 'rgb(75, 192, 192)' }
    };

    const currentFactorLevel = data.current_factor_level;
    const factorLevelXValue = currentFactorLevel[0];
    const factorLevelYValue = currentFactorLevel[1];

    const factorLevelDate = new Date(data.start_of_week);
    factorLevelDate.setTime(factorLevelDate.getTime() + factorLevelXValue * 3600000);

    const factorLevelTrace = {
        x: [factorLevelDate],
        y: [factorLevelYValue],
        mode: 'markers',
        name: `Factor Level (${factorLevelYValue.toFixed(2)}%)`, // Include Y value with two digits in the legend
        text: [`Current Measured Level Marker: ${factorLevelYValue.toFixed(2)}%`], // Tooltip text for the marker
        marker: { color: 'red', size: 10, symbol: 'cross' } // Customize marker appearance
    };

    // Define the maximum Y axis value
    const maxYValue = Math.max(...data.levels);
    const yAxisUpperLimit = maxYValue > 100 ? maxYValue : 100;

    const layout = {
        xaxis: {
            title: 'Time of the Week',
            type: 'date',
            tickformat: '%a %b %d, %H:%M',  // Set custom date format for x-axis ticks
            tickvals: [],  // Array to store tick positions
            ticktext: []  // Array to store tick labels
        },
        yaxis: {
            title: 'Factor Level (%)',
            range: [0, yAxisUpperLimit], // Dynamic setting based on data
            hoverformat: '.2f' // Set hover format to display two decimal places
        }
    };

    // Calculate tick positions and labels for 09:30 for each day of the week
    for (let i = 0; i < 7; i++) {
        const tickTime = new Date(data.start_of_week);
        tickTime.setDate(tickTime.getDate() + i);
        tickTime.setHours(9, 30); // Set hour to 09:30
        layout.xaxis.tickvals.push(tickTime.getTime());
        layout.xaxis.ticktext.push(tickTime.toLocaleString('default', { weekday: 'short', hour: '2-digit', minute: '2-digit' }));
    }
    const config = { responsive: true };

    Plotly.newPlot('factorLevelChart', [trace, factorLevelTrace], layout, {responsive: true});
}

const ctx = document.getElementById('factorLevelDoughnutChart').getContext('2d');
let doughnutChart;

function createOrUpdateDoughnutChart(data) {
    const currentFactorLevel = data.current_factor_level;
    const factorLevelYValue = currentFactorLevel[1];
    const color = factorLevelYValue >= 40 ? 'rgb(34,139,34)' : factorLevelYValue >= 5 ? 'rgb(255, 205, 86)' : 'rgb(255, 99, 132)';
    const textValue = `${factorLevelYValue.toFixed(0)}%`;

    const customTextPlugin = {
        id: 'customTextPlugin',
        beforeDraw: function(chart) {
            const width = chart.width,
                height = chart.height,
                ctx = chart.ctx;

            ctx.restore();
            const fontSize = (height / 5).toFixed(2);
            ctx.font = fontSize + "px sans-serif";
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.fillStyle = doughnutChart.options.plugins.customTextPlugin.color;

            const text = chart.config.options.plugins.customTextPlugin.text,
                textX = width / 2,
                textY = height / 2;

            ctx.clearRect(0, 0, width, height); // Clear previous text
            ctx.fillText(text, textX, textY);
            ctx.save();
        }
    };

    if (doughnutChart) {
        // Update existing chart
        doughnutChart.data.datasets[0].data = [factorLevelYValue, 100 - factorLevelYValue];
        doughnutChart.data.datasets[0].backgroundColor = [color, 'rgb(230, 242, 245)'];
        doughnutChart.options.plugins.customTextPlugin.text = textValue;
        doughnutChart.options.plugins.customTextPlugin.color = color;
        doughnutChart.update();
    } else {
        // Create new chart
        Chart.register(customTextPlugin);

        doughnutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [factorLevelYValue, 100 - factorLevelYValue],
                    backgroundColor: [color, 'rgb(230, 242, 245)'],
                }],
                labels: ['Factor Level', 'Missing Factor']
            },
            options: {
                maintainAspectRatio: true,
                cutout: '70%',
                rotation: 0,
                hoverOffset: 4,
                plugins: {
                    customTextPlugin: {
                        text: textValue // Set initial text
                    }
                }
            }
        });
    }
}