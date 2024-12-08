const SHEET_ID = "1vW-nFbnR02F9BEnNPe5NBejHRGPt0QEGOYXLSePsC1k";
const SHEET_NAME = "Unreleased";
const API_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");
    const resultsTableBody = document.getElementById("results-table").querySelector("tbody");
    const loadMoreButton = document.createElement("button");
    loadMoreButton.innerText = "Load More";
    loadMoreButton.classList.add("load-more-btn");
    document.body.appendChild(loadMoreButton);

    let allData = [];
    let displayedData = [];
    let currentIndex = 0;
    const rowsPerPage = 50;

    async function fetchData() {
        try {
            const response = await fetch(API_URL);
            const text = await response.text();
            const json = JSON.parse(text.substr(47).slice(0, -2)); // Clean up the JSON response

            // Check if the data exists in the expected format
            if (json && json.table && json.table.rows) {
                allData = json.table.rows.map(row => row.c.map(cell => (cell ? cell.v : "")));
                // Initially display the first rowsPerPage rows
                displayedData = allData.slice(0, rowsPerPage);
                renderTable(displayedData);
            } else {
                console.error("Failed to load data in the expected format");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    function renderTable(data) {
        if (data.length === 0) {
            resultsTableBody.innerHTML = "<tr><td colspan='9'>No data found.</td></tr>";
        } else {
            resultsTableBody.innerHTML = data.map(row => `
                <tr>
                    ${row.map((cell, index) =>
                        index === 8 ? `<td><a href="${cell}" target="_blank">Download</a></td>` : `<td>${cell}</td>`
                    ).join("")}
                </tr>
            `).join("");
        }
    }

    function handleSearch(data) {
        const query = searchInput.value.toLowerCase();
        const filteredData = data.filter(row =>
            (row[1] && row[1].toLowerCase().includes(query)) || // Search in Name
            (row[2] && row[2].toLowerCase().includes(query))   // Search in Notes
        );
        displayedData = filteredData.slice(0, rowsPerPage); // Reset to first 50 results after search
        renderTable(displayedData);
    }

    loadMoreButton.addEventListener("click", () => {
        currentIndex += rowsPerPage;
        const nextData = allData.slice(currentIndex, currentIndex + rowsPerPage);
        if (nextData.length > 0) {
            displayedData.push(...nextData);
            renderTable(displayedData);
        }
    });

    fetchData().then(() => {
        searchInput.addEventListener("input", () => handleSearch(allData));
    });
});
