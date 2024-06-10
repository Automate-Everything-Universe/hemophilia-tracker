function sortDates() {
    const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const splitTimeString = (timeString) => {
        const [day, time, period] = timeString.split(/[\s:]+/);
        return { day, time, period };
    };

    dates.sort((a, b) => {
        const { day: dayA, time: timeA, period: periodA } = splitTimeString(a);
        const { day: dayB, time: timeB, period: periodB } = splitTimeString(b);

        const [hourA, minuteA] = timeA.split(":").map(Number);
        const [hourB, minuteB] = timeB.split(":").map(Number);

        const totalMinutesA = (dayOrder.indexOf(dayA) * 24 * 60) +
                              ((periodA === "PM" && hourA !== 12 ? hourA + 12 : (periodA === "AM" && hourA === 12 ? 0 : hourA)) * 60) +
                              minuteA;
        const totalMinutesB = (dayOrder.indexOf(dayB) * 24 * 60) +
                              ((periodB === "PM" && hourB !== 12 ? hourB + 12 : (periodB === "AM" && hourB === 12 ? 0 : hourB)) * 60) +
                              minuteB;

        return totalMinutesA - totalMinutesB;
    });
}
