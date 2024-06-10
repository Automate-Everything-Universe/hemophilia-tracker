function sortDates() {
    const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday","Sunday"];

    dates.sort((a, b) => {
        const [dayA, timeA, periodA] = a.split(/[\s:]+/);
        const [dayB, timeB, periodB] = b.split(/[\s:]+/);
        let timeAandPeriodA = timeA + ":" + periodA;
        let timeBandPeriodB = timeB + ":" + periodB;
        const [hourA, minuteA] = timeAandPeriodA.split(":").map(Number);
        const [hourB, minuteB] = timeBandPeriodB.split(":").map(Number);

        const totalMinutesA = (dayOrder.indexOf(dayA) * 24 * 60) + ((periodA === "PM" && hourA !== 12 ? hourA + 12 : (periodA === "AM" && hourA === 12 ? 0 : hourA)) * 60) + minuteA;
        const totalMinutesB = (dayOrder.indexOf(dayB) * 24 * 60) + ((periodB === "PM" && hourB !== 12 ? hourB + 12 : (periodB === "AM" && hourB === 12 ? 0 : hourB)) * 60) + minuteB;

        return totalMinutesA - totalMinutesB;
    });
}