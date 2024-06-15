function getToken() {
    return localStorage.getItem('token');
}

function attachTokenToHeaders(headers = {}) {
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

function fetchWithToken(url, options = {}) {
    options.headers = attachTokenToHeaders(options.headers || {});
    return fetch(url, options);
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
}
