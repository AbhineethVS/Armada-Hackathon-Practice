require("dotenv").config();
const express = require("express");
const Groq = require("groq-sdk");
const { marked } = require("marked");

const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.json());
app.use(express.static("public"));

app.post("/api/briefing", async (req, res) => {
	const { role } = req.body;

	const fleetData = require("./data/fleetData.json");

	const response = await groq.chat.completions.create({
		model: "llama-3.3-70b-versatile",
		messages: [
			{
				role: "user",
				content: `You are an operations briefing assistant. 
                Based on this fleet data: ${JSON.stringify(fleetData)}
                Write a morning briefing for a ${role}.
                Format it with sections:
                🔴 Needs Immediate Attention
                🟡 Trending Issues  
                🟢 All Clear
                📅 Upcoming This Week`,
			},
		],
	});

	res.json({ briefing: marked(response.choices[0].message.content) });
});

app.post("/api/chat", async (req, res) => {
	const { question } = req.body;
	const fleetData = require("./data/fleetData.json");

	const response = await groq.chat.completions.create({
		model: "llama-3.3-70b-versatile",
		messages: [
			{
				role: "system",
				content: `You are a fleet operations assistant. 
                You have access to this fleet data: ${JSON.stringify(fleetData)}
                Answer questions concisely and clearly.
                Always refer to specific truck IDs and numbers when relevant.`,
			},
			{
				role: "user",
				content: question,
			},
		],
	});

	res.json({ answer: marked(response.choices[0].message.content) });
});

app.get("/api/fleet", (req, res) => {
	const fleetData = require("./data/fleetData.json");
	res.json(fleetData);
});

app.listen(process.env.PORT, () => {
	console.log(`Server running on port ${process.env.PORT}`);
});
