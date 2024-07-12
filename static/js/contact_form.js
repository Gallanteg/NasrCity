document.addEventListener('DOMContentLoaded', function () {
    console.log('contact_form.js is loaded');

    const form = document.getElementById('contact-form');
    if (form) {
        console.log('Form found, attaching event listener');
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            console.log('Form submission prevented');

            const formData = new FormData(form);
            const files = formData.getAll('images');

            const filePromises = files.map(file => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        resolve({
                            filename: file.name,
                            content: e.target.result.split(',')[1],
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
                const formObject = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    message: formData.get('message'),
                    images: images
                };

                console.log('Form data prepared:', formObject);

                fetch('https://nasr-city-gallantegs-projects.vercel.app/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formObject),
                })
                    .then(response => {
                        console.log('Fetch response:', response);
                        if (!response.ok) {
                            throw new Error(`Network response was not ok: ${response.statusText}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Success:', data);
                        alert('Message sent successfully!');
                    })
                    .catch(error => {
                        console.error('Fetch error:', error);
                        alert(`Error sending message: ${error.message}`);
                    });
            }).catch(error => {
                console.error('File reading error:', error);
                alert(`Error reading files: ${error.message}`);
            });
        });
    } else {
        console.log('Form not found');
    }
});
