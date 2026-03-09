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
