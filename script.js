


// ДАННЫЕ

let homeworkList = JSON.parse(localStorage.getItem("homeworkList")) || [];
let trashHomework = JSON.parse(localStorage.getItem("trashHomework")) || [];
let trashLessons = JSON.parse(localStorage.getItem("trashLessons")) || [];


// СОХРАНЕНИЕ

function saveData() {
    localStorage.setItem("homeworkList", JSON.stringify(homeworkList));
    localStorage.setItem("trashHomework", JSON.stringify(trashHomework));
    localStorage.setItem("trashLessons", JSON.stringify(trashLessons));
}


// ДОМАШКА

function showHomework() {

    let homework = document.getElementById("homework");

    // Если домашка уже открыта — закрываем
    if (
        homework.innerHTML !== "" &&
        homework.innerHTML.includes("📋 Мои домашние задания")
    ) {
        homework.innerHTML = "";
        return;
    }

    showHomeworkList();
}


// ПОКАЗ ДОМАШКИ

function showHomeworkList() {
    let homework = document.getElementById("homework");

    homework.innerHTML = `
        <h2>📋 Мои домашние задания</h2>
    `;

    if (homeworkList.length === 0) {
        homework.innerHTML += `
            <p>Пока заданий нет.</p>
        `;
    } else {

        for (let i = 0; i < homeworkList.length; i++) {

            let item = homeworkList[i];

            homework.innerHTML += `
                <div class="homework-card ${item.completed ? "completed" : ""}">

                    <h3>📚 Предмет</h3>
                    <p>${item.subject}</p>

                    <h3>📝 Что нужно сделать</h3>
                    <p>${item.task}</p>

                    <h3>📌 Статус</h3>
                    <p>
                        ${item.completed ? "✅ Выполнено" : "⏳ Не выполнено"}
                    </p>
                    ${item.deadline ? `
    <h3>⏰ Дедлайн</h3>
    <p>${formatDeadline(item.deadline)}</p>
    <p>${getDeadlineStatus(item.deadline, item.completed)}</p>
` : ""}

                    <button
                        class="delete-button"
                        onclick="deleteHomework(${i})">
                        🗑️ Удалить
                    </button>

                    <button
                        class="complete-button"
                        onclick="toggleHomework(${i})">
                        ${item.completed ? "↩️ Не выполнено" : "✅ Выполнено"}
                    </button>

                </div>
            `;
        }
    }

    homework.innerHTML += `
        <br>

        <button onclick="openAddHomework()">
            ➕ Добавить ещё
        </button>
    `;
}


// ДОБАВЛЕНИЕ

function openAddHomework() {

    let homework = document.getElementById("homework");

    homework.innerHTML = `
        <h2>➕ Добавить домашку</h2>

        <input id="subject" placeholder="Предмет">

        <br><br>

        <input id="task" placeholder="Что нужно сделать?">

        <br><br>

        <label>⏰ Дедлайн:</label>
        <br><br>

        <input id="deadline" type="datetime-local">

        <br><br>

        <button onclick="saveHomework()">
            💾 Сохранить
        </button>

        <button onclick="showHomeworkList()">
            ❌ Отмена
        </button>
    `;
}


// СОХРАНЕНИЕ ДОМАШКИ

function saveHomework() {

    let subject = document.getElementById("subject").value;
    let task = document.getElementById("task").value;
    let deadline = document.getElementById("deadline").value;

    if (!subject || !task) {
        alert("Заполни предмет и задание.");
        return;
    }

    homeworkList.push({
        subject: subject,
        task: task,
        deadline: deadline,
        completed: false
    });

    saveData();

    showHomeworkList();
}


// УДАЛЕНИЕ

function deleteHomework(index) {

    let item = homeworkList[index];

    if (!item) {
        return;
    }

    trashHomework.push(item);

    homeworkList.splice(index, 1);

    saveData();

    showHomeworkList();
}


// ВЫПОЛНЕНИЕ

function toggleHomework(index) {

    homeworkList[index].completed =
        !homeworkList[index].completed;

    saveData();

    showHomeworkList();
}


// КОРЗИНА

// ====================
// КОРЗИНА
// ====================

function showTrash() {

    let homework = document.getElementById("homework");

    // Если корзина уже открыта — закрываем её
    if (
        homework.innerHTML !== "" &&
        homework.innerHTML.includes("🗑️ Корзина")
    ) {
        homework.innerHTML = "";
        return;
    }

    renderTrash();
}


// ====================
// ОБНОВЛЕНИЕ КОРЗИНЫ
// ====================

function renderTrash() {

    let homework = document.getElementById("homework");

    homework.innerHTML = `
        <h2>🗑️ Корзина</h2>

        <h3>📋 Домашка</h3>
    `;

    if (trashHomework.length === 0) {

        homework.innerHTML += `
            <p>Домашка: корзина пуста.</p>
        `;

    } else {

        for (let i = 0; i < trashHomework.length; i++) {

            let item = trashHomework[i];

            homework.innerHTML += `
                <div class="homework-card">

                    <b>Предмет</b>
                    <p>${item.subject}</p>

                    <b>Что нужно сделать</b>
                    <p>${item.task}</p>

                    <button onclick="restoreHomework(${i})">
                        ↩️ Восстановить
                    </button>

                </div>
            `;
        }

        homework.innerHTML += `
            <button onclick="clearHomeworkTrash()">
                🧹 Очистить домашку
            </button>
        `;
    }

    homework.innerHTML += `
        <hr>

        <h3>📚 Уроки</h3>
    `;

    if (trashLessons.length === 0) {

        homework.innerHTML += `
            <p>Уроки: корзина пуста.</p>
        `;

    } else {

        for (let i = 0; i < trashLessons.length; i++) {

            let item = trashLessons[i];

            homework.innerHTML += `
                <div class="homework-card">

                    <b>День</b>
                    <p>${item.day}</p>

                    <b>Урок</b>
                    <p>
                        ${item.lesson.number}.
                        ${lessonTimes[item.lesson.number - 1]}
                        — ${item.lesson.lesson}
                    </p>

                    <button onclick="restoreLesson(${i})">
                        ↩️ Восстановить
                    </button>

                </div>
            `;
        }

        homework.innerHTML += `
            <button onclick="clearLessonTrash()">
                🧹 Очистить уроки
            </button>
        `;
    }
        homework.innerHTML += `
        <hr>

        <h3>📝 Экзамены</h3>
    `;

    if (trashExams.length === 0) {

        homework.innerHTML += `
            <p>Экзамены: корзина пуста.</p>
        `;

    } else {

        for (let i = 0; i < trashExams.length; i++) {

            let exam = trashExams[i];

            homework.innerHTML += `
                <div class="homework-card">

                    <b>Предмет</b>
                    <p>${exam.subject}</p>

                    <b>Дата экзамена</b>
                    <p>${formatExamDate(exam.date)}</p>

                    <button onclick="restoreExam(${i})">
                        ↩️ Восстановить
                    </button>

                </div>
            `;
        }

        homework.innerHTML += `
            <button onclick="clearExamTrash()">
                🧹 Очистить экзамены
            </button>
        `;
    }
}


// ВОССТАНОВЛЕНИЕ

function restoreHomework(index) {

    let item = trashHomework[index];

    if (!item) {
        return;
    }

    homeworkList.push(item);

    trashHomework.splice(index, 1);

    saveData();

    renderTrash();
}
function restoreLesson(index) {

    let item = trashLessons[index];

    if (!item) {
        return;
    }

    let alreadyExists = schedule[item.day].some(
        lesson => lesson.number === item.lesson.number
    );

    if (alreadyExists) {

        alert(
            "Нельзя восстановить урок №" +
            item.lesson.number +
            ", потому что это время уже занято в " +
            item.day + "."
        );

        return;
    }

    schedule[item.day].push(item.lesson);

    schedule[item.day].sort(
        (a, b) => a.number - b.number
    );

    trashLessons.splice(index, 1);

    saveSchedule();
    saveData();

    // Корзина тоже остаётся открытой
   renderTrash();
}





// ====================
// РАСПИСАНИЕ
// ====================

let schedule = JSON.parse(localStorage.getItem("schedule")) || {
    "Понедельник": [],
    "Вторник": [],
    "Среда": [],
    "Четверг": [],
    "Пятница": []
};


// СОХРАНЕНИЕ РАСПИСАНИЯ

function saveSchedule() {
    localStorage.setItem("schedule", JSON.stringify(schedule));
}


// ПОКАЗ / ЗАКРЫТИЕ РАСПИСАНИЯ

// ====================
// ВРЕМЯ УРОКОВ
// ====================
// ====================
// ФОРМАТ ДЕДЛАЙНА
// ====================

function formatDeadline(deadline) {

    let date = new Date(deadline);

    if (isNaN(date.getTime())) {
        return "Не указан";
    }

    return date.toLocaleString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}
function getDeadlineStatus(deadline, completed) {

    if (!deadline) {
        return "";
    }

    if (completed) {
        return "✅ Задание выполнено";
    }

    let now = new Date();
    let date = new Date(deadline);

    let difference = date - now;

    if (difference < 0) {
        return "🔴 Дедлайн прошёл";
    }

    let minutes = Math.floor(difference / 60000);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);

    if (days > 1) {
        return `🟢 Осталось ${days} дн.`;
    }

    if (days === 1) {
        return "🟡 Остался 1 день";
    }

    if (hours > 1) {
        return `🟠 Осталось ${hours} ч.`;
    }

    if (hours === 1) {
        return "🔴 Остался 1 час";
    }

    return `🔴 Осталось ${minutes} мин.`;
}
const lessonTimes = [
    "8:30 - 9:15",
    "9:15 - 10:00",
    "10:15 - 11:00",
    "11:00 - 11:45",
    "12:05 - 12:50",
    "12:50 - 13:35",
    "13:45 - 14:30",
    "14:30 - 15:15"
];


// ====================
// ПОКАЗ РАСПИСАНИЯ
// ====================

function showSchedule() {

    let homework = document.getElementById("homework");

    // Если расписание уже открыто — закрываем
    if (
        homework.innerHTML !== "" &&
        homework.innerHTML.includes("📅 Моё расписание")
    ) {
        homework.innerHTML = "";
        return;
    }

    renderSchedule();
}
function renderSchedule() {

    let homework = document.getElementById("homework");

    homework.innerHTML = `
        <h2>📅 Моё расписание</h2>
    `;

    for (let day in schedule) {

        homework.innerHTML += `
            <div class="homework-card">

                <h3>📚 ${day}</h3>
        `;

        if (schedule[day].length === 0) {

            homework.innerHTML += `
                <p>Уроков пока нет.</p>
            `;

        } else {

            for (let i = 0; i < schedule[day].length; i++) {

                let item = schedule[day][i];

                homework.innerHTML += `
                    <p>
                        <b>
                            ${item.number}. 
                            ${lessonTimes[item.number - 1]}
                            — ${item.lesson}
                        </b>

                        <button
                            class="delete-button"
                            onclick="deleteLesson('${day}', ${i})">
                            🗑️ Удалить
                        </button>
                    </p>
                `;
            }
        }

        homework.innerHTML += `
                <button onclick="addLesson('${day}')">
                    ➕ Добавить урок
                </button>

            </div>
        `;
    }
}

      
    



// ====================
// ДОБАВЛЕНИЕ УРОКА
// ====================

function addLesson(day) {

    let number = prompt(
        "Какой номер урока добавить?\nВведи число от 1 до 8."
    );

    number = Number(number);

    if (
        !Number.isInteger(number) ||
        number < 1 ||
        number > 8
    ) {
        alert("Нужно ввести номер от 1 до 8.");
        return;
    }

    // Проверяем, нет ли уже такого номера в этом дне
    let alreadyExists = schedule[day].some(
        item => item.number === number
    );

    if (alreadyExists) {
        alert(
            "Урок №" + number +
            " уже добавлен в " + day + "."
        );
        return;
    }

    let lesson = prompt(
        "Какой предмет будет на этом уроке?"
    );

    if (!lesson) {
        return;
    }

    schedule[day].push({
        number: number,
        lesson: lesson
    });

    // Сортировка по номеру урока
    schedule[day].sort(
        (a, b) => a.number - b.number
    );

    saveSchedule();

    // НЕ закрываем расписание
    renderSchedule();
}


// ====================
// УДАЛЕНИЕ УРОКА
// ====================

function deleteLesson(day, index) {

    let item = schedule[day][index];

    if (!item) {
        return;
    }

    trashLessons.push({
        day: day,
        lesson: item
    });

    schedule[day].splice(index, 1);

    saveSchedule();
    saveData();

    // НЕ закрываем расписание
    renderSchedule();
}
function clearHomeworkTrash() {

    if (trashHomework.length === 0) {
        return;
    }

    let confirmClear = confirm(
        "Ты точно хочешь удалить всю удалённую домашку?"
    );

    if (!confirmClear) {
        return;
    }

    trashHomework = [];

    saveData();

    renderTrash();
}


function clearLessonTrash() {

    if (trashLessons.length === 0) {
        return;
    }

    let confirmClear = confirm(
        "Ты точно хочешь удалить все удалённые уроки?"
    );

    if (!confirmClear) {
        return;
    }

    trashLessons = [];

    saveData();

    renderTrash();
}
// ====================
// ЭКЗАМЕНЫ
// ====================

let exams = JSON.parse(localStorage.getItem("exams")) || [];
let trashExams = JSON.parse(localStorage.getItem("trashExams")) || [];


// ====================
// СОХРАНЕНИЕ ЭКЗАМЕНОВ
// ====================

function saveExams() {

    localStorage.setItem(
        "exams",
        JSON.stringify(exams)
    );

    localStorage.setItem(
        "trashExams",
        JSON.stringify(trashExams)
    );
}


// ====================
// ПОКАЗ ЭКЗАМЕНОВ
// ====================

function showExams() {

    let homework = document.getElementById("homework");

    if (
        homework.innerHTML !== "" &&
        homework.innerHTML.includes("📝 Мои экзамены")
    ) {
        homework.innerHTML = "";
        return;
    }

    renderExams();
}


// ====================
// СПИСОК ЭКЗАМЕНОВ
// ====================

function renderExams() {

    let homework = document.getElementById("homework");

    homework.innerHTML = `
        <h2>📝 Мои экзамены</h2>
    `;

    if (exams.length === 0) {

        homework.innerHTML += `
            <p>Экзаменов пока нет.</p>
        `;

    } else {

        exams.sort(
            (a, b) =>
                new Date(a.date) - new Date(b.date)
        );

        for (let i = 0; i < exams.length; i++) {

            let exam = exams[i];

            homework.innerHTML += `
                <div class="homework-card">

                    <h3>📚 ${exam.subject}</h3>

                    <p>
                        📅 ${formatExamDate(exam.date)}
                    </p>

                    <p>
                        ${getExamStatus(exam.date)}
                    </p>
                    <p>
    📌 Статус:
    ${exam.completed ? "✅ Экзамен выполнен" : "⏳ Не сдан"}
</p>

                    <button
                        class="delete-button"
                        onclick="deleteExam(${i})">
                        🗑️ Удалить
                    </button>
                    <button
    class="complete-button"
    onclick="toggleExam(${i})">
    ${exam.completed ? "↩️ Не сдан" : "✅ Экзамен выполнен"}
</button>

                </div>
            `;
        }
    }

    homework.innerHTML += `
        <br>

        <button onclick="openAddExam()">
            ➕ Добавить экзамен
        </button>
    `;
}


// ====================
// ДОБАВЛЕНИЕ ЭКЗАМЕНА
// ====================

function openAddExam() {

    let homework = document.getElementById("homework");

    homework.innerHTML = `
        <h2>➕ Добавить экзамен</h2>

        <input
            id="examSubject"
            placeholder="Предмет"
        >

        <br><br>

        <label>📅 Дата экзамена:</label>

        <br><br>

        <input
            id="examDate"
            type="date"
        >

        <br><br>

        <button onclick="saveExam()">
            💾 Сохранить
        </button>

        <button onclick="renderExams()">
            ❌ Отмена
        </button>
    `;
}


// ====================
// СОХРАНЕНИЕ ЭКЗАМЕНА
// ====================

function saveExam() {

    let subject =
        document.getElementById("examSubject").value;

    let date =
        document.getElementById("examDate").value;

    if (!subject || !date) {

        alert(
            "Заполни предмет и дату экзамена."
        );

        return;
    }

   exams.push({
    subject: subject,
    date: date,
    completed: false
});

    saveExams();

    renderExams();
}


// ====================
// УДАЛЕНИЕ ЭКЗАМЕНА
// ====================

function deleteExam(index) {

    let exam = exams[index];

    if (!exam) {
        return;
    }

    trashExams.push(exam);

    exams.splice(index, 1);

    saveExams();

    renderExams();
}


// ====================
// ФОРМАТ ДАТЫ ЭКЗАМЕНА
// ====================

function formatExamDate(date) {

    let examDate = new Date(date + "T00:00:00");

    return examDate.toLocaleDateString(
        "ru-RU",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}


// ====================
// СТАТУС ЭКЗАМЕНА
// ====================

function getExamStatus(date) {

    let today = new Date();

    today.setHours(0, 0, 0, 0);

    let examDate =
        new Date(date + "T00:00:00");

    let difference =
        examDate - today;

    let days =
        Math.round(
            difference / (1000 * 60 * 60 * 24)
        );

    if (days < 0) {

        return "⚫ Экзамен уже прошёл";

    }

    if (days === 0) {

        return "🔴 Экзамен сегодня!";

    }

    if (days === 1) {

        return "🟡 Экзамен завтра!";

    }

    return `🟢 Осталось ${days} дн.`;
}
// ====================
// ВОССТАНОВЛЕНИЕ ЭКЗАМЕНА
// ====================

function restoreExam(index) {

    let exam = trashExams[index];

    if (!exam) {
        return;
    }

    exams.push(exam);

    trashExams.splice(index, 1);

    saveExams();

    renderTrash();
}


// ====================
// ОЧИСТКА КОРЗИНЫ ЭКЗАМЕНОВ
// ====================

function clearExamTrash() {

    if (trashExams.length === 0) {
        return;
    }

    let confirmClear = confirm(
        "Ты точно хочешь удалить все удалённые экзамены?"
    );

    if (!confirmClear) {
        return;
    }

    trashExams = [];

    saveExams();

    renderTrash();
}
// ====================
// ВЫПОЛНЕНИЕ ЭКЗАМЕНА
// ====================

function toggleExam(index) {

    exams[index].completed =
        !exams[index].completed;

    saveExams();

    renderExams();
}
// ====================
// PUSH-УВЕДОМЛЕНИЯ
// ====================

if ("serviceWorker" in navigator) {

    window.addEventListener("load", function() {

        navigator.serviceWorker
            .register("sw.js")
            .then(function(registration) {

                console.log(
                    "✅ Service Worker подключён:",
                    registration.scope
                );

            })
            .catch(function(error) {

                console.error(
                    "❌ Ошибка Service Worker:",
                    error
                );

            });

    });
}