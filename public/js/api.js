
async function apiFetch(url, { method='GET', body, headers } = {}) {
    const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(headers || {})
        },
        body: body ? JSON.stringify(body) : undefined
    });
    const data = await safeJson(res);
    if (!res.ok) {
        const msg = data?.message || `HTTP ${res.status}`;
        throw new Error(msg);
    }
    return data;
}

async function safeJson(res) {
    try { return await res.json(); } catch { return {}; }
}

function showAlert(container, type, message) {
    container.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}

function getCookie(name){
    const m = document.cookie.match(new RegExp('(^| )'+name+'=([^;]+)'));
    return m ? decodeURIComponent(m[2]) : null;
}

function qs(sel, root=document){ return root.querySelector(sel); }
function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
function goto(path){ window.location.href = path; }
