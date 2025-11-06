document.querySelector("#form1").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.querySelector("#name").value;
    const number = document.querySelector("#number").value;
    const city = document.querySelector("#city").value;
    const rollNo = document.querySelector("#rollNo").value;

    if (name && number && city && rollNo) {
        fetch('/add-student', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, number, city, rollNo })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Student data stored successfully') {
                // Update table
                const tbody = document.querySelector("#tbody");
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${data.id}</td>
                    <td>${name}</td>
                    <td>${number}</td>
                    <td>${city}</td>
                    <td>${rollNo}</td>
                `;
                tbody.appendChild(row);

                // Clear form
                document.querySelector("#form1").reset();
            } else {
                alert(data.message || 'An error occurred');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred');
        });
    } else {
        alert("All fields are required");
    }
});
