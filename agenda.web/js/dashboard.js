// js/dashboard.js
let agendaData = [];

// Helper Tanggal Biasa
function formatTanggal(tanggalString) {
    if (!tanggalString) return "-";
    const date = new Date(tanggalString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ⏳ LOGIKA BARU: Helper Sisa Waktu (Countdown)
// ⏳ LOGIKA BARU: Jika dibatalkan, jangan berikan peringatan Telat
function getSisaWaktuHTML(tanggalString, status) {
    if (!tanggalString) return '📅 -';
    const tanggalFormat = formatTanggal(tanggalString);
    
    // Jika Selesai ATAU Dibatalkan, tampilkan tanggal biasa saja
    if (status === '✅ Selesai' || status === '❌ Dibatalkan') {
        return `📅 ${tanggalFormat}`;
    }

    const today = new Date(); today.setHours(0, 0, 0, 0); 
    const targetDate = new Date(tanggalString); targetDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((targetDate.getTime() - today.getTime()) / (1000 * 3600 * 24)); 

    if (diffDays < 0) return `<span class="badge badge-telat">⚠️ Telat ${Math.abs(diffDays)} Hari</span>`;
    else if (diffDays === 0) return `<span class="badge badge-hari-ini">🔥 Hari Ini</span>`;
    else if (diffDays === 1) return `<span class="badge badge-besok">⏳ Besok</span>`;
    else return `📅 ${tanggalFormat} <span style="opacity:0.6; font-size:0.9em;">(H-${diffDays})</span>`;
}

// Fungsi Utama
async function renderDashboard() {
    const container = document.getElementById('agenda-container');
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">🔄</div>
            <p>Sedang sinkronisasi data…</p>
        </div>`;

    const data = await fetchAgendaData();
    if (!data) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">❌</div>
                <p>Gagal mengambil data dari server.</p>
            </div>`;
        return;
    }

    agendaData = data;
    updateUI(agendaData);
}

function updateUI(data) {
    const countBelum = data.filter(i => i.status === '⚪ Belum').length;
    const countProgres = data.filter(i => i.status === '⏳ Progres').length;
    const countSelesai = data.filter(i => i.status === '✅ Selesai').length;
    const countBatal = data.filter(i => i.status === '❌ Dibatalkan').length; // Hitung data batal
    
    document.getElementById('countBelum').innerText = countBelum;
    document.getElementById('countProgres').innerText = countProgres;
    document.getElementById('countSelesai').innerText = countSelesai;
    if(document.getElementById('countBatal')) document.getElementById('countBatal').innerText = countBatal;

    // Progress Bar (Tugas yang dibatalkan tidak dihitung sebagai beban/total)
    const totalAktif = data.length - countBatal; 
    const percent = totalAktif > 0 ? Math.round((countSelesai / totalAktif) * 100) : 0;
    
    const bar = document.getElementById('progressBar');
    if(bar) bar.style.width = percent + "%";
    const pText = document.getElementById('percentText');
    if(pText) pText.innerText = percent + "%";

    const activeTab = document.querySelector('.tab-btn.active')?.getAttribute('data-type') || 'aktif';
    switchTab(activeTab);
}

function switchTab(type) {
    const container = document.getElementById('agenda-container');
    
    // LOGIKA FILTER: Yang batal masuk ke tab Riwayat
    const filtered = type === 'aktif' 
        ? agendaData.filter(i => i.status !== '✅ Selesai' && i.status !== '❌ Dibatalkan' && i.judul && String(i.judul).trim() !== "")
        : agendaData.filter(i => (i.status === '✅ Selesai' || i.status === '❌ Dibatalkan') && i.judul && String(i.judul).trim() !== "");

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-type') === type);
    });

    container.innerHTML = filtered.length > 0 ? filtered.map(item => `
        <div class="agenda-card">
            <h3 style="${item.status === '❌ Dibatalkan' ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${item.judul}</h3>
            
            <div class="agenda-meta">
                ${getSisaWaktuHTML(item.tanggal, item.status)} • ⏰ ${item.jam?.substring(0,5) || '-'}
            </div>
            
            <div style="margin-bottom: 12px;">
                <span class="badge badge-status">${item.status}</span>
                <span class="badge badge-${item.prioritas.toLowerCase()}">${item.prioritas}</span>
            </div>
            
            ${type === 'aktif' ? `
            <select class="status-dropdown" onchange="updateStatus('${item.id}', this.value)">
                <option value="⚪ Belum" ${item.status === '⚪ Belum' ? 'selected' : ''}>⚪ Belum Mulai</option>
                <option value="⏳ Progres" ${item.status === '⏳ Progres' ? 'selected' : ''}>⏳ Sedang Jalan</option>
                <option value="✅ Selesai" ${item.status === '✅ Selesai' ? 'selected' : ''}>✅ Selesai</option>
                <option value="❌ Dibatalkan" ${item.status === '❌ Dibatalkan' ? 'selected' : ''}>❌ Dibatalkan</option>
            </select>
            ` : ''}
            
            <div class="btn-row">
                <button class="btn btn-edit" onclick="handleEdit('${item.id}', '${item.judul}')">✏️ Edit</button>
                <button class="btn btn-delete" onclick="handleDelete('${item.id}')">🗑️ Hapus</button>
            </div>
        </div>
    `).join('') : `
        <div class="empty-state">
            <div class="empty-icon">☕</div>
            <p>Tidak ada tugas di sini. Waktunya bersantai!</p>
        </div>`;
}
// === FITUR ANTI-DELAY ===
async function updateStatus(id, statusBaru) {
    const index = agendaData.findIndex(item => item.id === id);
    if (index !== -1) {
        agendaData[index].status = statusBaru;
        updateUI(agendaData); 
    }
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "updateStatus", id: id, status: statusBaru }) });
}

async function handleEdit(id, judulLama) {
    const judulBaru = prompt("Ubah judul agenda:", judulLama);
    if (!judulBaru) return;
    
    const index = agendaData.findIndex(item => item.id === id);
    if (index !== -1) {
        agendaData[index].judul = judulBaru;
        updateUI(agendaData);
    }
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "edit", id: id, judul: judulBaru }) });
}

async function handleDelete(id) {
    if (!confirm("Hapus agenda ini? Data tidak dapat dikembalikan.")) return;
    
    agendaData = agendaData.filter(item => item.id !== id);
    updateUI(agendaData);
    
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "delete", id: id }) });
}

// Jalankan
renderDashboard();