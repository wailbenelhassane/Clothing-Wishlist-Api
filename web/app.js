// =============================
// Configuration
// =============================
let config = {
    apiUrl: localStorage.getItem('apiUrl') || 'http://localhost:8080',
    apiKey: localStorage.getItem('apiKey') || ''
};

// =============================
// DOM Elements
// =============================
const apiUrlInput = document.getElementById('apiUrl');
const apiKeyInput = document.getElementById('apiKey');
const toggleApiKeyBtn = document.getElementById('toggleApiKey');
const saveConfigBtn = document.getElementById('saveConfig');
const testConnectionBtn = document.getElementById('testConnection');
const connectionStatus = document.getElementById('connectionStatus');
const toggleConfigBtn = document.getElementById('toggleConfig');
const configPanel = document.getElementById('configPanel');
const refreshClothingBtn = document.getElementById('refreshClothing');
const addClothingBtn = document.getElementById('addClothingBtn');
const clothingContainer = document.getElementById('clothingContainer');
const totalClothingElement = document.getElementById('totalClothing');
const clothingModal = document.getElementById('clothingModal');
const modalTitle = document.getElementById('modalTitle');
const clothingForm = document.getElementById('clothingForm');
const closeModal = document.querySelector('.close');
const cancelBtn = document.getElementById('cancelBtn');
const toast = document.getElementById('toast');

// =============================
// Initialize
// =============================
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    setupEventListeners();
    loadClothing();
});

// =============================
// Configuration
// =============================
function loadConfig() {
    apiUrlInput.value = config.apiUrl;
    apiKeyInput.value = config.apiKey;
}

function toggleApiKeyVisibility() {
    const type = apiKeyInput.type === 'password' ? 'text' : 'password';
    apiKeyInput.type = type;
    toggleApiKeyBtn.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
}

function saveConfiguration() {
    config.apiUrl = apiUrlInput.value.trim().replace(/\/$/, '');
    config.apiKey = apiKeyInput.value.trim();

    localStorage.setItem('apiUrl', config.apiUrl);
    localStorage.setItem('apiKey', config.apiKey);

    showStatus('success', '✅ Configuración guardada correctamente');
    showToast('Configuración guardada', 'success');
}

async function testConnection() {
    if (!config.apiUrl) {
        showStatus('error', '❌ Por favor, configura la URL de la API primero');
        return;
    }

    showStatus('', 'Probando conexión...');

    try {
        const response = await fetch(`${config.apiUrl}/health`);
        if (response.ok) {
            const data = await response.json();
            showStatus('success', `✅ Conexión exitosa! Servidor: ${data.message || 'API funcionando'}`);
            showToast('Conexión exitosa', 'success');
        } else {
            showStatus('error', `❌ Error: ${response.status} - ${response.statusText}`);
            showToast('Error de conexión', 'error');
        }
    } catch (error) {
        showStatus('error', `❌ Error de conexión: ${error.message}`);
        showToast('No se puede conectar con la API', 'error');
    }
}

function showStatus(type, message) {
    connectionStatus.textContent = message;
    connectionStatus.className = 'status-message';
    if (type) connectionStatus.classList.add(type);
}

function toggleConfigPanel() {
    configPanel.classList.toggle('collapsed');
}

// =============================
// CRUD Clothing Items
// =============================
async function loadClothing() {
    if (!config.apiUrl) {
        showToast('Por favor, configura la URL de la API', 'warning');
        return;
    }

    clothingContainer.innerHTML = '<div class="loading">Cargando prendas...</div>';

    try {
        const headers = { 'Content-Type': 'application/json' };
        if (config.apiKey) headers['x-api-key'] = config.apiKey;

        const response = await fetch(`${config.apiUrl}/clothing`, { method: 'GET', headers });

        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
        const result = await response.json();

        if (result.success && result.data) {
            displayClothing(result.data);
            totalClothingElement.textContent = result.data.length || result.count || 0;
        } else {
            throw new Error(result.error || 'Error al cargar las prendas');
        }
    } catch (error) {
        console.error('Error loading clothing items:', error);
        clothingContainer.innerHTML = `
            <div class="empty-state">
                <h3> Error</h3>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="loadClothing()">🔄 Reintentar</button>
            </div>
        `;
        showToast(error.message, 'error');
    }
}

function displayClothing(items) {
    if (!items || items.length === 0) {
        clothingContainer.innerHTML = `
            <div class="empty-state">
                <h3>👕 No hay prendas</h3>
                <p>Agrega tu primera prenda con el botón "Añadir prenda"</p>
            </div>
        `;
        return;
    }

    clothingContainer.innerHTML = items.map(item => `
        <div class="clothing-card">
            <h3>${item.name} ${item.brand ? `(${item.brand})` : ''}</h3>
            <div class="clothing-info">
                <p><strong>Talla:</strong> ${item.size || 'N/A'}</p>
                <p><strong>Color:</strong> ${item.color || 'N/A'}</p>
                <p><strong>Precio:</strong> ${item.price ? `$${item.price}` : 'No especificado'}</p>
                <p><strong>Wishlist:</strong> ${item.wishlist ? ' Sí' : '— No'}</p>
                <p><strong>Notas:</strong> ${item.notes || '—'}</p>
                <p><strong>ID:</strong> ${item.id}</p>
            </div>
            <div class="clothing-actions">
                <button class="btn btn-primary" onclick='editClothing(${JSON.stringify(item)})'>Editar</button>
                <button class="btn btn-danger" onclick="deleteClothing('${item.id}')">Eliminar</button>
            </div>
        </div>
    `).join('');
}

// =============================
// Modal management
// =============================
function openAddClothingModal() {
    modalTitle.textContent = 'Añadir prenda';
    clothingForm.reset();
    document.getElementById('clothingId').value = '';
    clothingModal.classList.add('show');
}

function editClothing(item) {
    modalTitle.textContent = 'Editar prenda';
    document.getElementById('clothingId').value = item.id;
    document.getElementById('name').value = item.name || '';
    document.getElementById('brand').value = item.brand || '';
    document.getElementById('size').value = item.size || '';
    document.getElementById('color').value = item.color || '';
    document.getElementById('price').value = item.price || '';
    document.getElementById('wishlist').checked = !!item.wishlist;
    document.getElementById('notes').value = item.notes || '';
    clothingModal.classList.add('show');
}

function closeClothingModal() {
    clothingModal.classList.remove('show');
    clothingForm.reset();
}

// =============================
// Submit & Delete
// =============================
async function handleClothingSubmit(e) {
    e.preventDefault();

    const clothingId = document.getElementById('clothingId').value;
    const clothingData = {
        name: document.getElementById('name').value.trim(),
        brand: document.getElementById('brand').value.trim(),
        size: document.getElementById('size').value.trim(),
        color: document.getElementById('color').value.trim(),
        price: parseFloat(document.getElementById('price').value),
        wishlist: document.getElementById('wishlist').checked,
        notes: document.getElementById('notes').value.trim()
    };

    const isEdit = !!clothingId;
    const url = isEdit ? `${config.apiUrl}/clothing/${clothingId}` : `${config.apiUrl}/clothing`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const headers = { 'Content-Type': 'application/json' };
        if (config.apiKey) headers['x-api-key'] = config.apiKey;

        const response = await fetch(url, {
            method,
            headers,
            body: JSON.stringify(clothingData)
        });

        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error || 'Error al guardar');

        showToast(isEdit ? 'Prenda actualizada' : 'Prenda añadida', 'success');
        closeClothingModal();
        loadClothing();
    } catch (error) {
        console.error('Error saving clothing:', error);
        showToast(error.message, 'error');
    }
}

async function deleteClothing(id) {
    if (!confirm('¿Eliminar esta prenda?')) return;

    try {
        const headers = { 'Content-Type': 'application/json' };
        if (config.apiKey) headers['x-api-key'] = config.apiKey;

        const response = await fetch(`${config.apiUrl}/clothing/${id}`, { method: 'DELETE', headers });
        const result = await response.json();

        if (!response.ok || !result.success) throw new Error(result.error || 'Error al eliminar');
        showToast('Prenda eliminada', 'success');
        loadClothing();
    } catch (error) {
        console.error('Error deleting clothing:', error);
        showToast(error.message, 'error');
    }
}

// =============================
// Toast Notifications
// =============================
function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// =============================
// Event Listeners
// =============================
function setupEventListeners() {
    toggleApiKeyBtn.addEventListener('click', toggleApiKeyVisibility);
    saveConfigBtn.addEventListener('click', saveConfiguration);
    testConnectionBtn.addEventListener('click', testConnection);
    toggleConfigBtn.addEventListener('click', toggleConfigPanel);
    refreshClothingBtn.addEventListener('click', loadClothing);
    addClothingBtn.addEventListener('click', openAddClothingModal);
    closeModal.addEventListener('click', closeClothingModal);
    cancelBtn.addEventListener('click', closeClothingModal);
    clothingForm.addEventListener('submit', handleClothingSubmit);
    window.addEventListener('click', (e) => { if (e.target === clothingModal) closeClothingModal(); });
}
