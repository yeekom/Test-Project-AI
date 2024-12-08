const SHEET_ID = "1vW-nFbnR02F9BEnNPe5NBejHRGPt0QEGOYXLSePsC1k";
const SHEET_NAME = "Unreleased";
const API_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");
    const resultsTableBody = document.getElementById("results-table").querySelector("tbody");

    async function fetchData() {
        try {
            const response = await fetch(API_URL);
            const text = await response.text();
            const json = JSON.parse(text.substr(47).slice(0, -2)); // Clean up the JSON response
            return json.table.rows.map(row => row.c.map(cell => (cell ? cell.v : "")));
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    function renderTable(data) {
        resultsTableBody.innerHTML = data.map(row => `
            <tr>
                ${row.map((cell, index) =>
                    index === 8 ? `<td><a href="${cell}" target="_blank">Download</a></td>` : `<td>${cell}</td>`
                ).join("")}
            </tr>
        `).join("");
    }

    function handleSearch(data) {
        const query = searchInput.value.toLowerCase();
        const filteredData = data.filter(row =>
            (row[1] && row[1].toLowerCase().includes(query)) || // Search in Name
            (row[2] && row[2].toLowerCase().includes(query))   // Search in Notes
        );
        renderTable(filteredData);
    }

    fetchData().then(data => {
        renderTable(data);
        searchInput.addEventListener("input", () => handleSearch(data));
    });
});
