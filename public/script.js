// Tracks whether the last question was spoken or typed
let usedDictate = false;
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

	input.value = "";

	chatBox.innerHTML += `
        <div class="chat-message bot" id="typing">
            ⏳ Thinking...
        </div>
    `;

	chatBox.scrollTop = chatBox.scrollHeight;

	try {
		const response = await fetch("/api/chat", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ question }),
		});

		const data = await response.json();

		document.getElementById("typing").remove();

		chatBox.innerHTML += `
            <div class="chat-message bot">
                ${data.answer}
            </div>
        `;

		if (usedDictate) {
			// Use DOMParser to let the browser strip ALL HTML properly
			const parser = new DOMParser();
			const doc = parser.parseFromString(data.answer, "text/html");
			const plainText = doc.body.innerText
				.replace(/\u201C|\u201D|\u2018|\u2019/g, "") // curly quotes
				.replace(/\u2014|\u2013/g, " ") // em/en dash
				.replace(/\*\*/g, "")
				.replace(/\*/g, "")
				.replace(/#{1,6}\s/g, "")
				.replace(/`{1,3}/g, "")
				.replace(/\n{2,}/g, ". ")
				.replace(/\n/g, " ")
				.trim();

			// Small delay fixes Chrome SpeechSynthesis timing bug
			setTimeout(() => {
				const utterance = new SpeechSynthesisUtterance(plainText);
				utterance.rate = 1;
				utterance.pitch = 1;
				utterance.volume = 1;

				// Show the stop button while speaking
				const stopBtn = document.getElementById("stopChatVoiceBtn");
				stopBtn.style.display = "inline-block";

				// Hide stop button when done
				utterance.onend = () => {
					stopBtn.style.display = "none";
				};

				window.speechSynthesis.speak(utterance);
			}, 300);
			usedDictate = false;
		}
	} catch (error) {
		document.getElementById("typing").remove();
		chatBox.innerHTML += `
            <div class="chat-message bot">
                ❌ Something went wrong. Try again!
            </div>
        `;
	}

	chatBox.scrollTop = chatBox.scrollHeight;

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
		marker.on("click", () => openVesselModal(vessel));
	});
}

loadVesselMap();

let fleetData = null;
let selectedRole = "Fleet Manager";

async function loadFleet() {
	const res = await fetch("/api/fleet");
	fleetData = await res.json();

	renderSidebar();
}

function renderSidebar() {
	const vesselList = document.getElementById("vesselList");

	const vessels = [...fleetData.terminals];

	// offline first
	vessels.sort((a, b) => (a.status === "offline" ? -1 : 1));

	vesselList.innerHTML = "";

	vessels.forEach((v) => {
		const statusClass =
			v.status === "online" ? "status-online" : "status-offline";

		const warning = v.status === "offline" ? "⚠️" : "";

		const item = document.createElement("div");

		item.className = "vessel-item";

		item.innerHTML = `
			<div class="status-dot ${statusClass}"></div>
			<div class="vessel-name">${v.name}</div>
			<div class="warning-icon">${warning}</div>
		`;

		item.onclick = () => openVesselModal(v);

		vesselList.appendChild(item);
	});
}

document.getElementById("roleSelect").addEventListener("change", (e) => {
	selectedRole = e.target.value;
});

function openVesselModal(vessel) {
	const modal = document.getElementById("vesselModal");

	document.getElementById("modalVesselName").textContent = vessel.name;

	const content = document.getElementById("modalContent");
	const actions = document.getElementById("modalActions");

	content.innerHTML = "";
	actions.innerHTML = "";

	/* ========================= */
	/* ROLE BASED CONTENT */
	/* ========================= */

	if (selectedRole === "Fleet Manager") {
		content.innerHTML = `
			<p><b>Status:</b> ${vessel.status}</p>
			<p><b>Route:</b> ${vessel.route}</p>
			<p><b>Data Used:</b> ${vessel.data_used_gb} GB</p>
			<p><b>Estimated Cost Impact:</b> $4200</p>
		`;

		addAction("📞 Call Operations Head");
		addAction("📧 Escalate to Management");
		addAction("📊 View Cost Report");
	} else if (selectedRole === "NOC Analyst") {
		content.innerHTML = `
			<p><b>Signal Strength:</b> ${vessel.signal_strength}</p>
			<p><b>Coordinates:</b> ${vessel.location}</p>
			<p><b>Hardware Status:</b> Operational</p>
			<p><b>Alert:</b> ${vessel.alert || "None"}</p>
		`;

		addAction("📞 Call Vessel");
		addAction("📡 Attempt Reconnect");
		addAction("📋 View Full Logs");
	} else if (selectedRole === "Safety Officer") {
		content.innerHTML = `
			<p><b>Crew Count:</b> 18</p>
			<p><b>Last Contact:</b> ${vessel.last_seen || "Recently"}</p>
			<p><b>Nearest Coast Guard:</b> Kochi Station</p>
			<p><b>Distance to Shore:</b> 120 km</p>
		`;

		addAction("🚨 Alert Coast Guard");
		addAction("📞 Emergency Call");
		addAction("🆘 Initiate SAR Protocol");
	}

	modal.classList.remove("hidden");
}

function closeVesselModal() {
	document.getElementById("vesselModal").classList.add("hidden");
}

function addAction(text) {
	const btn = document.createElement("button");

	btn.textContent = text;

	btn.onclick = simulateCall;

	document.getElementById("modalActions").appendChild(btn);
}

function simulateCall() {
	const overlay = document.getElementById("callOverlay");
	const status = document.getElementById("callStatus");

	overlay.classList.remove("hidden");

	status.textContent = "Connecting via Iridium Satellite...";

	setTimeout(() => {
		status.textContent = "Secure satellite link established.";
	}, 3000);

	setTimeout(() => {
		overlay.classList.add("hidden");
	}, 5000);
}

loadFleet();

// =============================
// 🔊 VOICE BRIEFING
// =============================

// This reads the current briefing box text out loud
// using the browser's built-in SpeechSynthesis API
// No cost, no API key — it's built into Chrome/Edge/Safari

function readBriefing() {
	const briefingBox = document.getElementById("briefingBox");
	const voiceBtn = document.getElementById("voiceBtn");

	// Get the plain text from the briefing box
	// (strips out any HTML tags so it reads cleanly)
	const text = briefingBox.innerText;

	// If there's nothing to read, do nothing
	if (!text || text.includes("Select your role")) {
		alert("Generate a briefing first!");
		return;
	}

	// If already speaking, stop it (acts as a toggle)
	if (window.speechSynthesis.speaking) {
		window.speechSynthesis.cancel();
		voiceBtn.textContent = "🔊 Read Briefing";
		return;
	}

	// Create a new speech utterance (the thing that gets spoken)
	const utterance = new SpeechSynthesisUtterance(text);

	// Voice settings — tweak these if you want
	utterance.rate = 1; // Speed: 0.5 (slow) to 2 (fast)
	utterance.pitch = 1; // Pitch: 0 (deep) to 2 (high)
	utterance.volume = 1; // Volume: 0 to 1

	// Change button text while speaking
	voiceBtn.textContent = "⏹ Stop Reading";

	// When it finishes, reset the button
	utterance.onend = () => {
		voiceBtn.textContent = "🔊 Read Briefing";
	};

	// Speak it!
	window.speechSynthesis.speak(utterance);
}

// =============================
// 🎙️ DICTATE MODE
// =============================

// This listens to your voice and types it into the chat input
// Uses SpeechRecognition API — built into Chrome/Edge
// NOTE: Does NOT work in Firefox — tell judges to use Chrome

function startDictate() {
	const dictateBtn = document.getElementById("dictateBtn");
	const chatInput = document.getElementById("chatInput");

	// Check if browser supports SpeechRecognition
	const SpeechRecognition =
		window.SpeechRecognition || window.webkitSpeechRecognition;

	if (!SpeechRecognition) {
		alert("Voice input not supported in this browser. Please use Chrome!");
		return;
	}

	// Create a new recognition instance
	const recognition = new SpeechRecognition();

	recognition.lang = "en-US"; // Language
	recognition.interimResults = false; // Only give us the final result
	recognition.maxAlternatives = 1; // Only need one interpretation

	// While listening, update the button so user knows it's active
	dictateBtn.textContent = "🔴 Listening...";
	dictateBtn.disabled = true;

	// Start listening
	recognition.start();

	// When speech is detected and processed
	recognition.onresult = (event) => {
		// Get the spoken text
		usedDictate = true; // Mark that dictate was used
		const spokenText = event.results[0][0].transcript;

		// Put it into the chat input box
		chatInput.value = spokenText;

		// Reset the button
		dictateBtn.textContent = "🎙️ Dictate";
		dictateBtn.disabled = false;

		// Auto-send the message after a short delay
		// so user can see what was typed before it sends
		setTimeout(() => {
			sendMessage();
		}, 800);
	};

	// If something goes wrong (e.g. no mic permission)
	recognition.onerror = (event) => {
		console.error("Speech recognition error:", event.error);
		dictateBtn.textContent = "🎙️ Dictate";
		dictateBtn.disabled = false;

		if (event.error === "not-allowed") {
			alert(
				"Microphone access denied. Please allow mic permissions in your browser.",
			);
		}
	};

	// When recognition ends for any reason, reset the button
	recognition.onend = () => {
		dictateBtn.textContent = "🎙️ Dictate";
		dictateBtn.disabled = false;
	};
}

// =============================
// ⏹ STOP CHAT VOICE
// =============================
function stopChatVoice() {
	window.speechSynthesis.cancel();
	document.getElementById("stopChatVoiceBtn").style.display = "none";
}
