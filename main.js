// scripts/main.js (แก้เป็นแบบนี้)
document.getElementById('dutyForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const timeIn = document.getElementById('timeIn').value;
  const timeOut = document.getElementById('timeOut').value;
  const file1 = document.getElementById('evidence1').files[0];
  const file2 = document.getElementById('evidence2').files[0];

  if (!username || !timeIn || !timeOut || !file1 || !file2) {
    Swal.fire('ผิดพลาด','กรุณากรอกข้อมูลให้ครบ','error');
    return;
  }

  // ฟังก์ชันช่วยแปลงไฟล์เป็น base64 (dataURL)
  const fileToDataURL = (file) => new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });

  try {
    Swal.fire({ title: 'กำลังเตรียมข้อมูล...', didOpen: () => Swal.showLoading() });

    const dataurl1 = await fileToDataURL(file1); // "data:image/png;base64,...."
    const dataurl2 = await fileToDataURL(file2);

    // สร้าง FormData — note: ไม่ตั้ง header เอง
    const fd = new FormData();
    fd.append('action', 'submit');
    fd.append('username', username);
    fd.append('timeIn', timeIn);
    fd.append('timeOut', timeOut);
    // ใส่ base64 เป็นสตริง (เป็น field ธรรมดา) — ป้องกัน preflight
    fd.append('image1', dataurl1);
    fd.append('image2', dataurl2);

    // ส่งไป Apps Script (ไม่ตั้ง headers => browser sets multipart/form-data)
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzHJ8KLLLAoqvYtBDskldvFnw1E1VdG_y2xrVXce7oUfP-un9JezsZ3a2CD5CoflBOV/exec';
    const resp = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: fd,
    });

    const json = await resp.json();
    Swal.close();

    if (json.status === 'success' || json.status === 'ok') {
      Swal.fire('ส่งสำเร็จ', json.message || 'เรียบร้อย', 'success');
      e.target.reset();
    } else {
      Swal.fire('ผิดพลาด', json.message || 'ไม่สามารถส่งได้', 'error');
    }
  } catch (err) {
    console.error(err);
    Swal.fire('ผิดพลาด', 'เกิดข้อผิดพลาดขณะส่งข้อมูล', 'error');
  }
});

