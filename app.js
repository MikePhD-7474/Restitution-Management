// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadMembers();
    updateStatistics();
    updateOnlineStatus();
    setDefaultDate();
    
    // Check online status every 5 seconds
    setInterval(updateOnlineStatus, 5000);
});

// Update online/offline indicator
function updateOnlineStatus() {
    const indicator = document.getElementById('online-status');
    if (navigator.onLine) {
        indicator.classList.remove('offline');
        indicator.title = 'Online';
    } else {
        indicator.classList.add('offline');
        indicator.title = 'Offline - Data will sync when online';
    }
}

// Set default membership date to today
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('membership-date').value = today;
}

// Tab switching
function showTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => button.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
    
    // Refresh data when switching tabs
    if (tabName === 'members') {
        displayMembers();
    } else if (tabName === 'stats') {
        updateStatistics();
    }
}

// Handle form submission
document.getElementById('member-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const member = {
        id: Date.now(), // Unique ID based on timestamp
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        gender: document.getElementById('gender').value,
        dob: document.getElementById('dob').value,
        membershipDate: document.getElementById('membership-date').value,
        baptized: document.getElementById('baptized').checked,
        registeredDate: new Date().toISOString(),
        synced: false // Track if synced to server (for future sync feature)
    };
    
    // Save to localStorage
    saveMember(member);
    
    // Show success message
    showSuccessMessage('Member registered successfully!');
    
    // Clear form
    clearForm();
    
    // Update statistics
    updateStatistics();
});

// Save member to localStorage
function saveMember(member) {
    let members = getMembers();
    members.push(member);
    localStorage.setItem('churchMembers', JSON.stringify(members));
}

// Get all members from localStorage
function getMembers() {
    const members = localStorage.getItem('churchMembers');
    return members ? JSON.parse(members) : [];
}

// Load and display all members
function loadMembers() {
    displayMembers();
}

function displayMembers() {
    const members = getMembers();
    const membersList = document.getElementById('members-list');
    
    if (members.length === 0) {
        membersList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No members registered yet. Start by adding your first member!</p>';
        return;
    }
    
    membersList.innerHTML = members.map(member => `
        <div class="member-card">
            <h3>${member.name}</h3>
            <p>📞 ${member.phone}</p>
            ${member.email ? `<p>✉️ ${member.email}</p>` : ''}
            <p>👤 ${member.gender}</p>
            ${member.dob ? `<p>🎂 ${formatDate(member.dob)}</p>` : ''}
            <p>📅 Joined: ${formatDate(member.membershipDate)}</p>
            ${member.baptized ? '<p>💧 Baptized</p>' : ''}
            <div class="member-actions">
                <button class="btn btn-danger" onclick="deleteMember(${member.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Search members
function searchMembers() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const members = getMembers();
    const filtered = members.filter(member => 
        member.name.toLowerCase().includes(searchTerm) ||
        member.phone.includes(searchTerm)
    );
    
    const membersList = document.getElementById('members-list');
    
    if (filtered.length === 0) {
        membersList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No members found matching your search.</p>';
        return;
    }
    
    membersList.innerHTML = filtered.map(member => `
        <div class="member-card">
            <h3>${member.name}</h3>
            <p>📞 ${member.phone}</p>
            ${member.email ? `<p>✉️ ${member.email}</p>` : ''}
            <p>👤 ${member.gender}</p>
            ${member.dob ? `<p>🎂 ${formatDate(member.dob)}</p>` : ''}
            <p>📅 Joined: ${formatDate(member.membershipDate)}</p>
            ${member.baptized ? '<p>💧 Baptized</p>' : ''}
            <div class="member-actions">
                <button class="btn btn-danger" onclick="deleteMember(${member.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Delete member
function deleteMember(id) {
    if (confirm('Are you sure you want to delete this member?')) {
        let members = getMembers();
        members = members.filter(member => member.id !== id);
        localStorage.setItem('churchMembers', JSON.stringify(members));
        displayMembers();
        updateStatistics();
        showSuccessMessage('Member deleted successfully');
    }
}

// Update statistics
function updateStatistics() {
    const members = getMembers();
    
    document.getElementById('total-members').textContent = members.length;
    
    const maleCount = members.filter(m => m.gender === 'Male').length;
    document.getElementById('male-count').textContent = maleCount;
    
    const femaleCount = members.filter(m => m.gender === 'Female').length;
    document.getElementById('female-count').textContent = femaleCount;
    
    const baptizedCount = members.filter(m => m.baptized).length;
    document.getElementById('baptized-count').textContent = baptizedCount;
}

// Clear form
function clearForm() {
    document.getElementById('member-form').reset();
    setDefaultDate();
}

// Show success message
function showSuccessMessage(message) {
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = message;
    
    const form = document.getElementById('member-form');
    form.parentNode.insertBefore(messageDiv, form);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    });
}

// Export data to JSON (for backup)
function exportData() {
    const members = getMembers();
    const dataStr = JSON.stringify(members, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `church-members-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Future: Sync data to server when online
function syncData() {
    if (!navigator.onLine) {
        alert('Cannot sync - you are offline');
        return;
    }
    
    const members = getMembers();
    const unsyncedMembers = members.filter(m => !m.synced);
    
    if (unsyncedMembers.length === 0) {
        alert('All data is already synced!');
        return;
    }
    
    // TODO: Implement actual server sync here
    console.log('Syncing members:', unsyncedMembers);
    
    // For now, just mark as synced
    members.forEach(m => m.synced = true);
    localStorage.setItem('churchMembers', JSON.stringify(members));
    
    document.getElementById('last-sync').textContent = 'Last synced: ' + new Date().toLocaleString();
    alert('Data synced successfully!');
}

// Make functions available globally
window.showTab = showTab;
window.deleteMember = deleteMember;
window.clearForm = clearForm;
window.searchMembers = searchMembers;
window.exportData = exportData;
window.syncData = syncData;
