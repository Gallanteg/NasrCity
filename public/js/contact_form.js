document.addEventListener('DOMContentLoaded', function () {
    console.log('JavaScript is running');
    alert('JavaScript is running');  // Debugging alert to ensure script runs

    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            console.log('Form submission prevented');
            alert('Form submission prevented');  // Debugging alert to ensure event listener works

            // Capture form data
            const formData = new FormData(form);
            const formObject = Object.fromEntries(formData.entries());

            // Handle file uploads
            const files = formData.getAll('images');
            const filePromises = files.map(file => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        resolve({
                            filename: file.name,
                            content: e.target.result.split(',')[1], // Get the base64 content
                            contentType: file.type
                        });
                    };
                    reader.onerror = function (e) {
                        reject(e);
                    };
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(filePromises).then(images => {
                formObject.images = images;
                console.log('Form Data:', formObject);  // Log form data for debugging

                // Add timeout to fetch request
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout

                // Test fetch request
                fetch('https://nasr-city-gallantegs-projects.vercel.app/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formObject),
                    signal: controller.signal
                })
                    .then(response => {
                        clearTimeout(timeoutId);
                        if (!response.ok) {
                            console.error('Network response was not ok', response.statusText);
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Response:', data);  // Log response for debugging
                        alert('Message sent successfully!');  // Debugging alert to ensure fetch worked
                    })
                    .catch(error => {
                        clearTimeout(timeoutId);
                        if (error.name === 'AbortError') {
                            console.error('Fetch request timed out');
                            alert('Error: Request timed out.');
                        } else {
                            console.error('Fetch error:', error);
                            alert('Error sending message.');  // Debugging alert to handle errors
                        }
                    });
            }).catch(error => {
                console.error('File reading error:', error);
                alert('Error reading files.');
            });
        });
    } else {
        console.log('Form not found');
        alert('Form not found');  // Debugging alert to handle form not found
    }
});
