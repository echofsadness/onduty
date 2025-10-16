// scripts/main.js
const form = document.getElementById('dutyForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // validate: 2 images
  const ev1 = document.getElementById('evidence1').files[0];
  const ev2 = document.getElementById('evidence2').files[0];
  if (!ev1 || !ev2){
    Swal.fire('ผิดพลาด','กรุณาอัปโหลดรูปทั้งหมด 2 รูป','error');
    return;
  }

  // read base64
  const toBase64 = file => new Promise((res,rej)=>{
    const reader = new FileReader();
    reader.onload = () => res(reader.result.split(',')[1]);
    reader.onerror = e => rej(e);
    reader.readAsDataURL(file);
  });

  try{
    const b1 = await toBase64(ev1);
    const b2 = await toBase64(ev2);

    // สร้าง payload
    const payload = {
      action: 'submit',
      username: document.getElementById('username').value.trim(),
      timeIn: document.getElementById('timeIn').value,
      timeOut: document.getElementById('timeOut').value,
      evidence1: {name: ev1.name, data: b1},
      evidence2: {name: ev2.name, data: b2},
      timestamp: new Date().toISOString()
    };

    // ยืนยันด้วย SweetAlert2
    const result = await Swal.fire({
      title: 'ยืนยันการส่ง?',
      text: 'ข้อมูลจะถูกส่งไปให้แอดมินตรวจสอบ',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ใช่ ส่งเลย',
      cancelButtonText: 'ยกเลิก'
    });

    if (!result.isConfirmed) return;

    // แสดง loading
    Swal.fire({ title: 'กำลังส่ง...', didOpen: ()=> Swal.showLoading() });

    // --- เปลี่ยน URL นี้เป็น Google Apps Script Web App URL ของคุณ ---
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzHJ8KLLLAoqvYtBDskldvFnw1E1VdG_y2xrVXce7oUfP-un9JezsZ3a2CD5CoflBOV/exec';

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const respJson = await response.json();
    Swal.close();

    if (respJson.status === 'ok'){
      Swal.fire('ส่งสำเร็จ','ข้อมูลถูกส่งเรียบร้อยแล้ว','success');
      form.reset();
    } else {
      Swal.fire('ผิดพลาด','ไม่สามารถส่งข้อมูลได้: ' + (respJson.message || 'unknown'),'error');
    }

  }catch(err){
    console.error(err);
    Swal.fire('ผิดพลาด','เกิดข้อผิดพลาดขณะอ่านไฟล์หรือส่งข้อมูล','error');
  }
});
