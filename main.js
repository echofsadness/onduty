// main.js (แก้ให้เรียกผ่าน CORS proxy)
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

  const fileToDataURL = (file) => new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });

  try {
    Swal.fire({ title: 'กำลังเตรียมข้อมูล...', didOpen: () => Swal.showLoading() });

    const d1 = await fileToDataURL(file1);
    const d2 = await fileToDataURL(file2);

    const fd = new FormData();
    fd.append('action', 'submit');
    fd.append('username', username);
    fd.append('timeIn', timeIn);
    fd.append('timeOut', timeOut);
    fd.append('image1', d1);
    fd.append('image2', d2);

    // --- เปลี่ยนตรงนี้เป็น APPS_SCRIPT_URL ของคุณ ---
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwhxpLk4LPIN3radyQO6mQSkZyGbL5pBzBb60_W4Qt8bmXajGj8XI3FMVipMAozxBjw/exec';
   const proxy = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(APPS_SCRIPT_URL);

const resp = await fetch(proxy, {
  method: 'POST',
  body: fd
});

const json = await resp.json();
console.log(json);

    if (json.status === 'ok' || json.status === 'success') {
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
