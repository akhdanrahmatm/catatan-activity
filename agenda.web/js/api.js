// Ganti bagian URL di bawah dengan URL yang Anda berikan tadi
const API_URL = 'https://script.google.com/macros/s/AKfycbwmFXy1BC7Yef2Wh0IH2yqonncfFgY3WpiD9m1xWKpnVDUTSt-ydgZ1dPIZ8XyGUrSMeQ/exec';

async function fetchAgendaData() {
    try {
        const response = await fetch(API_URL);
        return await response.json();
    } catch (error) {
        console.error("Gagal mengambil data:", error);
        return [];
    }
}