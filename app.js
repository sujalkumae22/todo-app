const API = "https://todo-app-sujal2201-afarbretb5h0bjfb.eastasia-01.azurewebsites.net";

let userId = localStorage.getItem("userId");
let token = localStorage.getItem("token");

// ---------------- REGISTER ----------------
async function register() {
    const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: document.getElementById("regName").value,
            email: document.getElementById("regEmail").value,
            password: document.getElementById("regPassword").value
        })
    });

    const data = await res.json();
    alert(data.message);
}

// ---------------- LOGIN ----------------
async function login() {
    const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: document.getElementById("email").value,
            password: document.getElementById("password").value
        })
    });

    const data = await res.json();

    if (data.token) {
        userId = data.userId;
        token = data.token;

        // store session (IMPORTANT FIX)
        localStorage.setItem("userId", userId);
        localStorage.setItem("token", token);

        alert("Login Successful");

        window.location.href = "dashboard.html";
    } else {
        alert(data.message);
    }
}

// ---------------- ADD TASK ----------------
async function addTask() {
    const title = document.getElementById("task").value;

    await fetch(`${API}/task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title,
            userId
        })
    });

    document.getElementById("task").value = "";
    loadTasks();
}

// ---------------- LOAD TASKS ----------------
async function loadTasks() {
    if (!userId) return;

    const res = await fetch(`${API}/task/${userId}`);
    const tasks = await res.json();

    const list = document.getElementById("list");
    if (!list) return;

    list.innerHTML = "";

    tasks.forEach(task => {
        const li = document.createElement("li");

        li.innerHTML = `
            ${task.title}
            <button onclick="deleteTask('${task._id}')">Delete</button>
        `;

        list.appendChild(li);
    });
}

// ---------------- DELETE TASK ----------------
async function deleteTask(id) {
    await fetch(`${API}/task/${id}`, {
        method: "DELETE"
    });

    loadTasks();
}

// ---------------- AUTO LOAD ON DASHBOARD ----------------
if (window.location.pathname.includes("dashboard")) {
    loadTasks();
}
function logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");

    window.location.href = "index.html";
}