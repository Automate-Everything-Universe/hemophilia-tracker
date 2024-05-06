document.addEventListener('DOMContentLoaded', function () {
    try {
        fetch('/data/factor-levels')  // Ensure this URL matches your FastAPI endpoint path
            .then(response => response.json())
            .then(data => {

                const hours = data.hours.map(hour => new Date(new Date(data.start_of_week).getTime() + hour * 3600000));
                const trace = {
                    x: hours,
                    y: data.levels,
                    mode: 'lines',  // Set line mode for the chart
                    name: 'Factor VIII Level Over Time',
                    marker: { color: 'rgb(75, 192, 192)' } // Set line color
                };

                const currentFactorLevel = data.current_factor_level;
                const factorLevelXValue = currentFactorLevel[0];
                const factorLevelYValue = currentFactorLevel[1];

                // Convert hour of the week to a corresponding date
                const factorLevelDate = new Date(data.start_of_week);
                factorLevelDate.setTime(factorLevelDate.getTime() + factorLevelXValue * 3600000);

                const factorLevelTrace = {
                    x: [factorLevelDate],
                    y: [factorLevelYValue],
                    mode: 'markers',
                    name: `Factor Level (${factorLevelYValue.toFixed(2)}%)`, // Include Y value with two digits in the legend
                    text: [`Factor Level: ${factorLevelYValue.toFixed(2)}%`], // Tooltip text for the marker
                    marker: { color: 'red', size: 10, symbol: 'cross' } // Customize marker appearance
                };

                const layout = {
                    xaxis: {
                        title: 'Time of the Week',
                        type: 'date',
                        tickformat: '%a %b %d, %H:%M',  // Set custom date format for x-axis ticks
                        tickvals: [],  // Array to store tick positions
                        ticktext: []  // Array to store tick labels
                    },
                    yaxis: {
                        title: 'Factor VIII (%)',
                        range: [0, Math.max(...data.levels) + (Math.max(...data.levels) * 0.1)],  // Set y-axis range with 10% buffer
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

                const config = { responsive: true };  // Enable responsiveness

                Plotly.newPlot('factorLevelChart', [trace, factorLevelTrace], layout, config);
            });
    } catch (error) {
        console.error('Error fetching data:', error);
        // Handle error gracefully, e.g., display an error message to the user
    }
});
