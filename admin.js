
// Admin authentication and functionality
let isLoggedIn = false;

// Data storage keys
const STORAGE_KEYS = {
    drivers: 'vsct_drivers',
    signupRequests: 'vsct_signup_requests',
    news: 'vsct_news',
    schedule: 'vsct_schedule',
    standings: 'vsct_standings'
};

// Initialize data storage
function initializeStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.drivers)) {
        localStorage.setItem(STORAGE_KEYS.drivers, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.signupRequests)) {
        localStorage.setItem(STORAGE_KEYS.signupRequests, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.news)) {
        localStorage.setItem(STORAGE_KEYS.news, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.schedule)) {
        localStorage.setItem(STORAGE_KEYS.schedule, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.standings)) {
        localStorage.setItem(STORAGE_KEYS.standings, JSON.stringify([]));
    }
}

// Login form handler
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    // Simple authentication (in production, this should be server-side)
    if (username === 'admin' && password === 'vsct2024') {
        isLoggedIn = true;
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        initializeStorage();
        loadDashboardData();
    } else {
        alert('Invalid credentials. Please try again.');
    }
});

// Logout function
function logout() {
    isLoggedIn = false;
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
    document.getElementById('admin-username').value = '';
    document.getElementById('admin-password').value = '';
}

// Load dashboard data
function loadDashboardData() {
    updateStatistics();
    loadSignupRequests();
    loadDrivers();
    updateDriverSelects();
    loadDragDropSchedule();
    loadDragDropStandings();
}

// Update statistics
function updateStatistics() {
    const signupRequests = JSON.parse(localStorage.getItem(STORAGE_KEYS.signupRequests) || '[]');
    const drivers = JSON.parse(localStorage.getItem(STORAGE_KEYS.drivers) || '[]');
    const schedule = JSON.parse(localStorage.getItem(STORAGE_KEYS.schedule) || '[]');
    
    document.getElementById('pending-count').textContent = signupRequests.length;
    document.getElementById('total-drivers').textContent = drivers.length;
    document.getElementById('races-completed').textContent = schedule.filter(race => race.status === 'completed').length;
    document.getElementById('races-scheduled').textContent = schedule.filter(race => race.status === 'scheduled').length;
}

// Load signup requests
function loadSignupRequests() {
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.signupRequests) || '[]');
    const container = document.getElementById('signup-requests');
    
    if (requests.length === 0) {
        container.innerHTML = '<p><em>No pending signup requests at this time.</em></p>';
        return;
    }
    
    container.innerHTML = requests.map(request => `
        <div class="pending-requests">
            <h5>${request.name}</h5>
            <p><strong>Email:</strong> ${request.email}</p>
            <p><strong>Car #:</strong> ${request.carNumber}</p>
            <p><strong>Experience:</strong> ${request.experience}</p>
            <div class="action-buttons">
                <button onclick="approveSignup('${request.id}')" class="secondary">Approve</button>
                <button onclick="rejectSignup('${request.id}')" class="outline">Reject</button>
            </div>
        </div>
    `).join('');
}

// Signup approval/rejection
function approveSignup(id) {
    if (confirm('Approve this signup request?')) {
        const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.signupRequests) || '[]');
        const request = requests.find(r => r.id === id);
        
        if (request) {
            // Add to drivers
            const drivers = JSON.parse(localStorage.getItem(STORAGE_KEYS.drivers) || '[]');
            const newDriver = {
                id: Date.now().toString(),
                name: request.name,
                email: request.email,
                carNumber: request.carNumber,
                status: 'Active',
                points: 0,
                wins: 0,
                top5s: 0,
                top10s: 0
            };
            drivers.push(newDriver);
            localStorage.setItem(STORAGE_KEYS.drivers, JSON.stringify(drivers));
            
            // Remove from requests
            const updatedRequests = requests.filter(r => r.id !== id);
            localStorage.setItem(STORAGE_KEYS.signupRequests, JSON.stringify(updatedRequests));
            
            loadDashboardData();
            alert(`${request.name} has been approved and added as a driver!`);
        }
    }
}

function rejectSignup(id) {
    if (confirm('Reject this signup request?')) {
        const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.signupRequests) || '[]');
        const updatedRequests = requests.filter(r => r.id !== id);
        localStorage.setItem(STORAGE_KEYS.signupRequests, JSON.stringify(updatedRequests));
        
        loadDashboardData();
        alert('Signup request has been rejected.');
    }
}

// News management
document.getElementById('news-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('news-title').value;
    const content = document.getElementById('news-content').value;
    const author = document.getElementById('news-author').value;
    
    if (title && content) {
        const news = JSON.parse(localStorage.getItem(STORAGE_KEYS.news) || '[]');
        const newArticle = {
            id: Date.now().toString(),
            title: title,
            content: content,
            author: author,
            date: new Date().toLocaleDateString()
        };
        news.unshift(newArticle);
        localStorage.setItem(STORAGE_KEYS.news, JSON.stringify(news));
        
        alert(`News article "${title}" has been published successfully!`);
        this.reset();
        document.getElementById('news-author').value = 'VSCT Administration';
        updateNewsPage();
    }
});

// Schedule management
document.getElementById('schedule-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const week = document.getElementById('race-week').value;
    const date = document.getElementById('race-date').value;
    const track = document.getElementById('race-track').value;
    const type = document.getElementById('race-type').value;
    
    if (week && date && track && type) {
        const schedule = JSON.parse(localStorage.getItem(STORAGE_KEYS.schedule) || '[]');
        const newRace = {
            id: Date.now().toString(),
            week: parseInt(week),
            date: date,
            track: track,
            type: type,
            status: 'scheduled'
        };
        schedule.push(newRace);
        schedule.sort((a, b) => a.week - b.week);
        localStorage.setItem(STORAGE_KEYS.schedule, JSON.stringify(schedule));
        
        alert(`Race added: Week ${week} - ${track} (${type}) on ${date}`);
        this.reset();
        updateSchedulePage();
        updateStatistics();
        loadDragDropSchedule();
    }
});

// Standings management
document.getElementById('standings-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const driverId = document.getElementById('driver-select').value;
    const points = parseInt(document.getElementById('race-points').value) || 0;
    const bonus = parseInt(document.getElementById('bonus-points').value) || 0;
    const result = document.getElementById('race-result').value;
    
    if (driverId && points >= 0) {
        const drivers = JSON.parse(localStorage.getItem(STORAGE_KEYS.drivers) || '[]');
        const driver = drivers.find(d => d.id === driverId);
        
        if (driver) {
            const totalPoints = points + bonus;
            driver.points += totalPoints;
            
            // Update race statistics based on result
            if (result === '1') driver.wins++;
            if (['1', '2', '3', '4', '5'].includes(result)) driver.top5s++;
            if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].includes(result)) driver.top10s++;
            
            localStorage.setItem(STORAGE_KEYS.drivers, JSON.stringify(drivers));
            
            alert(`Points updated for ${driver.name}: +${totalPoints} points (Total: ${driver.points})`);
            this.reset();
            updateStandingsPage();
            loadDrivers();
            loadDragDropStandings();
        }
    }
});

// Load drivers into table and selects
function loadDrivers() {
    const drivers = JSON.parse(localStorage.getItem(STORAGE_KEYS.drivers) || '[]');
    const tbody = document.querySelector('#admin-dashboard table tbody');
    
    if (drivers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4"><em>No registered drivers at this time.</em></td></tr>';
    } else {
        tbody.innerHTML = drivers.map(driver => `
            <tr>
                <td>${driver.name}</td>
                <td>#${driver.carNumber}</td>
                <td>${driver.status}</td>
                <td>
                    <button onclick="editDriver('${driver.id}')" class="outline" style="margin-right: 0.5rem;">Edit</button>
                    <button onclick="${driver.status === 'Active' ? 'suspendDriver' : 'activateDriver'}('${driver.id}')" class="${driver.status === 'Active' ? 'outline' : 'secondary'}">${driver.status === 'Active' ? 'Suspend' : 'Activate'}</button>
                    <button onclick="removeDriver('${driver.id}')" class="outline" style="color: red; margin-left: 0.5rem;">Remove</button>
                </td>
            </tr>
        `).join('');
    }
}

// Update driver selects
function updateDriverSelects() {
    const drivers = JSON.parse(localStorage.getItem(STORAGE_KEYS.drivers) || '[]');
    const driverSelect = document.getElementById('driver-select');
    
    if (drivers.length === 0) {
        driverSelect.innerHTML = '<option value="">Choose driver</option><option value="" disabled>No drivers registered yet</option>';
    } else {
        driverSelect.innerHTML = '<option value="">Choose driver</option>' + 
            drivers.map(driver => `<option value="${driver.id}">${driver.name} (#${driver.carNumber})</option>`).join('');
    }
}

// Driver management functions
function editDriver(driverId) {
    const drivers = JSON.parse(localStorage.getItem(STORAGE_KEYS.drivers) || '[]');
    const driver = drivers.find(d => d.id === driverId);
    
    if (driver) {
        const newCarNumber = prompt(`Edit car number for ${driver.name}:`, driver.carNumber);
        if (newCarNumber && newCarNumber !== driver.carNumber && newCarNumber >= 1 && newCarNumber <= 99) {
            // Check if car number is already taken
            const isNumberTaken = drivers.some(d => d.carNumber == newCarNumber && d.id !== driverId);
            if (isNumberTaken) {
                alert('Car number is already taken by another driver.');
                return;
            }
            
            driver.carNumber = newCarNumber;
            localStorage.setItem(STORAGE_KEYS.drivers, JSON.stringify(drivers));
            loadDrivers();
            updateDriverSelects();
            alert(`Car number updated for ${driver.name}: #${newCarNumber}`);
        }
    }
}

function suspendDriver(driverId) {
    const drivers = JSON.parse(localStorage.getItem(STORAGE_KEYS.drivers) || '[]');
    const driver = drivers.find(d => d.id === driverId);
    
    if (driver && confirm(`Suspend ${driver.name}?`)) {
        driver.status = 'Suspended';
        localStorage.setItem(STORAGE_KEYS.drivers, JSON.stringify(drivers));
        loadDrivers();
        alert(`${driver.name} has been suspended.`);
    }
}

function activateDriver(driverId) {
    const drivers = JSON.parse(localStorage.getItem(STORAGE_KEYS.drivers) || '[]');
    const driver = drivers.find(d => d.id === driverId);
    
    if (driver && confirm(`Activate ${driver.name}?`)) {
        driver.status = 'Active';
        localStorage.setItem(STORAGE_KEYS.drivers, JSON.stringify(drivers));
        loadDrivers();
        alert(`${driver.name} has been activated.`);
    }
}

function removeDriver(driverId) {
    const drivers = JSON.parse(localStorage.getItem(STORAGE_KEYS.drivers) || '[]');
    const driver = drivers.find(d => d.id === driverId);
    
    if (driver && confirm(`Are you sure you want to remove ${driver.name} from the roster? This action cannot be undone.`)) {
        const updatedDrivers = drivers.filter(d => d.id !== driverId);
        localStorage.setItem(STORAGE_KEYS.drivers, JSON.stringify(updatedDrivers));
        loadDrivers();
        updateDriverSelects();
        updateStatistics();
        alert(`${driver.name} has been removed from the roster.`);
    }
}

// Clear all data except drivers
function clearAllExceptDrivers() {
    if (confirm('Are you sure you want to clear all data except the driver roster? This will remove all news, schedule, standings, and signup requests. This action cannot be undone.')) {
        // Clear all data except drivers
        localStorage.setItem(STORAGE_KEYS.signupRequests, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.news, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.schedule, JSON.stringify([]));
        
        // Reset driver points but keep drivers
        const drivers = JSON.parse(localStorage.getItem(STORAGE_KEYS.drivers) || '[]');
        drivers.forEach(driver => {
            driver.points = 0;
            driver.wins = 0;
            driver.top5s = 0;
            driver.top10s = 0;
        });
        localStorage.setItem(STORAGE_KEYS.drivers, JSON.stringify(drivers));
        
        // Update all pages
        updateNewsPage();
        updateSchedulePage();
        updateStandingsPage();
        loadDashboardData();
        
        alert('All data cleared except driver roster. Driver points have been reset to 0.');
    }
}

// Drag and Drop Schedule Management
function loadDragDropSchedule() {
    const schedule = JSON.parse(localStorage.getItem(STORAGE_KEYS.schedule) || '[]');
    const container = document.getElementById('schedule-drag-container');
    
    if (schedule.length === 0) {
        container.innerHTML = '<p><em>No races scheduled. Add races above to start reordering.</em></p>';
        return;
    }
    
    container.innerHTML = schedule.map(race => `
        <div class="draggable-item race-item" draggable="true" data-race-id="${race.id}">
            <div class="item-info">
                <strong>Week ${race.week}</strong> - ${race.track}<br>
                <small>${new Date(race.date).toLocaleDateString()} • ${race.type}</small>
            </div>
            <div class="item-actions">
                <button onclick="editRace('${race.id}')" class="outline">Edit</button>
                <button onclick="deleteRace('${race.id}')" class="outline" style="color: red;">Remove</button>
            </div>
        </div>
    `).join('');
    
    // Add drag and drop event listeners
    addScheduleDragListeners();
}

function addScheduleDragListeners() {
    const container = document.getElementById('schedule-drag-container');
    const items = container.querySelectorAll('.draggable-item');
    
    items.forEach(item => {
        item.addEventListener('dragstart', handleScheduleDragStart);
        item.addEventListener('dragend', handleScheduleDragEnd);
    });
    
    container.addEventListener('dragover', handleScheduleDragOver);
    container.addEventListener('drop', handleScheduleDrop);
}

function handleScheduleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.raceId);
    e.target.classList.add('dragging');
}

function handleScheduleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleScheduleDragOver(e) {
    e.preventDefault();
    const container = e.currentTarget;
    const afterElement = getDragAfterElement(container, e.clientY);
    const dragging = document.querySelector('.dragging');
    
    if (afterElement == null) {
        container.appendChild(dragging);
    } else {
        container.insertBefore(dragging, afterElement);
    }
}

function handleScheduleDrop(e) {
    e.preventDefault();
    updateScheduleOrder();
}

function updateScheduleOrder() {
    const container = document.getElementById('schedule-drag-container');
    const items = container.querySelectorAll('.draggable-item');
    const schedule = JSON.parse(localStorage.getItem(STORAGE_KEYS.schedule) || '[]');
    
    // Get the original dates in order
    const originalDates = schedule.sort((a, b) => a.week - b.week).map(race => race.date);
    
    const newOrder = [];
    items.forEach((item, index) => {
        const raceId = item.dataset.raceId;
        const race = schedule.find(r => r.id === raceId);
        if (race) {
            race.week = index + 1;
            // Assign the date based on the new position
            race.date = originalDates[index];
            newOrder.push(race);
        }
    });
    
    localStorage.setItem(STORAGE_KEYS.schedule, JSON.stringify(newOrder));
    updateSchedulePage();
    updateStatistics();
    loadDragDropSchedule();
}

// Drag and Drop Standings Management
function loadDragDropStandings() {
    const drivers = JSON.parse(localStorage.getItem(STORAGE_KEYS.drivers) || '[]');
    const container = document.getElementById('standings-drag-container');
    
    if (drivers.length === 0) {
        container.innerHTML = '<p><em>No drivers registered. Approve signups to start managing standings.</em></p>';
        return;
    }
    
    // Sort drivers by points for display
    const sortedDrivers = drivers.sort((a, b) => b.points - a.points);
    
    container.innerHTML = sortedDrivers.map((driver, index) => `
        <div class="draggable-item driver-item" draggable="true" data-driver-id="${driver.id}">
            <div class="item-info">
                <strong>#${index + 1} ${driver.name} (#${driver.carNumber})</strong><br>
                <small>${driver.points} points • ${driver.wins} wins • ${driver.top5s} top 5s</small>
            </div>
            <div class="item-actions">
                <button onclick="quickPointsAdjust('${driver.id}')" class="outline">Quick Points</button>
            </div>
        </div>
    `).join('');
    
    // Add drag and drop event listeners
    addStandingsDragListeners();
}

function addStandingsDragListeners() {
    const container = document.getElementById('standings-drag-container');
    const items = container.querySelectorAll('.draggable-item');
    
    items.forEach(item => {
        item.addEventListener('dragstart', handleStandingsDragStart);
        item.addEventListener('dragend', handleStandingsDragEnd);
    });
    
    container.addEventListener('dragover', handleStandingsDragOver);
    container.addEventListener('drop', handleStandingsDrop);
}

function handleStandingsDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.driverId);
    e.target.classList.add('dragging');
}

function handleStandingsDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleStandingsDragOver(e) {
    e.preventDefault();
    const container = e.currentTarget;
    const afterElement = getDragAfterElement(container, e.clientY);
    const dragging = document.querySelector('.dragging');
    
    if (afterElement == null) {
        container.appendChild(dragging);
    } else {
        container.insertBefore(dragging, afterElement);
    }
}

function handleStandingsDrop(e) {
    e.preventDefault();
    updateStandingsOrder();
}

function updateStandingsOrder() {
    const container = document.getElementById('standings-drag-container');
    const items = container.querySelectorAll('.draggable-item');
    const drivers = JSON.parse(localStorage.getItem(STORAGE_KEYS.drivers) || '[]');
    
    // Assign championship positions based on drag order
    items.forEach((item, index) => {
        const driverId = item.dataset.driverId;
        const driver = drivers.find(d => d.id === driverId);
        if (driver) {
            driver.championshipPosition = index + 1;
        }
    });
    
    localStorage.setItem(STORAGE_KEYS.drivers, JSON.stringify(drivers));
    updateStandingsPage();
    loadDragDropStandings();
}

// Utility function for drag and drop
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.draggable-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Additional race management functions
function editRace(raceId) {
    const schedule = JSON.parse(localStorage.getItem(STORAGE_KEYS.schedule) || '[]');
    const race = schedule.find(r => r.id === raceId);
    
    if (race) {
        const newTrack = prompt(`Edit track name for Week ${race.week}:`, race.track);
        if (newTrack && newTrack !== race.track) {
            race.track = newTrack;
            localStorage.setItem(STORAGE_KEYS.schedule, JSON.stringify(schedule));
            loadDragDropSchedule();
            updateSchedulePage();
            alert(`Track updated to: ${newTrack}`);
        }
    }
}

function deleteRace(raceId) {
    const schedule = JSON.parse(localStorage.getItem(STORAGE_KEYS.schedule) || '[]');
    const race = schedule.find(r => r.id === raceId);
    
    if (race && confirm(`Delete Week ${race.week} - ${race.track}?`)) {
        const updatedSchedule = schedule.filter(r => r.id !== raceId);
        // Renumber weeks
        updatedSchedule.sort((a, b) => a.week - b.week).forEach((race, index) => {
            race.week = index + 1;
        });
        localStorage.setItem(STORAGE_KEYS.schedule, JSON.stringify(updatedSchedule));
        loadDragDropSchedule();
        updateSchedulePage();
        updateStatistics();
        alert('Race deleted and schedule renumbered.');
    }
}

function quickPointsAdjust(driverId) {
    const drivers = JSON.parse(localStorage.getItem(STORAGE_KEYS.drivers) || '[]');
    const driver = drivers.find(d => d.id === driverId);
    
    if (driver) {
        const pointsToAdd = prompt(`Add/subtract points for ${driver.name}:\n(Use negative numbers to subtract)`, '0');
        const points = parseInt(pointsToAdd);
        
        if (!isNaN(points)) {
            const oldPoints = driver.points;
            driver.points = Math.max(0, driver.points + points);
            localStorage.setItem(STORAGE_KEYS.drivers, JSON.stringify(drivers));
            loadDragDropStandings();
            updateStandingsPage();
            alert(`${driver.name}: ${oldPoints} → ${driver.points} points (${points > 0 ? '+' : ''}${points})`);
        }
    }
}

// Update external pages
function updateNewsPage() {
    // News is stored in localStorage and will be loaded by news.html
    console.log('News page data updated in localStorage');
}

function updateSchedulePage() {
    // Schedule is stored in localStorage and will be loaded by schedule.html
    console.log('Schedule page data updated in localStorage');
}

function updateStandingsPage() {
    // Standings is stored in localStorage and will be loaded by standings.html
    console.log('Standings page data updated in localStorage');
}

// Auto-save functionality (simulated)
function autoSave() {
    // In a real application, this would save data to a server
    console.log('Auto-saving admin changes...');
}

// Auto-save every 30 seconds
setInterval(autoSave, 30000);

// Add sample signup request for testing (only if none exist)
function addSampleData() {
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.signupRequests) || '[]');
    if (requests.length === 0) {
        const sampleRequest = {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@email.com',
            carNumber: '24',
            experience: 'Intermediate - 2 years iRacing'
        };
        requests.push(sampleRequest);
        localStorage.setItem(STORAGE_KEYS.signupRequests, JSON.stringify(requests));
    }
}

// Initialize sample data when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Only add sample data if we're in the admin dashboard (logged in)
    if (document.getElementById('admin-dashboard') && !document.getElementById('admin-dashboard').classList.contains('hidden')) {
        addSampleData();
    }
});
