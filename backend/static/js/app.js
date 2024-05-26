document.addEventListener('DOMContentLoaded', function () {
    fetchDefaultValues();
    document.getElementById('updateButton').addEventListener('click', updateFactorLevels);
});

function fetchDefaultValues() {
    fetch('data/default-values')
        .then(response => response.json())
        .then(data => {
            document.getElementById('initial_percentage').value = data.initial_percentage;
            document.getElementById('decay_time').value = data.decay_time;
            document.getElementById('decay_rate').value = data.decay_rate;
            document.getElementById('current_level').value = data.current_level;
            setInitialDates(data.refill_times); // Use setInitialDates from date_selection.js
            updateFactorLevels(); // Initial chart plot with default values
        })
        .catch(error => console.error('Error fetching default data:', error));
}


function updateFactorLevels() {
    const initialPercentage = document.getElementById('initial_percentage').value;
    const decayTime = document.getElementById('decay_time').value;
    const decayRate = document.getElementById('decay_rate').value;
    const currentLevel = document.getElementById('current_level').value;
    const refillTimes = getRefillTimes();

    fetch('data/update-factor-levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialPercentage, decayTime, decayRate, currentLevel, refillTimes })
    })
    .then(response => response.json())
    .then(data => {
        plotFactorLevelChart(data);
        createDoughnutChart(data);
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

function createDoughnutChart(data) {
    if (doughnutChart) {
        doughnutChart.destroy();
    }

    const currentFactorLevel = data.current_factor_level;
    const factorLevelYValue = currentFactorLevel[1];
    const color = factorLevelYValue >= 40 ? 'rgb(119, 255, 0)' : factorLevelYValue >= 5 ? 'rgb(255, 205, 86)' : 'rgb(255, 99, 132)';

    Chart.register({
        id: 'customTextPlugin',
        beforeDraw: function(chart) {
            const width = chart.width,
                height = chart.height,
                ctx = chart.ctx;

            ctx.restore();
            const fontSize = (height / 4).toFixed(2);
            ctx.font = fontSize + "px sans-serif";
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.fillStyle = "black"; // Ensure text color is set to black

            const text = `${factorLevelYValue.toFixed(1)}%`,
                textX = width / 2,
                textY = height / 2;

            ctx.fillText(text, textX, textY);
            ctx.save();
        }
    });

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
                customTextPlugin: {} // Enable the custom text plugin
            }
        }
    });
}