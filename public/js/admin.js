(async function(){
    const alertBox = qs('#alert');
    const whoami = qs('#whoami');
    const btnLogout = qs('#btnLogout');
    const grid = qs('#grid');
    const minPrice = qs('#minPrice');
    const maxPrice = qs('#maxPrice');
    const btnSearch = qs('#btnSearch');
    try{
        const me = await apiFetch('/api/auth/me');
        if (!me?.data?.user) throw new Error('Chưa đăng nhập');
        const u = me.data.user;
        whoami.textContent = `${u.name || u.email} (${u.role})`;
        if (u.role !== 'ADMIN') throw new Error('Bạn không có quyền ADMIN');
    }catch(err){
        showAlert(alertBox, 'danger', 'Bạn cần đăng nhập với quyền ADMIN');
        setTimeout(()=> goto('/login.html'), 1000);
        return;
    }

    const categorySelect = qs('#categoryIdSelect');
    let categoriesMap = {}; // { id: {id, name}, ... }

    async function loadCategories() {
        const res = await apiFetch('/api/categories');
        const items = res.data.items || [];
        categoriesMap = Object.fromEntries(items.map(c => [String(c.id), c]));
        categorySelect.innerHTML = `<option value="">— Chọn danh mục —</option>` +
            items.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }

    await loadCategories().catch(err => showAlert(alertBox, 'danger', err.message));

    btnLogout.addEventListener('click', async (e)=>{
        e.preventDefault();
        try{ await apiFetch('/api/auth/logout'); }catch {}
        goto('/login.html');
    });

    async function loadBooks(){
        const params = new URLSearchParams();
        if (minPrice.value) params.set('minPrice', minPrice.value);
        if (maxPrice.value) params.set('maxPrice', maxPrice.value);
        const url = '/api/books' + (params.toString() ? `?${params.toString()}` : '');
        const res = await apiFetch(url);
        renderGrid(res.data.items || []);
    }


    function renderGrid(items){
        if (!items.length){
            grid.innerHTML = `<tr><td colspan="9" class="text-center py-4">Không có dữ liệu</td></tr>`;
            return;
        }
        grid.innerHTML = items.map(b => {
            const cateName = categoriesMap[String(b.category_id)]?.name || `#${b.category_id}`;
            return `
        <tr>
          <td>${b.id}</td>
          <td class="text-truncate" style="max-width:240px">
            <div class="d-flex align-items-center gap-2">
              <img src="${b.image}" onerror="this.src='https://placehold.co/48x64?text=No+Img';" width="32" height="42" class="rounded" alt="">
              <div>
                <div class="fw-semibold">${b.title}</div>
                <div class="small text-secondary">${b.author}</div>
              </div>
            </div>
          </td>
          <td>${b.author}</td>
          <td>${Number(b.price).toLocaleString('vi-VN')}₫</td>
          <td>${b.stock}</td>
          <td>${b.sold}</td>
          <td>${cateName}</td>
          <td>${b.deleted ? '<span class="badge bg-danger">Đã xóa mềm</span>' : '<span class="badge bg-success">Đang hoạt động</span>'}</td>
          <td class="text-end">
            ${b.deleted
                ? `<button class="btn btn-sm btn-success" data-action="restore" data-id="${b.id}">Khôi phục</button>`
                : `<button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${b.id}">Xóa mềm</button>`}
          </td>
        </tr>
      `;
        }).join('');
    }

    btnSearch.addEventListener('click', async ()=>{
        try{ await loadBooks(); }
        catch(err){ showAlert(alertBox, 'danger', err.message); }
    });

    grid.addEventListener('click', async (e)=>{
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const id = btn.getAttribute('data-id');
        const action = btn.getAttribute('data-action');
        try{
            if (action === 'delete'){
                await apiFetch(`/api/books/${id}`, { method: 'DELETE' });
                showAlert(alertBox, 'success', 'Đã xóa mềm sách');
            } else if (action === 'restore'){
                await apiFetch(`/api/books/${id}/restore`, { method: 'PATCH' });
                showAlert(alertBox, 'success', 'Đã khôi phục sách');
            }
            await loadBooks();
        }catch(err){
            showAlert(alertBox, 'danger', err.message);
        }
    });

    const createForm = qs('#createForm');
    const createAlert = qs('#createAlert');
    createForm.addEventListener('submit', async (e)=>{
        e.preventDefault();
        if (!createForm.checkValidity()){
            createForm.classList.add('was-validated');
            return;
        }
        const payload = Object.fromEntries(new FormData(createForm).entries());
        payload.price = Number(payload.price);
        payload.stock = Number(payload.stock);
        payload.sold = Number(payload.sold || 0);
        payload.category_id = Number(payload.category_id);

        try{
            await apiFetch('/api/books', { method:'POST', body: payload });
            showAlert(createAlert, 'success', 'Thêm sách thành công');
            createForm.reset();
            const modal = bootstrap.Modal.getInstance(document.getElementById('createModal'));
            setTimeout(()=> { modal.hide(); loadBooks(); }, 400);
        }catch(err){
            showAlert(createAlert, 'danger', err.message);
        }
    });
    loadBooks().catch(err => showAlert(alertBox, 'danger', err.message));
})();
