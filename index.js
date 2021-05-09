const http = require("http");

const waifus = [
	{ id: 1, name: "Chitanda Eru", anime: "Hyouka" },
	{ id: 2, name: "Mayaka Ibara", anime: "Hyouka" },
	{ id: 3, name: "Yuki Nagato", anime: "The Melancholy of Haruhi Suzumiya" },
	{ id: 4, name: "Yui Hirasawa", anime: "K-On!" },
	{ id: 5, name: "Akane Tsunemori	", anime: "Psycho-Pass" },
	{
		id: 6,
		name: "Tomoe Koga",
		anime: "Rascal Does Not Dream of Bunnygirl Senpai",
	},
];

const server = http.createServer((req, res) => {
	const { headers, url, method } = req;
	console.log(headers, url, method);
	res.setHeader("Content-Type", "application/json");
	res.setHeader("X-Powered-By", "Node.js");
	let body = [];
	req.on("data", (chunk) => {
		body.push(chunk);
	}).on("end", () => {
		body = Buffer.concat(body).toString();
		console.log(body);
	});
	res.end(
		JSON.stringify({
			success: true,
			data: waifus,
		})
	);
});

const PORT = 5000;

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
