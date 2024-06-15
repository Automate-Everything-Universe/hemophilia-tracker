document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const username = formData.get('username');
    const password = formData.get('password');

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            username: username,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.access_token) {
            localStorage.setItem('token', data.access_token);
            loadUserPage(username);
        } else {
            alert('Login failed: ' + (data.detail || 'Unknown error'));
        }
    })
    .catch(error => console.error('Error logging in:', error));
});


function loadUserPage(username) {
    fetchWithToken(`/users/${username}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(htmlContent => {
            document.write(htmlContent);
            document.close();
        })
        .catch(error => console.error('Error fetching user page:', error));
}