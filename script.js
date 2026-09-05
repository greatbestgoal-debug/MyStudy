// ===============================
// SUPABASE
// ===============================

const SUPABASE_URL = "https://wdtpoljnlorbasitizcd.supabase.co";
const SUPABASE_KEY = "sb_publishable_EHR9JrIbOkG-pWM3NNDPYA_hJfpyIXc";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ===============================
// ДАННЫЕ
// ===============================

let homeworkList = [];
let trashHomework = [];

let schedule = JSON.parse(localStorage.getItem("schedule")) || {};
let trashLessons = JSON.parse(localStorage.getItem("trashLessons")) || [];


// ===============================
// АВТОРИЗАЦИЯ
// ===============================

async function register() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const message = document.getElementById("authMessage");

    if (!email || !password) {
        message.textContent = "Введите Email и пароль.";
        return;
    }

    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password
        });

        if (error) {
            message.textContent = "Ошибка: " + error.message;
            return;
        }

        if (data.user) {
            message.textContent =
                "Аккаунт создан. Теперь можно войти.";
        }
    } catch (error) {
        console.error(error);
        message.textContent = "Произошла ошибка.";
    }
}


async function login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const message = document.getElementById("authMessage");

    if (!email || !password) {
        message.textContent = "Введите Email и пароль.";
        return;
    }

    message.textContent = "Выполняется вход...";

    try {
        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

        if (error) {
            console.error(error);
            message.textContent = "Ошибка входа: " + error.message;
            return;
        }

        await showApp(data.user);

    } catch (error) {
        console.error(error);
        message.textContent =
            "Ошибка JavaScript. Открой F12 → Console.";
    }
}


async function logout() {
    await supabaseClient.auth.signOut();

    document.getElementById("auth").style.display = "block";
    document.getElementById("app").style.display = "none";

    document.getElementById("authMessage").textContent = "";
    document.getElementById("homework").innerHTML = "";
}


// ===============================
// ПОКАЗ ПРИЛОЖЕНИЯ
// ===============================

async function showApp(user) {
    document.getElementById("auth").style.display = "none";
    document.getElementById("app").style.display = "block";

    document.getElementById("userEmail").textContent =
        "Вы вошли как: " + user.email;

    await loadHomeworkFromCloud(user.id);

    showHomework();
}


// ===============================
// ПРОВЕРКА АВТОРИЗАЦИИ
// ===============================

async function checkUser() {
    try {
        const { data, error } =
            await supabaseClient.auth.getUser();

        if (error) {
            console.error(error);
            return;
        }

        if (data.user) {
            await showApp(data.user);
        }

    } catch (error) {
        console.error(error);
    }
}


// ===============================
// HOMEWORK — ОБЛАКО
// ===============================

async function loadHomeworkFromCloud(userId) {
    try {
        const { data, error } = await supabaseClient
            .from("homework")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Ошибка загрузки домашки:", error);
            return;
        }

        // Если в облаке пока ничего нет,
        // попробуем перенести старые данные
        // из localStorage.

        if (data.length === 0) {
            await migrateOldHomework(userId);

            const { data: newData, error: newError } =
                await supabaseClient
                    .from("homework")
                    .select("*")
                    .eq("user_id", userId)
                    .order("created_at", {
                        ascending: false
                    });

            if (newError) {
                console.error(newError);
                return;
            }

            setHomeworkData(newData || []);
            return;
        }

        setHomeworkData(data);

    } catch (error) {
        console.error(error);
    }
}


function setHomeworkData(data) {
    homeworkList = data.filter(item => !item.in_trash);
    trashHomework = data.filter(item => item.in_trash);

    // Локальная копия — как запасной вариант
    localStorage.setItem(
        "homeworkList",
        JSON.stringify(homeworkList)
    );

    localStorage.setItem(
        "trashHomework",
        JSON.stringify(trashHomework)
    );
}


// ===============================
// ПЕРЕНОС СТАРОЙ ДОМАШКИ
// ===============================

async function migrateOldHomework(userId) {
    const oldHomework =
        JSON.parse(localStorage.getItem("homeworkList")) || [];

    const oldTrash =
        JSON.parse(localStorage.getItem("trashHomework")) || [];

    const allOldHomework = [
        ...oldHomework.map(item => ({
            subject: item.subject,
            task: item.task,
            deadline: item.deadline || null,
            completed: item.completed || false,
            in_trash: false
        })),

        ...oldTrash.map(item => ({
            subject: item.subject,
            task: item.task,
            deadline: item.deadline || null,
            completed: item.completed || false,
            in_trash: true
        }))
    ];

    if (allOldHomework.length === 0) {
        return;
    }

    const rows = allOldHomework.map(item => ({
        user_id: userId,
        subject: item.subject,
        task: item.task,
        deadline: item.deadline,
        completed: item.completed,
        in_trash: item.in_trash
    }));

    const { error } = await supabaseClient
        .from("homework")
        .insert(rows);

    if (error) {
        console.error(
            "Ошибка переноса старой домашки:",
            error
        );
    }
}


// ===============================
// HOMEWORK
// ===============================

function showHomework() {
    const homework = document.getElementById("homework");

    homework.innerHTML = `
        <h2>📋 Домашка</h2>

        <button onclick="addHomework()">
            ➕ Добавить домашку
        </button>

        <hr>

        <div id="homeworkList"></div>
    `;

    showHomeworkList();
}


function showHomeworkList() {
    const container =
        document.getElementById("homeworkList");

    if (!container) {
        return;
    }

    if (homeworkList.length === 0) {
        container.innerHTML =
            "<p>Домашних заданий пока нет.</p>";
        return;
    }

    container.innerHTML = homeworkList.map(item => `
        <div class="homework-card ${item.completed ? "completed" : ""}">

            <h3>
                ${escapeHtml(item.subject)}
            </h3>

            <p>
                ${escapeHtml(item.task)}
            </p>

            ${
                item.deadline
                    ? `<p>📅 Срок: ${formatDeadline(item.deadline)}</p>`
                    : ""
            }

            <button onclick="toggleHomework(${item.id})">
                ${
                    item.completed
                        ? "↩️ Вернуть"
                        : "✅ Выполнено"
                }
            </button>

            <button onclick="deleteHomework(${item.id})">
                🗑️ Удалить
            </button>

        </div>
    `).join("");
}


// ===============================
// ДОБАВИТЬ ДОМАШКУ
// ===============================

async function addHomework() {
    const subject = prompt("Предмет:");

    if (!subject) {
        return;
    }

    const task = prompt("Что нужно сделать?");

    if (!task) {
        return;
    }

    const deadline =
        prompt("Срок (например 2026-09-10), или оставь пустым:");

    try {
        const { data: userData, error: userError } =
            await supabaseClient.auth.getUser();

        if (userError || !userData.user) {
            alert("Нужно войти в аккаунт.");
            return;
        }

        const { data, error } =
            await supabaseClient
                .from("homework")
                .insert({
                    user_id: userData.user.id,
                    subject: subject,
                    task: task,
                    deadline: deadline || null,
                    completed: false,
                    in_trash: false
                })
                .select("*")
                .single();

        if (error) {
            console.error(error);
            alert("Не удалось добавить домашку.");
            return;
        }

        homeworkList.unshift(data);

        saveLocalHomeworkBackup();
        showHomeworkList();

    } catch (error) {
        console.error(error);
        alert("Произошла ошибка.");
    }
}


// ===============================
// ВЫПОЛНЕНО / НЕ ВЫПОЛНЕНО
// ===============================

async function toggleHomework(id) {
    const item = homeworkList.find(
        homework => homework.id === id
    );

    if (!item) {
        return;
    }

    try {
        const { data: userData } =
            await supabaseClient.auth.getUser();

        if (!userData.user) {
            return;
        }

        const newStatus = !item.completed;

        const { error } =
            await supabaseClient
                .from("homework")
                .update({
                    completed: newStatus
                })
                .eq("id", id)
                .eq("user_id", userData.user.id);

        if (error) {
            console.error(error);
            return;
        }

        item.completed = newStatus;

        saveLocalHomeworkBackup();
        showHomeworkList();

    } catch (error) {
        console.error(error);
    }
}


// ===============================
// УДАЛЕНИЕ
// ===============================

async function deleteHomework(id) {
    try {
        const { data: userData } =
            await supabaseClient.auth.getUser();

        if (!userData.user) {
            return;
        }

        const { error } =
            await supabaseClient
                .from("homework")
                .update({
                    in_trash: true
                })
                .eq("id", id)
                .eq("user_id", userData.user.id);

        if (error) {
            console.error(error);
            return;
        }

        const itemIndex = homeworkList.findIndex(
            item => item.id === id
        );

        if (itemIndex !== -1) {
            const [item] =
                homeworkList.splice(itemIndex, 1);

            item.in_trash = true;
            trashHomework.unshift(item);
        }

        saveLocalHomeworkBackup();
        showHomeworkList();

    } catch (error) {
        console.error(error);
    }
}


// ===============================
// КОРЗИНА
// ===============================

function showTrash() {
    const homework =
        document.getElementById("homework");

    homework.innerHTML = `
        <h2>🗑️ Корзина домашки</h2>

        <button onclick="showHomework()">
            ← Назад
        </button>

        <button onclick="clearHomeworkTrash()">
            🗑️ Очистить корзину
        </button>

        <hr>

        <div id="trashList"></div>
    `;

    showTrashList();
}


function showTrashList() {
    const container =
        document.getElementById("trashList");

    if (!container) {
        return;
    }

    if (trashHomework.length === 0) {
        container.innerHTML =
            "<p>Корзина пуста.</p>";
        return;
    }

    container.innerHTML = trashHomework.map(item => `
        <div class="homework-card">

            <h3>
                ${escapeHtml(item.subject)}
            </h3>

            <p>
                ${escapeHtml(item.task)}
            </p>

            <button onclick="restoreHomework(${item.id})">
                ♻️ Восстановить
            </button>

        </div>
    `).join("");
}


// ===============================
// ВОССТАНОВЛЕНИЕ
// ===============================

async function restoreHomework(id) {
    try {
        const { data: userData } =
            await supabaseClient.auth.getUser();

        if (!userData.user) {
            return;
        }

        const { error } =
            await supabaseClient
                .from("homework")
                .update({
                    in_trash: false
                })
                .eq("id", id)
                .eq("user_id", userData.user.id);

        if (error) {
            console.error(error);
            return;
        }

        const index = trashHomework.findIndex(
            item => item.id === id
        );

        if (index !== -1) {
            const [item] =
                trashHomework.splice(index, 1);

            item.in_trash = false;
            homeworkList.unshift(item);
        }

        saveLocalHomeworkBackup();
        showTrashList();

    } catch (error) {
        console.error(error);
    }
}


// ===============================
// ОЧИСТИТЬ КОРЗИНУ
// ===============================

async function clearHomeworkTrash() {
    if (trashHomework.length === 0) {
        return;
    }

    const confirmDelete =
        confirm("Удалить домашку из корзины навсегда?");

    if (!confirmDelete) {
        return;
    }

    try {
        const { data: userData } =
            await supabaseClient.auth.getUser();

        if (!userData.user) {
            return;
        }

        const { error } =
            await supabaseClient
                .from("homework")
                .delete()
                .eq("user_id", userData.user.id)
                .eq("in_trash", true);

        if (error) {
            console.error(error);
            return;
        }

        trashHomework = [];

        saveLocalHomeworkBackup();
        showTrashList();

    } catch (error) {
        console.error(error);
    }
}


// ===============================
// РАСПИСАНИЕ
// ===============================

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


function showSchedule() {
    const homework =
        document.getElementById("homework");

    homework.innerHTML = `
        <h2>📅 Расписание</h2>

        <button onclick="showHomework()">
            ← Назад
        </button>

        <hr>

        <div id="scheduleContainer"></div>
    `;

    renderSchedule();
}


function renderSchedule() {
    const container =
        document.getElementById("scheduleContainer");

    if (!container) {
        return;
    }

    const days = [
        "Понедельник",
        "Вторник",
        "Среда",
        "Четверг",
        "Пятница"
    ];

    container.innerHTML = "";

    days.forEach(day => {
        if (!schedule[day]) {
            schedule[day] = [];
        }

        container.innerHTML += `
            <div class="day">

                <h2>${day}</h2>

                ${
                    schedule[day].length === 0
                        ? "<p>Уроков нет.</p>"
                        : schedule[day]
                            .sort(
                                (a, b) =>
                                    a.number - b.number
                            )
                            .map(lesson => `
                                <div class="lesson">

                                    <strong>
                                        Урок ${lesson.number}
                                    </strong>

                                    <span>
                                        ${lessonTimes[lesson.number - 1]}
                                    </span>

                                    <p>
                                        ${escapeHtml(lesson.name)}
                                    </p>

                                    <button
                                        onclick="deleteLesson('${day}', ${lesson.number})"
                                    >
                                        🗑️
                                    </button>

                                </div>
                            `)
                            .join("")
                }

                <button onclick="addLesson('${day}')">
                    ➕ Добавить урок
                </button>

            </div>

            <hr>
        `;
    });

    localStorage.setItem(
        "schedule",
        JSON.stringify(schedule)
    );
}


// ===============================
// ДОБАВИТЬ УРОК
// ===============================

function addLesson(day) {
    const numberText =
        prompt("Номер урока от 1 до 8:");

    const number = Number(numberText);

    if (
        !Number.isInteger(number) ||
        number < 1 ||
        number > 8
    ) {
        alert("Номер должен быть от 1 до 8.");
        return;
    }

    if (!schedule[day]) {
        schedule[day] = [];
    }

    const alreadyExists =
        schedule[day].some(
            lesson => lesson.number === number
        );

    if (alreadyExists) {
        alert(
            "В этот день урок с таким номером уже есть."
        );
        return;
    }

    const name =
        prompt("Название предмета:");

    if (!name) {
        return;
    }

    schedule[day].push({
        number: number,
        name: name
    });

    renderSchedule();
}


// ===============================
// УДАЛИТЬ УРОК
// ===============================

function deleteLesson(day, number) {
    if (!schedule[day]) {
        return;
    }

    const index =
        schedule[day].findIndex(
            lesson => lesson.number === number
        );

    if (index === -1) {
        return;
    }

    const [lesson] =
        schedule[day].splice(index, 1);

    if (!trashLessons[day]) {
        trashLessons[day] = [];
    }

    trashLessons[day].push({
        number: lesson.number,
        name: lesson.name
    });

    localStorage.setItem(
        "schedule",
        JSON.stringify(schedule)
    );

    localStorage.setItem(
        "trashLessons",
        JSON.stringify(trashLessons)
    );

    renderSchedule();
}


// ===============================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ===============================

function saveLocalHomeworkBackup() {
    localStorage.setItem(
        "homeworkList",
        JSON.stringify(homeworkList)
    );

    localStorage.setItem(
        "trashHomework",
        JSON.stringify(trashHomework)
    );
}


function formatDeadline(dateString) {
    if (!dateString) {
        return "";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString("ru-RU");
}


function escapeHtml(text) {
    if (text === null || text === undefined) {
        return "";
    }

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ===============================
// ЗАПУСК
// ===============================

checkUser();