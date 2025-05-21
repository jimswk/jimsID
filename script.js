const API_URL = 'https://script.google.com/macros/s/AKfycbwcnDxJ_aLuk-U90qfx8LCetqEfkUn7zvH0TOD9wA_FghqjRfLbdZsWC742yhRgkScy/exec'; // Replace with your Google Apps Script Web App URL

// Utility Functions
function showModal(modalId, message = '') {
  document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
  const modal = document.getElementById(modalId);
  modal.classList.remove('hidden');
  if (message && modalId === 'errorModal') document.getElementById('errorMessage').textContent = message;
  if (message && modalId === 'successModal') document.getElementById('successMessage').textContent = message;
  if (message && modalId === 'confirmationModal') document.getElementById('confirmationMessage').textContent = message;
}

function hideModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

function toggleTabs(activeTab) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active', 'bg-blue-500', 'text-white'));
  document.getElementById(`${activeTab}Section`).classList.add('active');
  document.getElementById(`${activeTab}Tab`).classList.add('active', 'bg-blue-500', 'text-white');
}

function clearForm(formId) {
  document.getElementById(formId).reset();
  if (formId === 'registerSection') {
    document.getElementById('idAvailability').textContent = '';
    document.getElementById('displayName').innerHTML = '<option value="">Pilih Nama</option>';
  }
  if (formId === 'updateSection') {
    document.getElementById('updateForm').classList.add('hidden');
    document.getElementById('updatePhotoPreview').src = '';
  }
}

// API Call Wrapper
async function apiCall(functionName, data) {
  showModal('loadingModal');
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ functionName, data }),
    });
    const result = await response.json();
    hideModal('loadingModal');
    if (result.error) throw new Error(result.error);
    return result.data;
  } catch (error) {
    hideModal('loadingModal');
    showModal('errorModal', error.message);
    throw error;
  }
}

// Camera Functionality
let stream = null;
async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    document.getElementById('video').srcObject = stream;
    showModal('cameraModal');
  } catch (error) {
    showModal('errorModal', 'Gagal mengakses kamera: ' + error.message);
  }
}

function capturePhoto() {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  const dataUrl = canvas.toDataURL('image/jpeg');
  document.getElementById('photo').files = dataURLtoFile(dataUrl, 'photo.jpg');
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  hideModal('cameraModal');
}

function dataURLtoFile(dataUrl, filename) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}

// Login
document.getElementById('loginButton').addEventListener('click', async () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  try {
    const result = await apiCall('verifyLogin', { username, password });
    if (result.success) {
      document.getElementById('loginSection').classList.add('hidden');
      document.getElementById('mainSection').classList.remove('hidden');
      toggleTabs('register');
    } else {
      showModal('errorModal', 'No. Kad Pengenalan atau kata laluan tidak sah');
    }
  } catch (error) {
    // Error handled in apiCall
  }
});

// Logout
document.getElementById('logoutButton').addEventListener('click', () => {
  document.getElementById('mainSection').classList.add('hidden');
  document.getElementById('loginSection').classList.remove('hidden');
  clearForm('registerSection');
  clearForm('updateSection');
});

// Tab Navigation
document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    const tab = button.id.replace('Tab', '');
    toggleTabs(tab);
    if (tab === 'lost') loadRegisteredList();
  });
});

// Check ID Availability
document.getElementById('checkIdButton').addEventListener('click', async () => {
  const uniqueId = document.getElementById('uniqueId').value;
  try {
    const result = await apiCall('checkUniqueIdAvailability', uniqueId);
    document.getElementById('idAvailability').textContent = result.message;
    document.getElementById('idAvailability').classList.toggle('text-green-500', result.available);
    document.getElementById('idAvailability').classList.toggle('text-red-500', !result.available);
  } catch (error) {
    // Error handled in apiCall
  }
});

// Save Registration
document.getElementById('saveRegistrationButton').addEventListener('click', async () => {
  const photo = document.getElementById('photo').files[0];
  if (photo && photo.size > 2 * 1024 * 1024) {
    showModal('errorModal', 'Saiz foto melebihi 2MB');
    return;
  }
  const reader = new FileReader();
  reader.onload = async () => {
    const data = {
      uniqueId: 'JIMSWK' + document.getElementById('uniqueId').value,
      name: document.getElementById('name').value,
      displayName: document.getElementById('displayName').value,
      icNumber: document.getElementById('icNumber').value,
      phone: document.getElementById('phone').value,
      position: document.getElementById('position').value,
      status: document.getElementById('status').value,
      emergencyContact: document.getElementById('emergencyContact').value,
      emergencyPhone: document.getElementById('emergencyPhone').value,
      medicalCondition: document.getElementById('medicalCondition').value,
      photo: photo ? { data: reader.result.split(',')[1], type: photo.type } : null,
    };
    try {
      const result = await apiCall('saveRegistration', data);
      showModal('successModal', `Pendaftaran berjaya! ID Kad: ${result.uniqueId}`);
      clearForm('registerSection');
    } catch (error) {
      // Error handled in apiCall
    }
  };
  if (photo) reader.readAsDataURL(photo);
  else showModal('errorModal', 'Gambar diperlukan untuk pendaftaran baru');
});

// Reset Registration Form
document.getElementById('resetRegistrationButton').addEventListener('click', () => clearForm('registerSection'));

// Camera Handlers
document.getElementById('capturePhotoButton').addEventListener('click', startCamera);
document.getElementById('updateCapturePhotoButton').addEventListener('click', startCamera);
document.getElementById('captureButton').addEventListener('click', capturePhoto);
document.getElementById('cancelCapture').addEventListener('click', () => {
  if (stream) stream.getTracks().forEach(track => track.stop());
  hideModal('cameraModal');
});

// Update Record Search
document.getElementById('searchUpdateButton').addEventListener('click', async () => {
  const searchValue = document.getElementById('searchUpdate').value;
  try {
    const record = await apiCall('searchRecord', searchValue);
    if (record) {
      document.getElementById('updateForm').classList.remove('hidden');
      document.getElementById('updateUniqueId').value = record.uniqueId;
      document.getElementById('updateName').value = record.name;
      document.getElementById('updateDisplayName').innerHTML = `<option value="${record.displayName}">${record.displayName}</option>`;
      document.getElementById('updateIcNumber').value = record.icNumber;
      document.getElementById('updatePhone').value = record.phone;
      document.getElementById('updatePosition').value = record.position;
      document.getElementById('updateStatus').value = record.status;
      document.getElementById('updateEmergencyContact').value = record.emergencyContact;
      document.getElementById('updateEmergencyPhone').value = record.emergencyPhone;
      document.getElementById('updateMedicalCondition').value = record.medicalCondition;
      document.getElementById('updatePhotoPreview').src = record.photoUrl;
    } else {
      showModal('errorModal', 'Rekod tidak ditemukan');
    }
  } catch (error) {
    // Error handled in apiCall
  }
});

// Update Record
document.getElementById('updateRecordButton').addEventListener('click', async () => {
  const photo = document.getElementById('updatePhoto').files[0];
  if (photo && photo.size > 2 * 1024 * 1024) {
    showModal('errorModal', 'Saiz foto melebihi 2MB');
    return;
  }
  const reader = new FileReader();
  reader.onload = async () => {
    const data = {
      uniqueId: document.getElementById('updateUniqueId').value,
      name: document.getElementById('updateName').value,
      displayName: document.getElementById('updateDisplayName').value,
      icNumber: document.getElementById('updateIcNumber').value,
      phone: document.getElementById('updatePhone').value,
      position: document.getElementById('updatePosition').value,
      status: document.getElementById('updateStatus').value,
      emergencyContact: document.getElementById('updateEmergencyContact').value,
      emergencyPhone: document.getElementById('updateEmergencyPhone').value,
      medicalCondition: document.getElementById('updateMedicalCondition').value,
      photo: photo ? { data: reader.result.split(',')[1], type: photo.type } : null,
    };
    try {
      const result = await apiCall('updateRecord', data);
      showModal('successModal', `Kemaskini berjaya! ID Kad: ${result.uniqueId}`);
      clearForm('updateSection');
    } catch (error) {
      // Error handled in apiCall
    }
  };
  if (photo) reader.readAsDataURL(photo);
  else reader.onload();
});

// Load Registered List
async function loadRegisteredList() {
  try {
    const list = await apiCall('getRegisteredList', {});
    const tbody = document.querySelector('#registeredList tbody');
    tbody.innerHTML = '';
    list.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="border px-4 py-2">${item.name}</td>
        <td class="border px-4 py-2">${item.uniqueId}</td>
        <td class="border px-4 py-2">${item.position}</td>
        <td class="border px-4 py-2">${item.printCount}</td>
        <td class="border px-4 py-2">${item.lostStatus}</td>
        <td class="border px-4 py-2">
          <button class="reprintButton bg-blue-500 text-white px-2 py-1 rounded" data-uniqueid="${item.uniqueId}">Cetak Semula</button>
        </td>
      `;
      tbody.appendChild(row);
    });
    document.querySelectorAll('.reprintButton').forEach(button => {
      button.addEventListener('click', () => {
        const uniqueId = button.dataset.uniqueid;
        showModal('confirmationModal', `Adakah anda pasti ingin mencetak semula kad untuk ${uniqueId}?`);
        document.getElementById('confirmConfirmation').onclick = () => reprintLostCard(uniqueId);
      });
    });
  } catch (error) {
    // Error handled in apiCall
  }
}

// Report Lost Card
document.getElementById('searchLostButton').addEventListener('click', async () => {
  const searchValue = document.getElementById('searchLost').value;
  try {
    const record = await apiCall('searchRecord', searchValue);
    if (record) {
      document.getElementById('lostCardInfo').classList.remove('hidden');
      document.getElementById('lostUniqueId').textContent = record.uniqueId;
      document.getElementById('lostName').textContent = record.name;
      document.getElementById('lostIcNumber').textContent = record.icNumber;
      document.getElementById('lostPhone').textContent = record.phone;
      document.getElementById('lostPosition').textContent = record.position;
      document.getElementById('lostStatus').textContent = record.status;
      document.getElementById('lostEmergencyContact').textContent = record.emergencyContact;
      document.getElementById('lostEmergencyPhone').textContent = record.emergencyPhone;
    } else {
      showModal('errorModal', 'Rekod tidak ditemukan');
    }
  } catch (error) {
    // Error handled in apiCall
  }
});

document.getElementById('reportLostButton').addEventListener('click', async () => {
  const uniqueId = document.getElementById('lostUniqueId').textContent;
  showModal('confirmationModal', `Adakah anda pasti ingin melaporkan kad ${uniqueId} sebagai hilang?`);
  document.getElementById('confirmConfirmation').onclick = async () => {
    try {
      await apiCall('reportLost', uniqueId);
      showModal('successModal', 'Kehilangan dilaporkan dengan jayanya');
      document.getElementById('lostCardInfo').classList.add('hidden');
      loadRegisteredList();
    } catch (error) {
      // Error handled in apiCall
    }
  };
});

// Reprint Lost Card
async function reprintLostCard(uniqueId) {
  try {
    const result = await apiCall('reprintLostCard', uniqueId);
    showModal('successModal', `Kad dicetak semula! ID Kad Baru: ${result.newUniqueId}`);
    loadRegisteredList();
  } catch (error) {
    // Error handled in apiCall
  }
}

// Change Password
document.getElementById('changePasswordButton').addEventListener('click', async () => {
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmNewPassword = document.getElementById('confirmNewPassword').value;
  if (newPassword !== confirmNewPassword) {
    showModal('errorModal', 'Kata laluan baru tidak sepadan');
    return;
  }
  try {
    await apiCall('changePassword', {
      username: document.getElementById('username').value, // Assumes username is stored or re-entered
      currentPassword,
      newPassword,
    });
    showModal('successModal', 'Kata laluan ditukar dengan jayanya');
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
  } catch (error) {
    // Error handled in apiCall
  }
});

// Preview Card
document.getElementById('searchPreviewButton').addEventListener('click', async () => {
  const searchValue = document.getElementById('searchPreview').value;
  try {
    const result = await apiCall('searchPreview', searchValue);
    if (result) {
      document.getElementById('previewContent').classList.remove('hidden');
      document.getElementById('noCardFound').classList.add('hidden');
      const frontUrl = await apiCall('serveFile', result.frontPdfId);
      const backUrl = await apiCall('serveFile', result.backPdfId);
      document.getElementById('frontPreview').src = `data:application/pdf;base64,${frontUrl}`;
      document.getElementById('backPreview').src = `data:application/pdf;base64,${backUrl}`;
      document.getElementById('downloadFrontButton').onclick = () => downloadFile(frontUrl, `${result.uniqueId}_Front.pdf`);
      document.getElementById('downloadBackButton').onclick = () => downloadFile(backUrl, `${result.uniqueId}_Back.pdf`);
    } else {
      document.getElementById('previewContent').classList.add('hidden');
      document.getElementById('noCardFound').classList.remove('hidden');
    }
  } catch (error) {
    // Error handled in apiCall
  }
});

function downloadFile(base64, filename) {
  const link = document.createElement('a');
  link.href = `data:application/pdf;base64,${base64}`;
  link.download = filename;
  link.click();
}

// Modal Close Handlers
document.getElementById('closeErrorModal').addEventListener('click', () => hideModal('errorModal'));
document.getElementById('closeSuccessModal').addEventListener('click', () => hideModal('successModal'));
document.getElementById('cancelConfirmation').addEventListener('click', () => hideModal('confirmationModal'));

// Populate Display Name Options
document.getElementById('name').addEventListener('input', () => {
  const name = document.getElementById('name').value;
  const displayNameSelect = document.getElementById('displayName');
  displayNameSelect.innerHTML = `<option value="${name}">${name}</option>`;
});
document.getElementById('updateName').addEventListener('input', () => {
  const name = document.getElementById('updateName').value;
  const displayNameSelect = document.getElementById('updateDisplayName');
  displayNameSelect.innerHTML = `<option value="${name}">${name}</option>`;
});
