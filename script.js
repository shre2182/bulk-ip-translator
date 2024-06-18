let translatedIPs = [];
const pageSize = 100; // Number of entries per page
let currentPage = 1;

document.getElementById('translate-btn').addEventListener('click', async () => {
    const input = document.getElementById('ip-input').value;
    const ipAddresses = input.split(/\s+|,|;/).filter(Boolean);
    const batchSize = 1000;  // Send data in chunks

    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('output').innerHTML = '';
    document.getElementById('print-btn').classList.add('hidden');
    document.getElementById('csv-btn').classList.add('hidden');
    document.getElementById('pagination').classList.add('hidden');

    translatedIPs = [];

    try {
        for (let i = 0; i < ipAddresses.length; i += batchSize) {
            const batch = ipAddresses.slice(i, i + batchSize);
            const response = await fetch('http://localhost:3000/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ipAddresses: batch })
            });

            const result = await response.json();
            translatedIPs.push(...result);
        }

        document.getElementById('loading').classList.add('hidden');
        document.getElementById('print-btn').classList.remove('hidden');
        document.getElementById('csv-btn').classList.remove('hidden');
        document.getElementById('pagination').classList.remove('hidden');

        renderTable();
    } catch (error) {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('output').innerHTML = 'Translation failed';
    }
});

document.getElementById('print-btn').addEventListener('click', () => {
    window.print();
});

document.getElementById('csv-btn').addEventListener('click', () => {
    const csvContent = "data:text/csv;charset=utf-8,"
        + translatedIPs.map(e => `${e.ip},${e.city},${e.region},${e.country}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "translated_ips.csv");
    document.body.appendChild(link);

    link.click();
});

document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    if (currentPage * pageSize < translatedIPs.length) {
        currentPage++;
        renderTable();
    }
});

function renderTable() {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = translatedIPs.slice(start, end);

    const tableRows = pageData.map(ipInfo => {
        return `<tr><td>${ipInfo.ip}</td><td>${ipInfo.city}</td><td>${ipInfo.region}</td><td>${ipInfo.country}</td></tr>`;
    }).join('');

    const table = `<table><tr><th>IP Address</th><th>City</th><th>Region</th><th>Country</th></tr>${tableRows}</table>`;
    
    document.getElementById('output').innerHTML = table;
    document.getElementById('page-info').textContent = `Page ${currentPage} of ${Math.ceil(translatedIPs.length / pageSize)}`;
}
