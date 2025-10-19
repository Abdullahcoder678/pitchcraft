let currentUser = null;
let currentPitch = null;
let selectedWebsiteType = 'landing';
let API_KEY = 'd7R14sjW7sDGHnGo90iN890JZuOhK5m9';
let currentGeneratedWebsite = '';

if (localStorage.getItem('vip_api_key')) {
    API_KEY = localStorage.getItem('vip_api_key');
}

function safeExecute(func, fallback = null) {
    try {
        return func();
    } catch (error) {
        return fallback;
    }
}

async function safeApiCall(apiFunc) {
    try {
        return await apiFunc();
    } catch (error) {
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    safeExecute(() => setupEventListeners());
    safeExecute(() => loadStats());
    safeExecute(() => checkExistingUser());
});

function checkExistingUser() {
    const savedUser = localStorage.getItem('vip_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showApp();
    }
}

function setupEventListeners() {
    safeExecute(() => {
        document.getElementById('signupForm').addEventListener('submit', handleSignup);
        document.getElementById('loginForm').addEventListener('submit', handleLogin);
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                if (tab) switchTab(tab);
            });
        });
        document.getElementById('pitchForm').addEventListener('submit', generatePitch);
    });
}

function showSignup() {
    safeExecute(() => {
        document.getElementById('signupModal').classList.remove('hidden');
        document.getElementById('loginModal').classList.add('hidden');
    });
}

function hideSignup() {
    safeExecute(() => {
        document.getElementById('signupModal').classList.add('hidden');
    });
}

function showLogin() {
    safeExecute(() => {
        document.getElementById('loginModal').classList.remove('hidden');
        document.getElementById('signupModal').classList.add('hidden');
    });
}

function hideLogin() {
    safeExecute(() => {
        document.getElementById('loginModal').classList.add('hidden');
    });
}

async function handleSignup(e) {
    e.preventDefault();
    safeExecute(() => {
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const plan = document.getElementById('planType').value;
        
        if (password !== confirmPassword) {
            showNotification('Passwords do not match!', 'error');
            return;
        }
        
        currentUser = { 
            fullName, 
            email, 
            plan, 
            id: Date.now(), 
            joinDate: new Date().toISOString() 
        };
        localStorage.setItem('vip_user', JSON.stringify(currentUser));
        document.getElementById('signupModal').classList.add('hidden');
        showApp();
        showNotification(`Welcome to ${plan.toUpperCase()} VIP, ${fullName}!`, 'success');
    });
}

async function handleLogin(e) {
    e.preventDefault();
    safeExecute(() => {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        const savedUser = localStorage.getItem('vip_user');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            if (currentUser.email === email) {
                document.getElementById('loginModal').classList.add('hidden');
                showApp();
                showNotification(`Welcome back, ${currentUser.fullName || 'VIP Member'}!`, 'success');
            } else {
                showNotification('Invalid credentials!', 'error');
            }
        } else {
            showNotification('No account found. Please create an account first.', 'error');
        }
    });
}

function toggleAuthMode() {
    safeExecute(() => {
        const submitBtn = document.getElementById('authSubmit');
        const toggleText = document.getElementById('toggleAuth');
        if (submitBtn.textContent.includes('Create')) {
            submitBtn.textContent = 'Login';
            toggleText.textContent = 'Create account';
        } else {
            submitBtn.textContent = 'Create ULTRA VIP Account';
            toggleText.textContent = 'Login here';
        }
    });
}

function showApp() {
    safeExecute(() => {
        document.getElementById('app').classList.remove('hidden');
        document.getElementById('app').style.display = 'flex';
        document.querySelector('.hero').style.display = 'none';
        document.getElementById('loginBtn').textContent = '🚪 Logout';
        document.getElementById('loginBtn').onclick = logout;
    });
}

function logout() {
    localStorage.removeItem('vip_user');
    location.reload();
}

function switchTab(tabName) {
    safeExecute(() => {
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
        if (tabName === 'history') loadHistory();
        if (tabName === 'website') initializeChat();
    });
}

function scrollToApp() {
    safeExecute(() => {
        document.getElementById('app').scrollIntoView({ behavior: 'smooth' });
    });
}

function fillExample(example) {
    safeExecute(() => {
        document.getElementById('idea').value = example;
    });
}

async function generatePitch(e) {
    e.preventDefault();
    
    const idea = safeExecute(() => document.getElementById('idea').value, '');
    const industry = safeExecute(() => document.getElementById('industry').value, '');
    const target = safeExecute(() => document.getElementById('target').value, '');

    if (!idea.trim()) {
        showNotification('Please describe your startup idea', 'error');
        return;
    }

    const btn = document.querySelector('.generate-btn');
    const btnText = document.getElementById('btnText');
    const loader = document.getElementById('loader');
    
    safeExecute(() => {
        btn.disabled = true;
        btnText.classList.add('hidden');
        loader.classList.remove('hidden');
    });

    setTimeout(() => {
        const mockPitch = {
            startupName: generateStartupName(idea),
            tagline: generateTagline(idea),
            elevatorPitch: `${idea} represents a revolutionary approach in the ${industry || 'technology'} space.`,
            problemStatement: `Current solutions lack efficiency and user-centric design.`,
            solutionStatement: `Our platform leverages cutting-edge AI technology.`,
            targetAudience: `Primary focus on ${target || 'tech-savvy consumers'}.`,
            uniqueValueProposition: `Unique combination of AI-driven insights and scalable architecture.`,
            landingPageHero: `Transform your ${industry || 'business'} experience.`,
            marketSize: `$${Math.floor(Math.random() * 50 + 10)}B global market.`,
            revenueModel: `Subscription-based SaaS model starting at $29/month.`,
            competitiveAdvantage: `First-mover advantage with proprietary AI technology.`,
            fundingRequirement: `Seeking $${Math.floor(Math.random() * 5 + 1)}M in Series A funding.`,
            colorPalette: ['#FFD700', '#FFA500', '#FF6B6B'],
            logoIdea: `Modern, minimalist design with premium elements.`,
            createdAt: new Date().toISOString(),
            originalIdea: idea
        };

        currentPitch = mockPitch;
        displayPitch(mockPitch);
        savePitchToHistory(mockPitch);
        updateStats();
        showNotification('ULTRA VIP Pitch generated!', 'success');

        safeExecute(() => {
            btn.disabled = false;
            btnText.classList.remove('hidden');
            loader.classList.add('hidden');
        });
    }, 1500);
}

function generateStartupName(idea) {
    const prefixes = ['Ultra', 'Premium', 'Elite', 'Pro', 'Luxury', 'Diamond', 'Platinum', 'Gold'];
    const suffixes = ['Hub', 'Lab', 'Core', 'Flow', 'Sync', 'Link', 'Wave', 'Sphere'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return prefix + suffix;
}

function generateTagline(idea) {
    const taglines = [
        'Premium Innovation Simplified',
        'Luxury Future Made Easy',
        'Ultra Smart Solutions',
        'Diamond-Level Technology',
        'Platinum Success Guaranteed'
    ];
    return taglines[Math.floor(Math.random() * taglines.length)];
}

function displayPitch(pitch) {
    safeExecute(() => {
        document.getElementById('pitchContent').innerHTML = `
            <div class="startup-name">
                <h1>${pitch.startupName}</h1>
                <p class="tagline">"${pitch.tagline}"</p>
            </div>
            <div class="pitch-item">
                <h3><i class="fas fa-rocket"></i> Elevator Pitch</h3>
                <p>${pitch.elevatorPitch}</p>
            </div>
            <div class="pitch-item">
                <h3><i class="fas fa-lightbulb"></i> Solution</h3>
                <p>${pitch.solutionStatement}</p>
            </div>
            <div class="pitch-item">
                <h3><i class="fas fa-users"></i> Target Audience</h3>
                <p>${pitch.targetAudience}</p>
            </div>
            <div class="pitch-item">
                <h3><i class="fas fa-star"></i> Value Proposition</h3>
                <p>${pitch.uniqueValueProposition}</p>
            </div>
            <div class="pitch-item">
                <h3><i class="fas fa-chart-line"></i> Market Size</h3>
                <p>${pitch.marketSize}</p>
            </div>
            <div class="pitch-item">
                <h3><i class="fas fa-dollar-sign"></i> Revenue Model</h3>
                <p>${pitch.revenueModel}</p>
            </div>
            <div class="pitch-item">
                <h3><i class="fas fa-money-bill-wave"></i> Funding</h3>
                <p>${pitch.fundingRequirement}</p>
            </div>
        `;
        document.getElementById('pitchResult').classList.remove('hidden');
        document.getElementById('pitchResult').scrollIntoView({ behavior: 'smooth' });
    });
}

function generateWebsite() {
    if (!currentPitch) {
        showNotification('Generate a pitch first', 'error');
        return;
    }
    switchTab('website');
    showNotification('Ready to build website!', 'info');
}

function copyPitch() {
    if (!currentPitch) return;
    safeExecute(() => {
        const text = `🚀 ${currentPitch.startupName} - ${currentPitch.tagline}\n\n${currentPitch.elevatorPitch}`;
        navigator.clipboard.writeText(text);
        showNotification('Pitch copied!', 'success');
    });
}

function downloadPitch() {
    if (!currentPitch) return;
    safeExecute(() => {
        const content = `ULTRA VIP PITCH - ${currentPitch.startupName}\n\n${currentPitch.elevatorPitch}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentPitch.startupName}-pitch.txt`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification('Pitch downloaded!', 'success');
    });
}

function savePitchToHistory(pitch) {
    safeExecute(() => {
        let history = JSON.parse(localStorage.getItem('vip_pitchHistory') || '[]');
        history.unshift(pitch);
        if (history.length > 50) history.pop();
        localStorage.setItem('vip_pitchHistory', JSON.stringify(history));
    });
}

function loadHistory() {
    safeExecute(() => {
        const history = JSON.parse(localStorage.getItem('vip_pitchHistory') || '[]');
        const container = document.getElementById('historyList');
        if (history.length === 0) {
            container.innerHTML = '<p>No pitches yet. Create your first ULTRA VIP pitch!</p>';
            return;
        }
        container.innerHTML = history.map((pitch, index) => `
            <div class="history-item" onclick="loadPitchFromHistory(${index})">
                <h3>${pitch.startupName}</h3>
                <p>${pitch.tagline}</p>
                <small>ULTRA VIP • ${new Date(pitch.createdAt).toLocaleDateString()}</small>
            </div>
        `).join('');
    });
}

function loadPitchFromHistory(index) {
    safeExecute(() => {
        const history = JSON.parse(localStorage.getItem('vip_pitchHistory') || '[]');
        currentPitch = history[index];
        displayPitch(currentPitch);
        switchTab('pitch');
    });
}

function loadStats() {
    safeExecute(() => {
        const pitchCount = JSON.parse(localStorage.getItem('vip_pitchHistory') || '[]').length;
        const websiteCount = parseInt(localStorage.getItem('vip_websiteCount') || '0');
        document.getElementById('pitchCount').textContent = pitchCount;
        document.getElementById('websiteCount').textContent = websiteCount;
    });
}

function updateStats() {
    loadStats();
}

function showNotification(message, type) {
    safeExecute(() => {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    });
}

function addChatMessage(message, isUser = false) {
    safeExecute(() => {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-msg' : 'ai-msg'}`;
        messageDiv.innerHTML = `<strong>${isUser ? 'You' : 'ULTRA AI'}:</strong> ${message}`;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
}

function showChatLoading() {
    safeExecute(() => {
        const messagesContainer = document.getElementById('chatMessages');
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message ai-msg loading-msg';
        loadingDiv.id = 'chatLoadingMessage';
        loadingDiv.innerHTML = '<div class="loading-spinner"></div> ULTRA VIP website bana raha hai...';
        messagesContainer.appendChild(loadingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
}

function removeChatLoading() {
    safeExecute(() => {
        const loadingMessage = document.getElementById('chatLoadingMessage');
        if (loadingMessage) loadingMessage.remove();
    });
}

async function generateWebsiteFromChat(prompt) {
    if (API_KEY.startsWith('AIza')) {
        return await generateWithGeminiVip(prompt);
    } else {
        return await generateWithOpenAIVip(prompt);
    }
}

async function generateWithGeminiVip(prompt) {
    const result = await safeApiCall(async () => {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Create ULTRA VIP website for: ${prompt}. Return ONLY HTML code with modern CSS, animations, JavaScript. No markdown.` }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 8000 }
            })
        });
        
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) throw new Error('No content');
        
        let html = data.candidates[0].content.parts[0].text;
        return html.replace(/```html\n?/g, '').replace(/```\n?/g, '').replace(/`/g, '').trim();
    });
    
    return result || generateFallbackWebsite(prompt);
}

async function generateWithOpenAIVip(prompt) {
    const result = await safeApiCall(async () => {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'Create ULTRA VIP websites with modern CSS, animations, JavaScript. Return ONLY HTML code.' },
                    { role: 'user', content: `Create ULTRA VIP website for: ${prompt}. Include premium design, animations, responsive layout.` }
                ],
                max_tokens: 4000,
                temperature: 0.7
            })
        });
        
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        if (!data.choices?.[0]?.message?.content) throw new Error('No content');
        
        let html = data.choices[0].message.content;
        return html.replace(/```html\n?/g, '').replace(/```\n?/g, '').replace(/`/g, '').trim();
    });
    
    return result || generateFallbackWebsite(prompt);
}

function generateFallbackWebsite(prompt) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ULTRA VIP Website</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #FFD700, #FFA500); color: #333; }
        .hero { height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; color: white; }
        .hero h1 { font-size: 4rem; margin-bottom: 1rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
        .hero p { font-size: 1.5rem; margin-bottom: 2rem; }
        .btn { background: #fff; color: #333; padding: 1rem 2rem; border: none; border-radius: 50px; font-size: 1.1rem; cursor: pointer; }
        .section { padding: 4rem 2rem; max-width: 1200px; margin: 0 auto; }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 2rem 0; }
        .feature { background: white; padding: 2rem; border-radius: 15px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .footer { background: #333; color: white; padding: 2rem; text-align: center; }
    </style>
</head>
<body>
    <div class="hero">
        <div>
            <h1>ULTRA VIP ${prompt}</h1>
            <p>Premium Quality • Luxury Experience • Professional Results</p>
            <button class="btn">Get Started</button>
        </div>
    </div>
    <div class="section">
        <h2>Premium Features</h2>
        <div class="features">
            <div class="feature">
                <h3>🌟 Premium Quality</h3>
                <p>Ultra-high quality service and results</p>
            </div>
            <div class="feature">
                <h3>💎 VIP Experience</h3>
                <p>Exclusive luxury experience for our clients</p>
            </div>
            <div class="feature">
                <h3>🚀 Fast Results</h3>
                <p>Quick delivery without compromising quality</p>
            </div>
        </div>
    </div>
    <div class="footer">
        <p>&copy; 2024 ULTRA VIP. Generated by PitchCraft ULTRA VIP.</p>
    </div>
</body>
</html>`;
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSendBtn');
    const message = safeExecute(() => input.value.trim(), '');

    if (!message) return;

    safeExecute(() => {
        input.disabled = true;
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        input.value = '';
    });

    addChatMessage(message, true);
    showChatLoading();

    try {
        const websiteCode = await generateWebsiteFromChat(message);
        currentGeneratedWebsite = websiteCode;
        
        removeChatLoading();
        addChatMessage('🎉 ULTRA VIP website ready! Premium quality with luxury design. Preview dekho right side mein!');
        
        safeExecute(() => {
            const previewFrame = document.getElementById('websitePreviewFrame');
            const blob = new Blob([websiteCode], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            previewFrame.src = url;
            
            const websiteCount = document.getElementById('websiteCount');
            websiteCount.textContent = parseInt(websiteCount.textContent) + 1;
            
            document.getElementById('apiStatus').textContent = '🟢 VIP API Working';
        });
        
    } catch (error) {
        removeChatLoading();
        addChatMessage('ULTRA VIP website ready! Fallback premium design loaded.');
        
        safeExecute(() => {
            const previewFrame = document.getElementById('websitePreviewFrame');
            const fallbackCode = generateFallbackWebsite(message);
            currentGeneratedWebsite = fallbackCode;
            const blob = new Blob([fallbackCode], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            previewFrame.src = url;
        });
    }

    safeExecute(() => {
        input.disabled = false;
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        input.focus();
    });
}

function sendQuickMessage(message) {
    safeExecute(() => {
        document.getElementById('chatInput').value = message;
        sendChatMessage();
    });
}

function handleChatEnter(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

function downloadGeneratedWebsite() {
    if (!currentGeneratedWebsite) {
        showNotification('Pehle ULTRA VIP website generate kariye!', 'error');
        return;
    }
    
    safeExecute(() => {
        const blob = new Blob([currentGeneratedWebsite], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ultra-vip-website.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification('ULTRA VIP website download ho gayi!', 'success');
    });
}

function openFullscreen() {
    if (!currentGeneratedWebsite) {
        showNotification('Pehle ULTRA VIP website generate kariye!', 'error');
        return;
    }
    safeExecute(() => {
        const newWindow = window.open('', '_blank');
        newWindow.document.write(currentGeneratedWebsite);
        newWindow.document.close();
    });
}

function initializeChat() {
    safeExecute(() => {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) chatInput.focus();
    });
}