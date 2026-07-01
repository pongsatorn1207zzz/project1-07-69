/* ============================================================
   main.js  –  JavaScript ร่วมกันทุกหน้า
============================================================ */

/* ---------- บันทึกฟอร์ม ---------- */
function saveForm(dataObj, redirectUrl) {
    fetch('/api/save-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataObj)
    })
    .then(async r => {
        if (r.status === 401) { window.location.href = '/login'; return; }
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.message || 'ไม่สามารถบันทึกได้');
        showToast(d.message || 'บันทึกแล้ว ✅');
        if (redirectUrl) setTimeout(() => window.location.href = redirectUrl, 900);
    })
    .catch(e => showToast('เกิดข้อผิดพลาด: ' + e.message, 'error'));
}

/* ---------- บันทึกจาก <form id="editForm"> ---------- */
function handleSubmit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(document.getElementById('editForm')));

    // ตรวจสอบช่องที่จำเป็น
    const checks = [
        { key: 'from',     label: 'จาก' },
        { key: 'to',       label: 'ถึง' },
        { key: 'number',   label: 'เลขที่' },
        { key: 'date',     label: 'วันที่' },
        { key: 'subject',  label: 'เรื่อง' },
        { key: 'receiver', label: 'เรียน' },
    ];

    for (const c of checks) {
        if (!data[c.key] || !data[c.key].trim()) {
            showToast(`กรุณากรอก "${c.label}" ก่อนบันทึก`, 'error');
            const el = document.querySelector(`[name="${c.key}"]`);
            if (el) {
                el.focus();
                el.style.borderColor = '#e53935';
                setTimeout(() => el.style.borderColor = '', 2000);
            }
            return;
        }
    }

    saveForm(data, '/main');
}

/* ---------- Toast notification ---------- */
function showToast(msg, type = 'success') {
    let toast = document.getElementById('__toast__');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = '__toast__';
        Object.assign(toast.style, {
            position: 'fixed', bottom: '28px', right: '28px',
            padding: '14px 24px', borderRadius: '12px',
            fontFamily: 'THSarabunBold', fontSize: '16pt',
            color: '#fff', zIndex: '9999',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            transition: 'opacity 0.4s', opacity: '0',
            pointerEvents: 'none', maxWidth: '320px'
        });
        document.body.appendChild(toast);
    }
    toast.style.background = type === 'error'
        ? 'linear-gradient(135deg,#b71c1c,#e53935)'
        : 'linear-gradient(135deg,#2e7d32,#43a047)';
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast.__timer);
    toast.__timer = setTimeout(() => toast.style.opacity = '0', 2800);
}

/* ---------- ยืนยันก่อนออกจากระบบ ---------- */
function confirmLogout(e) {
    if (!confirm('ออกจากระบบ?')) e.preventDefault();
}

/* ---------- Auto-resize textarea ---------- */
function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
}

/* ---------- Init เมื่อ DOM พร้อม ---------- */
document.addEventListener('DOMContentLoaded', () => {
    // auto-resize textarea ทุกตัว
    document.querySelectorAll('textarea').forEach(ta => {
        autoResize(ta);
        ta.addEventListener('input', () => autoResize(ta));
    });

    // ปุ่ม logout
    const logoutBtn = document.querySelector('a[href="/logout"]');
    if (logoutBtn) logoutBtn.addEventListener('click', confirmLogout);

    // highlight เมนูที่ active
    const path = window.location.pathname;
    document.querySelectorAll('.menu a').forEach(a => {
        if (a.getAttribute('href') === path) {
            const btn = a.querySelector('button');
            if (btn) {
                btn.style.background = 'linear-gradient(180deg,#9c27b0 0%,#6a0080 100%)';
                btn.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.2)';
            }
        }
    });

    // reset สีขอบ input เมื่อผู้ใช้กลับมาแก้ไข
    document.querySelectorAll('input, textarea').forEach(el => {
        el.addEventListener('input', () => {
            el.style.borderColor = '';
        });
    });
});