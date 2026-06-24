// js/tambah.js
document.getElementById("formAgenda").addEventListener("submit", async function(e) {
    e.preventDefault();
    
    const btn = document.getElementById("btnSubmit");
    btn.innerText = "Menyimpan...";
    btn.disabled = true;

    const data = {
        judul: document.getElementById("judul").value,
        tipe: document.getElementById("tipe").value,
        tanggal: document.getElementById("tanggal").value,
        jam: document.getElementById("jam").value,
        prioritas: document.getElementById("prioritas").value,
        status: document.getElementById("status").value,
        keterangan: document.getElementById("keterangan").value
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        if (result.status === "sukses") {
            alert("Agenda berhasil ditambah!");
            window.location.href = "index.html"; // Balik ke dashboard
        }
    } catch (err) {
        alert("Gagal menyimpan data.");
        btn.innerText = "Simpan Agenda";
        btn.disabled = false;
    }
});