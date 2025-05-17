const scriptURL = 'https://script.google.com/macros/s/AKfycbxdC31rLveilEZHr1BUmVlEOry3-jm7eWoekzWFbCTw1BxDhXi-vsAhXf_vafd5r7mL/exec'; // Replace with your Google Apps Script web app URL

// Utility Functions
function showModal(modalId) {
  document.getElementById(modalId).classList.add('show');
}

function hideModal(modalId) {
  document.getElementById(modalId).classList.remove('show');
}

function showError(message) {
  document.getElementById('errorMessage').textContent = message;
  showModal('errorModal');
}

function showNotification(message) {
  document.getElementById('notificationMessage').textContent = message;
  showModal('notificationModal');
}

function showConfirmation(message, callback) {
  document.getElementById('confirmationMessage').textContent = message;
  showModal('confirmationModal');
  document.getElementById('confirmAction').onclick = () => {
    callback();
    hideModal('confirmationModal');
  };
}

// Tab Navigation
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.replace('bg-blue-500', 'bg-gray-300');
    button.classList.replace('text-white', 'text-gray-700');
  });
  document.getElementById(tabId).classList.add('active');
  document.getElementById(`${tabId.replace('Section', 'Tab')}`).classList.replace('bg-gray-300', 'bg-blue-500');
  document.getElementById(`${tabId.replace('Section', 'Tab')}`).classList.replace('text-gray-700', 'text-white');
}

// Login
document.getElementById('loginButton').addEventListener('click', () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  showModal('loadingModal');
  fetch(`${scriptURL}?action=verifyLogin`, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(response => response.json())
    .then(result => {
      hideModal('loadingModal');
      if (result.success) {
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('mainSection').classList.remove('hidden');
        switchTab('registerSection');
      } else {
        showError('Log masuk gagal. Sila semak nombor kad pengenalan atau kata laluan.');
      }
    })
    .catch(error => {
      hideModal('loadingModal');
      showError(error.message);
    });
});

// Logout
document.getElementById('logoutButton').addEventListener('click', () => {
  document.getElementById('mainSection').classList.add('hidden');
  document.getElementById('loginSection').classList.remove('hidden');
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
});

// Tab Switching
document.getElementById('registerTab').addEventListener('click', () => switchTab('registerSection'));
document.getElementById('updateTab').addEventListener('click', () => switchTab('updateSection'));
document.getElementById('lostTab').addEventListener('click', () => {
  switchTab('lostSection');
  loadRegisteredList();
});
document.getElementById('settingsTab').addEventListener('click', () => switchTab('settingsSection'));
document.getElementById('previewTab').addEventListener('click', () => switchTab('previewSection'));

// Check Unique ID
document.getElementById('checkUniqueId').addEventListener('click', () => {
  const uniqueId = document.getElementById('uniqueId').value;
  showModal('loadingModal');
  fetch(`${scriptURL}?action=checkUniqueIdAvailability`, {
    method: 'POST',
    body: JSON.stringify({ manualId: uniqueId }),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(response => response.json())
    .then(result => {
      hideModal('loadingModal');
      document.getElementById('uniqueIdMessage').textContent = result.message;
      document.getElementById('uniqueIdMessage').classList.toggle('text-green-500', result.available);
      document.getElementById('uniqueIdMessage').classList.toggle('text-red-500', !result.available);
    })
    .catch(error => {
      hideModal('loadingModal');
      showError(error.message);
    });
});

// Save Registration
document.getElementById('saveRegistration').addEventListener('click', () => {
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
    photo: null
  };

  const photoInput = document.getElementById('photo').files[0];
  if (photoInput) {
    const reader = new FileReader();
    reader.onload = (e) => {
      data.photo = {
        data: e.target.result.split(',')[1],
        type: photoInput.type,
        name: photoInput.name
      };
      submitRegistration(data);
    };
    reader.readAsDataURL(photoInput);
  } else {
    submitRegistration(data);
  }
});

function submitRegistration(data) {
  showModal('loadingModal');
  fetch(`${scriptURL}?action=saveRegistration`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(response => response.json())
    .then(result => {
      hideModal('loadingModal');
      showNotification('Pendaftaran berjaya! ID Kad: ' + result.uniqueId);
      document.getElementById('resetRegistration').click();
    })
    .catch(error => {
      hideModal('loadingModal');
      showError(error.message);
    });
}

// Reset Registration
document.getElementById('resetRegistration').addEventListener('click', () => {
  document.getElementById('uniqueId').value = '';
  document.getElementById('name').value = '';
  document.getElementById('displayName').value = '';
  document.getElementById('icNumber').value = '';
  document.getElementById('phone').value = '';
  document.getElementById('position').value = '';
  document.getElementById('status').value = '';
  document.getElementById('emergencyContact').value = '';
  document.getElementById('emergencyPhone').value = '';
  document.getElementById('medicalCondition').value = '';
  document.getElementById('photo').value = '';
  document.getElementById('uniqueIdMessage').textContent = '';
});

// Update Section Search
document.getElementById('searchUpdateButton').addEventListener('click', () => {
  const searchValue = document.getElementById('searchUpdate').value;
  showModal('loadingModal');
  fetch(`${scriptURL}?action=searchRecord`, {
    method: 'POST',
    body: JSON.stringify({ searchValue }),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(response => response.json())
    .then(result => {
      hideModal('loadingModal');
      if (result) {
        document.getElementById('updateForm').classList.remove('hidden');
        document.getElementById('updateButtons').classList.remove('hidden');
        document.getElementById('updateUniqueId').value = result.uniqueId;
        document.getElementById('updateName').value = result.name;
        document.getElementById('updateDisplayName').value = result.displayName;
        document.getElementById('updateIcNumber').value = result.icNumber;
        document.getElementById('updatePhone').value = result.phone;
        document.getElementById('updatePosition').value = result.position;
        document.getElementById('updateStatus').value = result.status;
        document.getElementById('updateEmergencyContact').value = result.emergencyContact;
        document.getElementById('updateEmergencyPhone').value = result.emergencyPhone;
        document.getElementById('updateMedicalCondition').value = result.medicalCondition;
        document.getElementById('oldPhoto').src = result.photoUrl || '';
      } else {
        showError('Rekod tidak ditemukan');
      }
    })
    .catch(error => {
      hideModal('loadingModal');
      showError(error.message);
    });
});

// Update and Reprint
document.getElementById('updateAndReprintButton').addEventListener('click', () => {
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
    photo: null
  };

  const photoInput = document.getElementById('updatePhoto').files[0];
  if (photoInput) {
    const reader = new FileReader();
    reader.onload = (e) => {
      data.photo = {
        data: e.target.result.split(',')[1],
        type: photoInput.type,
        name: photoInput.name
      };
      submitUpdate(data);
    };
    reader.readAsDataURL(photoInput);
  } else {
    submitUpdate(data);
  }
});

function submitUpdate(data) {
  showModal('loadingModal');
  fetch(`${scriptURL}?action=updateAndReprint`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(response => response.json())
    .then(result => {
      hideModal('loadingModal');
      if (result.success) {
        showNotification('Kemaskini dan cetak semula berjaya! ID Kad: ' + result.uniqueId);
      } else {
        showError('Gagal mengemaskini dan mencetak semula');
      }
    })
    .catch(error => {
      hideModal('loadingModal');
      showError(error.message);
    });
}

// Reprint
document.getElementById('reprintButton').addEventListener('click', () => {
  const uniqueId = document.getElementById('updateUniqueId').value;
  showModal('loadingModal');
  fetch(`${scriptURL}?action=reprintForUpdate`, {
    method: 'POST',
    body: JSON.stringify({ uniqueId }),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(response => response.json())
    .then(result => {
      hideModal('loadingModal');
      if (result.success) {
        showNotification('Cetak semula berjaya! ID Kad: ' + result.uniqueId);
      } else {
        showError('Gagal mencetak semula kad');
      }
    })
    .catch(error => {
      hideModal('loadingModal');
      showError(error.message);
    });
});

// Lost Card Search
document.getElementById('searchLostButton').addEventListener('click', () => {
  const searchValue = document.getElementById('searchLost').value;
  showModal('loadingModal');
  fetch(`${scriptURL}?action=searchRecord`, {
    method: 'POST',
    body: JSON.stringify({ searchValue }),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(response => response.json())
    .then(result => {
      hideModal('loadingModal');
      if (result) {
        document.getElementById('lostInfo').classList.remove('hidden');
        document.getElementById('lostUniqueId').textContent = result.uniqueId;
        document.getElementById('lostName').textContent = result.name;
        document.getElementById('lostIcNumber').textContent = result.icNumber;
        document.getElementById('lostPhone').textContent = result.phone;
        document.getElementById('lostPosition').textContent = result.position;
        document.getElementById('lostStatus').textContent = result.status;
        document.getElementById('lostEmergencyContact').textContent = result.emergencyContact;
        document.getElementById('lostEmergencyPhone').textContent = result.emergencyPhone;
      } else {
        showError('Rekod tidak ditemukan');
      }
    })
    .catch(error => {
      hideModal('loadingModal');
      showError(error.message);
    });
});

// Report Lost
document.getElementById('reportLostButton').addEventListener('click', () => {
  const uniqueId = document.getElementById('lostUniqueId').textContent;
  showConfirmation('Adakah anda pasti ingin melaporkan kad ini sebagai hilang?', () => {
    showModal('loadingModal');
    fetch(`${scriptURL}?action=reportLost`, {
      method: 'POST',
      body: JSON.stringify({ uniqueId }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(response => response.json())
      .then(result => {
        hideModal('loadingModal');
        showNotification('Kad telah dilaporkan sebagai hilang');
        document.getElementById('lostInfo').classList.add('hidden');
        loadRegisteredList();
      })
      .catch(error => {
        hideModal('loadingModal');
        showError(error.message);
      });
  });
});

// Load Registered List
function loadRegisteredList() {
  showModal('loadingModal');
  fetch(`${scriptURL}?action=getRegisteredList`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
    .then(response => response.json())
    .then(list => {
      hideModal('loadingModal');
      const tbody = document.getElementById('registeredList');
      tbody.innerHTML = '';
      list.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${item.name}</td>
          <td>${item.uniqueId}</td>
          <td>${item.position}</td>
          <td>${item.printCount}</td>
          <td>${item.lostStatus}</td>
          <td>
            <button class="reprint-lost bg-blue-500 text-white px-2 py-1 rounded" data-id="${item.uniqueId}">Cetak Semula</button>
          </td>
        `;
        tbody.appendChild(row);
      });
      document.querySelectorAll('.reprint-lost').forEach(button => {
        button.addEventListener('click', () => {
          const uniqueId = button.dataset.id;
          showConfirmation('Adakah anda pasti ingin mencetak semula kad ini?', () => {
            showModal('loadingModal');
            fetch(`${scriptURL}?action=reprintLostCard`, {
              method: 'POST',
              body: JSON.stringify({ uniqueId }),
              headers: { 'Content-Type': 'application/json' }
            })
              .then(response => response.json())
              .then(result => {
                hideModal('loadingModal');
                if (result.success) {
                  showNotification('Cetak semula berjaya! ID Kad: ' + result.newUniqueId);
                  loadRegisteredList();
                } else {
                  showError('Gagal mencetak semula kad');
                }
              })
              .catch(error => {
                hideModal('loadingModal');
                showError(error.message);
              });
          });
        });
      });
    })
    .catch(error => {
      hideModal('loadingModal');
      showError(error.message);
    });
}

// Change Password
document.getElementById('changePasswordButton').addEventListener('click', () => {
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmNewPassword = document.getElementById('confirmNewPassword').value;
  if (newPassword !== confirmNewPassword) {
    showError('Kata laluan baru dan pengesahan tidak sepadan');
    return;
  }
  showModal('loadingModal');
  fetch(`${scriptURL}?action=changePassword`, {
    method: 'POST',
    body: JSON.stringify({ username: document.getElementById('username').value, currentPassword, newPassword }),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(response => response.json())
    .then(result => {
      hideModal('loadingModal');
      if (result) {
        showNotification('Kata laluan ditukar dengan jayanya');
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
      } else {
        showError('Gagal menukar kata laluan');
      }
    })
    .catch(error => {
      hideModal('loadingModal');
      showError(error.message);
    });
});

// Preview Card
document.getElementById('previewSearchButton').addEventListener('click', () => {
  const searchValue = document.getElementById('previewSearch').value;
  showModal('loadingModal');
  fetch(`${scriptURL}?action=searchRecord`, {
    method: 'POST',
    body: JSON.stringify({ searchValue }),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(response => response.json())
    .then(result => {
      hideModal('loadingModal');
      if (result) {
        document.getElementById('noCardFound').classList.add('hidden');
        document.getElementById('previewContent').classList.remove('hidden');
        fetch(`${scriptURL}?action=serveFile&fileId=${result.frontPdfId}`)
          .then(response => response.json())
          .then(data => {
            document.getElementById('frontPreview').src = `data:application/pdf;base64,${data}`;
          });
        fetch(`${scriptURL}?action=serveFile&fileId=${result.backPdfId}`)
          .then(response => response.json())
          .then(data => {
            document.getElementById('backPreview').src = `data:application/pdf;base64,${data}`;
          });
      } else {
        document.getElementById('previewContent').classList.add('hidden');
        document.getElementById('noCardFound').classList.remove('hidden');
      }
    })
    .catch(error => {
      hideModal('loadingModal');
      showError(error.message);
    });
});

// Download Front
document.getElementById('downloadFront').addEventListener('click', () => {
  const src = document.getElementById('frontPreview').src;
  const link = document.createElement('a');
  link.href = src;
  link.download = 'front.pdf';
  link.click();
});

// Download Back
document.getElementById('downloadBack').addEventListener('click', () => {
  const src = document.getElementById('backPreview').src;
  const link = document.createElement('a');
  link.href = src;
  link.download = 'back.pdf';
  link.click();
});

// Back to Search
document.getElementById('backToSearch').addEventListener('click', () => {
  document.getElementById('previewContent').classList.add('hidden');
  document.getElementById('noCardFound').classList.add('hidden');
  document.getElementById('previewSearch').value = '';
});

// Camera Functionality
let stream = null;

document.getElementById('capturePhoto').addEventListener('click', () => {
  showModal('cameraModal');
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(s => {
      stream = s;
      document.getElementById('video').srcObject = stream;
    })
    .catch(error => {
      showError('Gagal mengakses kamera: ' + error.message);
      hideModal('cameraModal');
    });
});

document.getElementById('updateCapturePhoto').addEventListener('click', () => {
  showModal('cameraModal');
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(s => {
      stream = s;
      document.getElementById('video').srcObject = stream;
    })
    .catch(error => {
      showError('Gagal mengakses kamera: ' + error.message);
      hideModal('cameraModal');
    });
});

document.getElementById('takePhoto').addEventListener('click', () => {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  const dataUrl = canvas.toDataURL('image/jpeg');
  const input = document.getElementById('photo');
  fetch(dataUrl)
    .then(res => res.blob())
    .then(blob => {
      const file = new File([blob], 'captured_photo.jpg', { type: 'image/jpeg' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      hideModal('cameraModal');
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    });
});

document.getElementById('cancelCamera').addEventListener('click', () => {
  hideModal('cameraModal');
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
});

// Modal Close Buttons
document.getElementById('closeErrorModal').addEventListener('click', () => hideModal('errorModal'));
document.getElementById('closeNotificationModal').addEventListener('click', () => hideModal('notificationModal'));
document.getElementById('cancelConfirmation').addEventListener('click', () => hideModal('confirmationModal'));
