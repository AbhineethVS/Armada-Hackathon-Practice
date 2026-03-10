// Show today's date
document.getElementById("date").textContent = new Date().toLocaleDateString(
	"en-IN",
	{
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	},
);

async function getBriefing() {
	const role = document.getElementById("roleSelect").value;
	const btn = document.getElementById("generateBtn");
	const box = document.getElementById("briefingBox");

	// Show loading state
	btn.disabled = true;
	btn.textContent = "Generating...";
	box.innerHTML = '<div class="loading">⏳ Generating your briefing...</div>';

	try {
		const response = await fetch("/api/briefing", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ role }),
		});

		const data = await response.json();
		box.innerHTML = data.briefing;
	} catch (error) {
		box.innerHTML =
			'<div class="loading">❌ Something went wrong. Try again!</div>';
	}

	// Reset button
	btn.disabled = false;
	btn.textContent = "Generate Briefing";
}

async function sendMessage() {
	const input = document.getElementById("chatInput");
	const chatBox = document.getElementById("chatBox");
	const question = input.value.trim();

	if (!question) return;

	// Show user message
	chatBox.innerHTML += `
        <div class="chat-message user">
            ${question}
        </div>
    `;

	// Clear input
	input.value = "";

	// Show typing indicator
	chatBox.innerHTML += `
        <div class="chat-message bot" id="typing">
            ⏳ Thinking...
        </div>
    `;

	// Scroll to bottom
	chatBox.scrollTop = chatBox.scrollHeight;

	try {
		const response = await fetch("/api/chat", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ question }),
		});

		const data = await response.json();

		// Remove typing indicator
		document.getElementById("typing").remove();

		// Show bot response
		chatBox.innerHTML += `
            <div class="chat-message bot">
                ${data.answer}
            </div>
        `;
	} catch (error) {
		document.getElementById("typing").remove();
		chatBox.innerHTML += `
            <div class="chat-message bot">
                ❌ Something went wrong. Try again!
            </div>
        `;
	}

	// Scroll to bottom again
	chatBox.scrollTop = chatBox.scrollHeight;
}

async function loadCharts() {
	const res = await fetch("/api/fleet");
	const data = await res.json();

	// =============================
	// 1️⃣ Online vs Offline Chart
	// =============================

	const online = data.summary.online;
	const offline = data.summary.offline;

	new Chart(document.getElementById("statusChart"), {
		type: "doughnut",
		data: {
			labels: ["Online", "Offline"],
			datasets: [
				{
					data: [online, offline],
					backgroundColor: ["#4caf50", "#f44336"],
				},
			],
		},
	});

	// =============================
	// 2️⃣ Data Usage per Vessel
	// =============================

	const vesselNames = data.terminals.map((t) => t.name);
	const usage = data.terminals.map((t) => t.data_used_gb);

	new Chart(document.getElementById("usageChart"), {
		type: "bar",
		data: {
			labels: vesselNames,
			datasets: [
				{
					label: "Data Used (GB)",
					data: usage,
					backgroundColor: "#6c63ff",
				},
			],
		},
	});

	// =============================
	// 3️⃣ 30 Day Uptime Trend
	// =============================

	const days = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
	const uptime = days.map(() => 95 + Math.random() * 5);

	new Chart(document.getElementById("uptimeChart"), {
		type: "line",
		data: {
			labels: days,
			datasets: [
				{
					label: "Fleet Uptime %",
					data: uptime,
					borderColor: "#4caf50",
					tension: 0.3,
				},
			],
		},
	});
}

loadCharts();

async function loadVesselMap() {
	const res = await fetch("/api/fleet");
	const data = await res.json();

	// Initialize map centered near India
	const map = L.map("vesselMap").setView([12, 75], 4);

	// OpenStreetMap tiles
	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution: "&copy; OpenStreetMap contributors",
	}).addTo(map);

	// Add vessel markers
	data.terminals.forEach((vessel) => {
		// Example coordinates (replace with real ones if you add later)
		const lat = 10 + Math.random() * 15;
		const lng = 60 + Math.random() * 40;

		const color = vessel.status === "online" ? "green" : "red";

		const marker = L.circleMarker([lat, lng], {
			radius: 8,
			color: color,
			fillColor: color,
			fillOpacity: 0.8,
		}).addTo(map);

		marker.bindPopup(`
			<strong>${vessel.name}</strong><br>
			Status: ${vessel.status}<br>
			Signal: ${vessel.signal_strength || "N/A"}<br>
			Data Used: ${vessel.data_used_gb} GB
		`);
	});
}

loadVesselMap();
