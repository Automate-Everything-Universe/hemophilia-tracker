function plotPlotlyFactorLevelChart(data) {
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
        name: `Factor Level (${factorLevelYValue.toFixed(2)}%)`,
        text: [`Current Measured Level Marker: ${factorLevelYValue.toFixed(4)}%`],
        marker: { color: 'red', size: 10, symbol: 'cross' }
    };
    const maxYValue = Math.max(...data.levels);
    const yAxisUpperLimit = maxYValue > 100 ? maxYValue : 100;

    const layout = {
        xaxis: {
            title: 'Time of the Week',
            type: 'date',
            tickformat: '%a %b %d, %H:%M',
            tickvals: [],
            ticktext: []
        },
        yaxis: {
            title: 'Factor Level (%)',
            range: [0, yAxisUpperLimit],
            hoverformat: '.2f'
        }
    };

    for (let i = 0; i < 7; i++) {
        const tickTime = new Date(data.start_of_week);
        tickTime.setDate(tickTime.getDate() + i);
        tickTime.setHours(9, 30);
        layout.xaxis.tickvals.push(tickTime.getTime());
        layout.xaxis.ticktext.push(tickTime.toLocaleString('default', { weekday: 'short', hour: '2-digit', minute: '2-digit' }));
    }
    const config = { responsive: true };

    Plotly.newPlot('factorLevelChart', [trace, factorLevelTrace], layout, config);
}

const ctx = document.getElementById('factorLevelDoughnutChart').getContext('2d');
let doughnutChart;

const customTextPlugin = {
    id: 'customTextPlugin',
    beforeDraw: function(chart) {
        if (chart.config.type !== 'doughnut') {
            return;
        }
        const width = chart.width,
            height = chart.height,
            ctx = chart.ctx;

        ctx.restore();
        const fontSize = (height / 5).toFixed(2);
        ctx.font = fontSize + "px sans-serif";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = chart.config.options.plugins.customTextPlugin.color;

        const text = chart.config.options.plugins.customTextPlugin.text,
            textX = width / 2,
            textY = height / 2;

        ctx.clearRect(0, 0, width, height);
        ctx.fillText(text, textX, textY);
        ctx.save();
    }
};

function createOrUpdateDoughnutChart(data) {
    const currentFactorLevel = data.current_factor_level;
    const factorLevelYValue = currentFactorLevel[1];
    const color = factorLevelYValue >= 40 ? 'rgb(34,139,34)' : factorLevelYValue >= 5 ? 'rgb(255, 205, 86)' : 'rgb(255, 99, 132)';
    const textValue = `${factorLevelYValue.toFixed(0)}%`;

    if (doughnutChart) {
        doughnutChart.data.datasets[0].data = [factorLevelYValue, 100 - factorLevelYValue];
        doughnutChart.data.datasets[0].backgroundColor = [color, 'rgb(230, 242, 245)'];
        doughnutChart.options.plugins.customTextPlugin.text = textValue;
        doughnutChart.options.plugins.customTextPlugin.color = color;
        doughnutChart.update();
    } else {
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
                        text: textValue,
                        color: color
                    }
                }
            }
        });
    }
}
const lineCtx = document.getElementById('factorLevelCurveChart').getContext('2d');
let factorLevelChart;

function plotNewFactorLevelChart(data) {
    const hours = data.hours.map(hour => new Date(new Date(data.start_of_week).getTime() + hour * 3600000));
    const levels = data.levels;
    const factorLevelXValue = new Date(new Date(data.start_of_week).getTime() + data.current_factor_level[0] * 3600000);
    const factorLevelYValue = data.current_factor_level[1];

    if (factorLevelChart) {
        factorLevelChart.destroy();
    }

    factorLevelChart = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [{
                label: 'Factor Level Over Time',
                data: levels,
                borderColor: 'rgb(75, 192, 192)',
                fill: false,
                lineTension: 0.1,
                 pointStyle: false,
            },
            {
                label: `Current Factor Level (${factorLevelYValue.toFixed(2)}%)`,
                data: [{ x: factorLevelXValue, y: factorLevelYValue }],
                borderColor: 'red',
                backgroundColor: 'red',
                fill: false,
                pointRadius: 20,
                pointStyle: 'crossRot',
                showLine: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour',
                        tooltipFormat: 'PP HH:mm'
                    },
                    title: {
                        display: true,
                        text: 'Time of the Week'
                    },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 7,
                        major: {
                            enabled: true
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Factor Level (%)'
                    },
                    min: 0,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: window.innerWidth < 768 ? 'bottom' : 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toFixed(2) + '%';
                            }
                            return label;
                        }
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            }
        }
    });
}
