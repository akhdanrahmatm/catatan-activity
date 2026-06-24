function updateStats(data) {
    document.getElementById('countBelum').innerText = data.filter(i => i.status === '⚪ Belum').length;
    document.getElementById('countProgres').innerText = data.filter(i => i.status === '⏳ Progres').length;
    document.getElementById('countSelesai').innerText = data.filter(i => i.status === '✅ Selesai').length;
    
    const total = data.length;
    const selesaiCount = data.filter(i => i.status === '✅ Selesai').length;
    const percent = total > 0 ? Math.round((selesaiCount / total) * 100) : 0;
    
    const bar = document.getElementById('progressBar');
    if(bar) bar.style.width = percent + "%";
    document.getElementById('percentText').innerText = percent + "%";
}