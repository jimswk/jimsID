const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxBoGSMnhtHkjHFda577znGG4Qdorplo_ubPTWXou4h-7BlprfQHP_ofJ49JFnKtoNl2A/exec'; // Replace with your Web App URL

function showLoading(show) {
  document.getElementById('loading-overlay').style.display = show ? 'flex' : 'none';
}

function showModal(modalId, message) {
  document.getElementById(`${modalId}-message`).textContent = message;
  document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

function showSection(section) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.section-content').forEach(content => content.classList.remove('active'));
  document.querySelector(`.tab[onclick="showSection('${section}')"]`).classList.add('active');
  document.getElementById(`${section}-section`).classList.add('active');
}

async function login() {
  const ic = document.getElementById('login-ic').value;
  const password = document.getElementById('login-password').value;
  showLoading(true);
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ function: 'verifyLogin', args: [ic, password] })
    });
    const result = await response.json();
    if (result.success) {
      document.getElementById('login-section').classList.remove('active');
      document.getElementById('main-section').classList.add('active');
      showNotification(`Selamat datang, ${result.name}!`);
      populateRegisteredList();
    } else {
      showModal('error-modal', 'No. Kad Pengenalan atau Kata Laluan tidak sah');
    }
  } catch (error) {
    showModal('error-modal', 'Ralat: ' + error.message);
  } finally {
    showLoading(false);
  }
}

function logout() {
  document.getElementById('main-section').classList.remove('active');
  document.getElementById('login-section').classList.add('active');
  document.getElementById('login-ic').value = '';
  document.getElementById('login-password').value = '';
  showNotification('Anda telah log keluar');
}

async function checkUniqueId() {
  const uniqueId = document.getElementById('register-unique-id').value;
  if (!uniqueId.match(/^\d{4}$/)) {
    document.getElementById('unique-id-status').textContent = 'Sila masukkan 4 digit nombor';
    return;
  }
  showLoading(true);
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ function: 'checkUniqueIdAvailability', args: [uniqueId] })
    });
    const result = await response.json();
    document.getElementById('unique-id-status').textContent = result.message;
  } catch (error) {
    showModal('error-modal', 'Ralat: ' + error.message);
  } finally {
    showLoading(false);
  }
}

async function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function saveRegistration() {
  const uniqueId = 'JIMSWK' + document.getElementById('register-unique-id').value;
  const name = document.getElementById('register-name').value;
  const displayName = document.getElementById('register-display-name').value;
  const icNumber = document.getElementById('register-ic').value;
  const phone = document.getElementById('register-phone').value;
  const position = document.getElementById('register-position').value;
  const status = document.getElementById('register-status').value;
  const emergencyContact = document.getElementById('register-emergency-contact').value;
  const emergencyPhone = document.getElementById('register-emergency-phone').value;
  const medicalCondition = document.getElementById('register-medical-condition').value;
  const photoInput = document.getElementById('register-photo');
  let photo = null;

  if (photoInput.files[0]) {
    if (photoInput.files[0].size > 2 * 1024 * 1024) {
      showModal('error-modal', 'Saiz foto melebihi 2MB');
      return;
    }
    photo = {
      data: await convertToBase64(photoInput.files[0]),
      type: photoInput.files[0].type,
      name: photoInput.files[0].name
    };
  }

  const data = {
    uniqueId,
    name,
    displayName,
    icNumber,
    phone,
    position,
    status,
    emergencyContact,
    emergencyPhone,
    medicalCondition,
    photo
  };

  showLoading(true);
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ function: 'saveRegistration', args: [data] })
    });
    const result = await response.json();
    if (result.uniqueId) {
      showNotification('Pendaftaran berjaya!');
      resetRegisterForm();
      populateRegisteredList();
    } else {
      showModal('error-modal', result.error || 'Gagal menyimpan pendaftaran');
    }
  } catch (error) {
    showModal('error-modal', 'Ralat: ' + error.message);
  } finally {
    showLoading(false);
  }
}

function resetRegisterForm() {
  document.getElementById('register-form').reset();
  document.getElementById('unique-id-status').textContent = '';
  document.getElementById('register-display-name').innerHTML = '<option value="">Pilih Nama</option>';
}

async function searchRecord() {
  const searchValue = document.getElementById('update-search').value;
  showLoading(true);
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ function: 'searchRecord', args: [searchValue] })
    });
    const result = await response.json();
    if (result) {
      document.getElementById('update-unique-id').value = result.uniqueId;
      document.getElementById('update-name').value = result.name;
      document.getElementById('update-display-name').innerHTML = `<option value="${result.displayName}">${result.displayName}</option>`;
      document.getElementById('update-ic').value = result.icNumber;
      document.getElementById('update-phone').value = result.phone;
      document.getElementById('update-position').value = result.position;
      document.getElementById('update-status').value = result.status;
      document.getElementById('update-emergency-contact').value = result.emergencyContact;
      document.getElementById('update-emergency-phone').value = result.emergencyPhone;
      document.getElementById('update-medical-condition').value = result.medicalCondition;
      document.getElementById('update-old-photo').src = result.photoUrl || '';
    } else {
      showModal('error-modal', 'Rekod tidak ditemukan');
    }
  } catch (error) {
    showModal('error-modal', 'Ralat: ' + error.message);
  } finally {
    showLoading(false);
  }
}

async function updateRecord() {
  const uniqueId = document.getElementById('update-unique-id').value;
  const name = document.getElementById('update-name').value;
  const displayName = document.getElementById('update-display-name').value;
  const icNumber = document.getElementById('update-ic').value;
  const phone = document.getElementById('update-phone').value;
  const position = document.getElementById('update-position').value;
  const status = document.getElementById('update-status').value;
  const emergencyContact = document.getElementById('update-emergency-contact').value;
  const emergencyPhone = document.getElementById('update-emergency-phone').value;
  const medicalCondition = document.getElementById('update-medical-condition').value;
  const photoInput = document.getElementById('update-photo');
  let photo = null;

  if (photoInput.files[0]) {
    if (photoInput.files[0].size > 2 * 1024 * 1024) {
      showModal('error-modal', 'Saiz foto melebihi 2MB');
      return;
    }
    photo = {
      data: await convertToBase64(photoInput.files[0]),
      type: photoInput.files[0].type,
      name: photoInput.files[0].name
    };
  }

  const record = {
    uniqueId,
    name,
    displayName,
    icNumber,
    phone,
    position,
    status,
    emergencyContact,
    emergencyPhone,
    medicalCondition,
    photo
  };

  showLoading(true);
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ function: 'updateRecord', args: [record] })
    });
    const result = await response.json();
    if (result.success) {
      showNotification('Maklumat berjaya dikemaskini!');
      populateRegisteredList();
    } else {
      showModal('error-modal', result.error || 'Gagal mengemaskini rekod');
    }
  } catch (error) {
    showModal('error-modal', 'Ralat: ' + error.message);
  } finally {
    showLoading(false);
  }
}

async function reprintForUpdate() {
  const uniqueId = document.getElementById('update-unique-id').value;
  showLoading(true);
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ function: 'reprintForUpdate', args: [uniqueId] })
    });
    const result = await response.json();
    if (result.success) {
      showNotification('Kad berjaya dicetak semula!');
    } else {
      showModal('error-modal', result.error || 'Gagal mencetak semula kad');
    }
  } catch (error) {
    showModal('error-modal', 'Ralat: ' + error.message);
  } finally {
    showLoading(false);
  }
}

async function searchLostRecord() {
  const searchValue = document.getElementById('lost-search').value;
  showLoading(true);
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ function: 'searchRecord', args: [searchValue] })
    });
    const result = await response.json();
    if (result) {
      document.getElementById('lost-unique-id').textContent = result.uniqueId;
      document.getElementById('lost-name').textContent = result.name;
      document.getElementById('lost-ic').textContent = result.icNumber;
      document.getElementById('lost-phone').textContent = result.phone;
      document.getElementById('lost-position').textContent = result.position;
      document.getElementById('lost-status').textContent = result.status;
      document.getElementById('lost-emergency-contact').textContent = result.emergencyContact;
      document.getElementById('lost-emergency-phone').textContent = result.emergencyPhone;
    } else {
      showModal('error-modal', 'Rekod tidak ditemukan');
    }
  } catch (error) {
    showModal('error-modal', 'Ralat: ' + error.message);
  } finally {
    showLoading(false);
  }
}

async function reportLost() {
  const uniqueId = document.getElementById('lost-unique-id').textContent;
  showLoading(true);
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ function: 'reportLost', args: [uniqueId] })
    });
    const result = await response.json();
    if (result.success) {
      showNotification('Kehilangan dilaporkan!');
      populateRegisteredList();
    } else {
      showModal('error-modal', result.error || 'Gagal melaporkan kehilangan');
    }
  } catch (error) {
    showModal('error-modal', 'Ralat: ' + error.message);
  } finally {
    showLoading(false);
  }
}

async function populateRegisteredList() {
  showLoading(true);
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ function: 'getRegisteredList', args: [] })
    });
    const result = await response.json();
    const tbody = document.getElementById('registered-table');
    tbody.innerHTML = '';
    result.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.name}</td>
        <td>${item.uniqueId}</td>
        <td>${item.position}</td>
        <td>${item.printCount}</td>
        <td>${item.lostStatus}</td>
        <td><button onclick="reprintLostCard('${item.uniqueId}')">Cetak Semula</button></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    showModal('error-modal', 'Ralat: ' + error.message);
  } finally {
    showLoading(false);
  }
}

async function reprintLostCard(uniqueId) {
  showLoading(true);
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ function: 'reprintLostCard', args: [uniqueId] })
    });
    const result = await response.json();
    if (result.success) {
      showNotification('Kad berjaya dicetak semula!');
      populateRegisteredList();
    } else {
      showModal('error-modal', result.error || 'Gagal mencetak semula kad');
    }
  } catch (error) {
    showModal('error-modal', 'Ralat: ' + error.message);
  } finally {
    showLoading(false);
  }
}

async function changePassword() {
  const currentPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  if (newPassword !== confirmPassword) {
    showModal('error-modal', 'Kata laluan baru dan pengesahan tidak sepadan');
    return;
  }
  const data = {
    username: document.getElementById('login-ic').value, // Assume stored from login
    currentPassword,
    newPassword
  };
  showLoading(true);
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ function: 'changePassword', args: [data] })
    });
    const result = await response.json();
    if (result.success) {
      showNotification('Kata laluan berjaya ditukar!');
      document.getElementById('password-form').reset();
    } else {
      showModal('error-modal', result.error || 'Gagal menukar kata laluan');
    }
  } catch (error) {
    showModal('error-modal', 'Ralat: ' + error.message);
  } finally {
    showLoading(false);
  }
}

async function previewCard() {
  const uniqueId = document.getElementById('preview-search').value;
  showLoading(true);
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ function: 'searchRecord', args: [uniqueId] })
    });
    const result = await response.json();
    if (result) {
      const frontResponse = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ function: 'serveFile', args: [result.frontPdfId] })
      });
      const frontResult = await frontResponse.json();
      const backResponse = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ function: 'serveFile', args: [result.backPdfId] })
      });
      const backResult = await backResponse.json();
      document.getElementById('preview-front').src = `data:application/pdf;base64,${frontResult.base64}`;
      document.getElementById('preview-back').src = `data:application/pdf;base64,${backResult.base64}`;
      document.getElementById('preview-content').style.display = 'block';
      document.getElementById('preview-empty').style.display = 'none';
    } else {
      document.getElementById('preview-content').style.display = 'none';
      document.getElementById('preview-empty').style.display = 'block';
    }
  } catch (error) {
    showModal('error-modal', 'Ralat: ' + error.message);
  } finally {
    showLoading(false);
  }
}

async function downloadCard(side) {
  const img = document.getElementById(`preview-${side}`);
  if (img.src) {
    const link = document.createElement('a');
    link.href = img.src;
    link.download = `kad_${side}.pdf`;
    link.click();
  }
}

function showPreview() {
  showSection('preview');
}

function backToMain() {
  showSection('register');
}

let stream = null;

async function openCamera(section) {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.getElementById('camera-video');
    video.srcObject = stream;
    document.getElementById('camera-modal').style.display = 'flex';
  } catch (error) {
    showModal('error-modal', 'Gagal membuka kamera: ' + error.message);
  }
}

function capturePhoto(section) {
  const video = document.getElementById('camera-video');
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  const dataUrl = canvas.toDataURL('image/jpeg');
  const blob = dataURLtoBlob(dataUrl);
  const file = new File([blob], `${section}_photo.jpg`, { type: 'image/jpeg' });
  const input = document.getElementById(`${section}-photo`);
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  input.files = dataTransfer.files;
  closeCamera();
}

function closeCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  document.getElementById('camera-modal').style.display = 'none';
}

function dataURLtoBlob(dataUrl) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

function showNotification(message) {
  showModal('notification-modal', message);
}

let confirmCallback = null;

function confirmAction() {
  if (confirmCallback) confirmCallback();
  closeModal('confirmation-modal');
}

function cancelConfirmation() {
  closeModal('confirmation-modal');
}
