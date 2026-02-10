const users = {
  doctor: {
    username: "dr.smith",
    password: "Health@123",
    name: "Dr. Amelia Smith",
    department: "Cardiology",
  },
  nurse: {
    username: "nurse.jane",
    password: "Care@123",
    name: "Nurse Jane Lee",
    department: "Emergency Ward",
  },
  patient: {
    username: "john.doe",
    password: "Patient@123",
    name: "John Doe",
    patientId: "MW-PT-4421",
  },
};

const rolePanels = {
  doctor: [
    {
      title: "Assigned Patients",
      items: [
        "John Doe — Recovery progress stable",
        "Sarah Khan — Post-op review at 4:00 PM",
        "Michael Chen — Needs lab follow-up",
      ],
    },
    {
      title: "Today's Schedule",
      items: [
        "09:30 - Morning rounds",
        "11:00 - Echocardiogram consultation",
        "16:00 - Family counseling session",
      ],
    },
    {
      title: "Critical Alerts",
      items: [
        "2 patients flagged for medication adjustment",
        "1 pending discharge approval",
      ],
    },
  ],
  nurse: [
    {
      title: "Shift Tasks",
      items: [
        "Vitals check: Bed 12, 14, 16",
        "Medication round at 10:00 AM",
        "Prepare room for incoming patient",
      ],
    },
    {
      title: "Patient Notes",
      items: [
        "John Doe reported mild headache",
        "Ayesha Iqbal completed physiotherapy",
        "Bed 08 requesting dietary update",
      ],
    },
    {
      title: "Support Requests",
      items: [
        "2 lab pickup reminders",
        "1 doctor callback pending",
      ],
    },
  ],
  patient: [
    {
      title: "My Health Summary",
      items: [
        "Blood Pressure: 122/81",
        "Last Visit: 02 Feb 2026",
        "Primary Doctor: Dr. Amelia Smith",
      ],
    },
    {
      title: "Upcoming Appointments",
      items: [
        "10 Feb 2026 - Cardiology review",
        "14 Feb 2026 - Lab test",
      ],
    },
    {
      title: "Prescriptions",
      items: ["Aspirin 75mg - Morning", "Vitamin D3 - Evening"],
    },
  ],
};

const loginForm = document.getElementById("loginForm");
const loginCard = document.getElementById("loginCard");
const dashboardCard = document.getElementById("dashboardCard");
const dashboardHeader = document.getElementById("dashboardHeader");
const dashboardBody = document.getElementById("dashboardBody");
const topbarActions = document.getElementById("topbarActions");

function showMessage(target, text, type) {
  const existing = target.querySelector(".alert");
  if (existing) existing.remove();

  const alert = document.createElement("div");
  alert.className = `alert ${type}`;
  alert.textContent = text;
  target.prepend(alert);
}

function clearMessage(target) {
  const existing = target.querySelector(".alert");
  if (existing) existing.remove();
}

function buildPanels(role) {
  dashboardBody.innerHTML = "";
  rolePanels[role].forEach((panel) => {
    const card = document.createElement("article");
    card.className = "info-panel";

    const title = document.createElement("h3");
    title.textContent = panel.title;
    card.appendChild(title);

    const list = document.createElement("ul");
    panel.items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });

    card.appendChild(list);
    dashboardBody.appendChild(card);
  });
}

function renderDashboard(role) {
  const user = users[role];
  dashboardHeader.innerHTML = `
    <div class="dashboard-title">
      <div>
        <h2>Welcome, ${user.name}</h2>
        <p>${role === "patient" ? `Patient ID: ${user.patientId}` : user.department}</p>
      </div>
      <span class="badge ${role}">${role.toUpperCase()} ACCESS</span>
    </div>
  `;

  buildPanels(role);
  loginCard.classList.add("hidden");
  dashboardCard.classList.remove("hidden");
  showMessage(dashboardCard, "Login successful. Your role-specific data is ready.", "success");

  topbarActions.innerHTML = `<button class="btn-secondary" id="logoutBtn">Logout</button>`;
  document.getElementById("logoutBtn").addEventListener("click", logout);
}

function logout() {
  dashboardCard.classList.add("hidden");
  loginCard.classList.remove("hidden");
  topbarActions.innerHTML = "";
  dashboardBody.innerHTML = "";
  dashboardHeader.innerHTML = "";
  loginForm.reset();
  clearMessage(loginCard);
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  clearMessage(loginCard);

  const role = document.getElementById("role").value;
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!role || !users[role]) {
    showMessage(loginCard, "Please choose a valid role.", "error");
    return;
  }

  const selectedUser = users[role];
  if (selectedUser.username !== username || selectedUser.password !== password) {
    showMessage(loginCard, "Invalid credentials for selected role.", "error");
    return;
  }

  renderDashboard(role);
});
