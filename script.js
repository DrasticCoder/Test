document.addEventListener('DOMContentLoaded', () => {
    const monthDisplay = document.getElementById('month-display');
    const lecturesAttendedInput = document.getElementById('lectures-attended');
    const addAttendanceBtn = document.getElementById('add-attendance-btn');
    const messageArea = document.getElementById('message-area');
    const totalLecturesSpan = document.getElementById('total-lectures');
    const attendedLecturesSpan = document.getElementById('attended-lectures');
    const attendancePercentageSpan = document.getElementById('attendance-percentage');
    const historyList = document.getElementById('history-list');

    const LECTURES_PER_DAY = 5;
    let attendanceData = {};

    function initialize() {
        loadData();
        const today = new Date();
        const currentMonth = today.toLocaleString('default', { month: 'long', year: 'numeric' });
        monthDisplay.textContent = `Month: ${currentMonth}`;
        if (!attendanceData[currentMonth]) {
            attendanceData[currentMonth] = {};
        }
        render();
    }

    function saveData() {
        localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
    }

    function loadData() {
        const data = localStorage.getItem('attendanceData');
        if (data) {
            attendanceData = JSON.parse(data);
        }
    }

    function addAttendance() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            messageArea.textContent = 'Attendance cannot be recorded on weekends.';
            messageArea.className = 'message-error';
            return;
        }

        const currentMonth = today.toLocaleString('default', { month: 'long', year: 'numeric' });
        const dayOfMonth = today.getDate();

        if (attendanceData[currentMonth] && attendanceData[currentMonth][dayOfMonth]) {
            messageArea.textContent = 'Attendance for today has already been recorded.';
            messageArea.className = 'message-error';
            return;
        }

        const attended = parseInt(lecturesAttendedInput.value, 10);
        if (isNaN(attended) || attended < 0 || attended > LECTURES_PER_DAY) {
            messageArea.textContent = `Please enter a number between 0 and ${LECTURES_PER_DAY}.`;
            messageArea.className = 'message-error';
            return;
        }

        if (!attendanceData[currentMonth]) {
            attendanceData[currentMonth] = {};
        }
        attendanceData[currentMonth][dayOfMonth] = attended;

        saveData();
        render();
        lecturesAttendedInput.value = LECTURES_PER_DAY;
        messageArea.textContent = `Attendance for ${today.toLocaleDateString()} recorded successfully.`;
        messageArea.className = 'message-success';
    }

    function calculateSummary(monthData) {
        const monthDataObject = monthData || {};
        const attendedLecturesList = Object.values(monthDataObject);
        const totalAttended = attendedLecturesList.reduce((sum, current) => sum + current, 0);

        const daysRecorded = attendedLecturesList.length;
        const totalConductedLectures = daysRecorded * LECTURES_PER_DAY;

        const percentage = totalConductedLectures > 0 ? (totalAttended / totalConductedLectures) * 100 : 0;

        return { totalLectures: totalConductedLectures, totalAttended, percentage };
    }

    function render() {
        const today = new Date();
        const currentMonth = today.toLocaleString('default', { month: 'long', year: 'numeric' });
        const monthData = attendanceData[currentMonth] || {};

        // Update summary
        const { totalLectures, totalAttended, percentage } = calculateSummary(monthData);
        totalLecturesSpan.textContent = totalLectures;
        attendedLecturesSpan.textContent = totalAttended;
        attendancePercentageSpan.textContent = percentage.toFixed(2);

        // Update message area
        if (percentage >= 75 && percentage < 100) {
            messageArea.textContent = 'You are at 75% or more! Keep it up!';
            messageArea.className = 'message-milestone';
        } else if (percentage === 100) {
            const totalConducted = totalLectures;

            let skippableLectures = 0;
            let tempAttended = totalAttended;

            // Cannot skip if no lectures recorded
            if (totalConducted > 0) {
                while(((tempAttended - 1) / totalConducted) * 100 >= 75) {
                    skippableLectures++;
                    tempAttended--;
                }
            }

            if(skippableLectures > 0){
                 messageArea.textContent = `You are at 100%! You can skip ${skippableLectures} lecture(s) and still be above 75%.`;
                 messageArea.className = 'message-safe';
            } else {
                 messageArea.textContent = 'You are at 100%! You cannot skip any lectures yet to maintain 75% attendance.`;
                 messageArea.className = 'message-safe';
            }

        } else if (percentage < 75 && Object.keys(monthData).length > 0) {
            messageArea.textContent = 'Your attendance is below 75%. Try not to miss lectures.';
            messageArea.className = 'message-warning';
        } else {
            messageArea.textContent = '';
            messageArea.className = '';
        }

        // Update history
        historyList.innerHTML = '';
        const sortedDays = Object.keys(monthData).sort((a, b) => parseInt(a) - parseInt(b));
        for (const day of sortedDays) {
            const li = document.createElement('li');
            const date = new Date(today.getFullYear(), today.getMonth(), parseInt(day)).toLocaleDateString();
            li.textContent = `${date}: Attended ${monthData[day]} out of ${LECTURES_PER_DAY} lectures.`;
            historyList.appendChild(li);
        }
    }

    addAttendanceBtn.addEventListener('click', addAttendance);

    initialize();
});
