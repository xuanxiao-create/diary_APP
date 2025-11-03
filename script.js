// 全局状态管理
let currentUser = null;
let currentPage = 'home';
let currentTaskFilter = 'all';
let editingTask = null;
let editingPlan = null;
let editingReview = null;

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    loadUser();
    initializeApp();
    setDefaultDates();
    updateNavigation();
    goTo('home');
});

// 加载用户信息
function loadUser() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        updateUserInterface();
    }
}

// 初始化应用
function initializeApp() {
    // 创建demo测试用户和默认数据
    initializeDemoUser();
    initializeDefaultCategories();
    initializeScheduleTemplates();
    
    // 设置默认日期
    setDefaultDates();
    
    // 添加导航链接样式
    updateNavigation();
    
    // 显示初始化完成的提示
    console.log('应用初始化完成');
}

// 初始化demo测试用户
function initializeDemoUser() {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // 检查是否已存在demo用户
    const demoUserExists = users.find(u => u.username === 'demo');
    
    if (!demoUserExists) {
        const demoUser = {
            id: 'demo_' + Date.now(),
            username: 'demo',
            email: 'demo@example.com',
            password: '123456',
            role: 'user', // user, admin, guest
            created_at: new Date().toISOString()
        };
        
        users.push(demoUser);
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        console.log('Demo用户已创建：用户名: demo, 密码: 123456');
    }
    
    // 创建管理员账号
    const adminExists = users.find(u => u.username === 'admin');
    if (!adminExists) {
        const adminUser = {
            id: 'admin_' + Date.now(),
            username: 'admin',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin',
            created_at: new Date().toISOString()
        };
        
        users.push(adminUser);
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        console.log('管理员账号已创建：用户名: admin, 密码: admin123');
    }
}

// 初始化默认分类
function initializeDefaultCategories() {
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    
    if (categories.length === 0) {
        const defaultCategories = [
            { id: 'work', name: '工作', color: '#3B82F6', icon: '💼', user_id: null },
            { id: 'life', name: '生活', color: '#10B981', icon: '🏠', user_id: null },
            { id: 'study', name: '学习', color: '#F59E0B', icon: '📚', user_id: null },
            { id: 'health', name: '健康', color: '#EF4444', icon: '🏃', user_id: null },
            { id: 'entertainment', name: '娱乐', color: '#8B5CF6', icon: '🎮', user_id: null }
        ];
        
        localStorage.setItem('categories', JSON.stringify(defaultCategories));
    }
}

// 初始化作息表模板
function initializeScheduleTemplates() {
    const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    
    if (schedules.length === 0) {
        const defaultSchedule = {
            id: 'default_' + Date.now(),
            user_id: null, // 系统默认模板
            name: '标准作息表',
            slots: [
                { time: '06:00', activity: '起床', category: 'life' },
                { time: '07:00', activity: '早餐', category: 'life' },
                { time: '08:00', activity: '上班/上学', category: 'work' },
                { time: '12:00', activity: '午餐', category: 'life' },
                { time: '13:00', activity: '午休', category: 'life' },
                { time: '14:00', activity: '工作/学习', category: 'work' },
                { time: '18:00', activity: '晚餐', category: 'life' },
                { time: '19:00', activity: '娱乐时间', category: 'entertainment' },
                { time: '22:00', activity: '准备睡觉', category: 'life' },
                { time: '23:00', activity: '睡觉', category: 'life' }
            ],
            created_at: new Date().toISOString()
        };
        
        schedules.push(defaultSchedule);
        localStorage.setItem('schedules', JSON.stringify(schedules));
    }
}

// 设置默认日期
function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    
    // 设置任务表单默认日期
    const taskDueDate = document.getElementById('task-due-date');
    if (taskDueDate) taskDueDate.value = today;
    
    // 设置计划表单默认日期
    const planDate = document.getElementById('plan-date');
    if (planDate) planDate.value = today;
    
    // 设置回顾表单默认日期
    const reviewDate = document.getElementById('review-date');
    if (reviewDate) reviewDate.value = today;
}

// 页面导航
function goTo(page) {
    // 检查登录状态
    if ((['plans', 'reviews', 'stats', 'schedule', 'categories'].includes(page)) && !currentUser) {
        showToast('请先登录', 'error');
        page = 'login';
    }
    
    // 检查管理员权限
    if (page === 'admin' && !isAdmin()) {
        showToast('权限不足，需要管理员权限', 'error');
        page = 'home';
    }
    
    // 隐藏所有页面
    const pages = ['home', 'tasks', 'plans', 'reviews', 'stats', 'schedule', 'categories', 'admin', 'login', 'register'];
    pages.forEach(p => {
        const element = document.getElementById(`${p}-page`);
        if (element) element.classList.add('hidden');
    });
    
    // 显示目标页面
    const targetPage = document.getElementById(`${page}-page`);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        currentPage = page;
        updateNavigation();
        
        // 根据页面加载相应数据
        switch(page) {
            case 'home':
                loadHomePage();
                break;
            case 'tasks':
                loadTasksPage();
                break;
            case 'plans':
                loadPlansPage();
                break;
            case 'reviews':
                loadReviewsPage();
                break;
            case 'stats':
                loadStatsPage();
                break;
            case 'schedule':
                loadSchedulePage();
                break;
            case 'categories':
                loadCategoriesPage();
                break;
            case 'admin':
                loadAdminPanel();
                break;
        }
    }
    
    // 关闭移动端菜单
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) mobileMenu.classList.add('hidden');
    
    // 滚动到顶部
    window.scrollTo(0, 0);
}

// 更新导航状态
function updateNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('text-indigo-600', 'font-semibold');
        link.classList.add('text-gray-700', 'hover:text-indigo-600');
    });
    
    const activeLink = document.querySelector(`[onclick="goTo('${currentPage}')"]`);
    if (activeLink && activeLink.classList.contains('nav-link')) {
        activeLink.classList.remove('text-gray-700', 'hover:text-indigo-600');
        activeLink.classList.add('text-indigo-600', 'font-semibold');
    }
}

// 更新用户界面
function updateUserInterface() {
    const userInfo = document.getElementById('user-info');
    const authButtons = document.getElementById('auth-buttons');
    const usernameDisplay = document.getElementById('username-display');
    const roleBadge = document.getElementById('role-badge');
    const adminPanelBtn = document.getElementById('admin-panel-btn');
    const adminMobileBtn = document.getElementById('admin-mobile-btn');
    
    if (currentUser) {
        userInfo.classList.remove('hidden');
        authButtons.classList.add('hidden');
        if (usernameDisplay) usernameDisplay.textContent = currentUser.username;
        
        // 显示角色徽章
        if (roleBadge && currentUser.role) {
            roleBadge.textContent = getRoleDisplayName(currentUser.role);
            roleBadge.className = `role-badge role-${currentUser.role}`;
            roleBadge.classList.remove('hidden');
        }
        
        // 显示管理员面板按钮
        if (isAdmin()) {
            if (adminPanelBtn) adminPanelBtn.classList.remove('hidden');
            if (adminMobileBtn) adminMobileBtn.classList.remove('hidden');
        } else {
            if (adminPanelBtn) adminPanelBtn.classList.add('hidden');
            if (adminMobileBtn) adminMobileBtn.classList.add('hidden');
        }
        
        // 更新首页预览
        updateHomePagePreview();
    } else {
        userInfo.classList.add('hidden');
        authButtons.classList.remove('hidden');
        
        // 清空首页预览
        clearHomePagePreview();
    }
}

// 切换移动端菜单
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    
    if (mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.remove('hidden');
        menuIcon.setAttribute('d', 'M6 18L18 6M6 6l12 12');
    } else {
        mobileMenu.classList.add('hidden');
        menuIcon.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
    }
}

// 用户认证
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        showToast('用户名或密码错误', 'error');
        return;
    }
    
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    updateUserInterface();
    showToast('登录成功！', 'success');
    goTo('home');
}

function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    if (password.length < 6) {
        showToast('密码长度至少6位', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // 检查用户名是否已存在
    if (users.find(u => u.username === username)) {
        showToast('用户名已存在', 'error');
        return;
    }
    
    // 检查邮箱是否已存在
    if (users.find(u => u.email === email)) {
        showToast('邮箱已被注册', 'error');
        return;
    }
    
    const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password,
        role: 'user', // 默认为普通用户
        created_at: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    
    showToast('注册成功！请登录', 'success');
    goTo('login');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUserInterface();
    showToast('已退出', 'success');
    goTo('home');
}

// 任务管理
function loadTasksPage() {
    if (!currentUser) {
        document.getElementById('tasks-list').innerHTML = `
            <div class="bg-white rounded-lg shadow p-12 text-center">
                <p class="text-gray-600 mb-4">请先登录查看任务</p>
            </div>
        `;
        return;
    }
    
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const userTasks = tasks.filter(task => task.user_id === currentUser.id);
    
    displayTasks(userTasks);
}

function displayTasks(tasks) {
    const filteredTasks = filterTasks(tasks);
    const container = document.getElementById('tasks-list');
    
    if (filteredTasks.length === 0) {
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow p-12 text-center">
                <svg class="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <p class="text-gray-600 mb-4">暂无任务</p>
                <button onclick="showTaskForm()" class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
                    创建第一个任务
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredTasks.map(task => `
        <div class="bg-white rounded-lg shadow p-6 ${task.completed ? 'opacity-75' : ''}">
            <div class="flex items-start gap-4">
                <input type="checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="toggleTask('${task.id}')" 
                       class="w-5 h-5 text-indigo-600 rounded mt-1"/>
                <div class="flex-1">
                    <h3 class="text-lg font-semibold ${task.completed ? 'line-through text-gray-500' : ''}">
                        ${task.title}
                    </h3>
                    ${task.description ? `<p class="text-gray-600 mt-1">${task.description}</p>` : ''}
                    <div class="flex gap-4 mt-3">
                        <span class="text-xs px-2 py-1 rounded ${
                            task.priority === 'high' ? 'bg-red-100 text-red-600' : 
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' : 
                            'bg-green-100 text-green-600'
                        }">
                            ${task.priority === 'high' ? '高优先级' : 
                              task.priority === 'medium' ? '中优先级' : '低优先级'}
                        </span>
                        ${task.due_date ? `<span class="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded">
                            截止: ${task.due_date}
                        </span>` : ''}
                        ${task.time_slot ? `<span class="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded">
                            ${formatTimeForDisplay(task.time_slot.start)} - ${formatTimeForDisplay(task.time_slot.end)}
                        </span>` : ''}
                        <span class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            ${task.category === 'work' ? '工作' : task.category === 'life' ? '生活' : '学习'}
                        </span>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button onclick="editTask('${task.id}')" class="text-indigo-600 hover:text-indigo-800 p-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                    </button>
                    <button onclick="deleteTask('${task.id}')" class="text-red-600 hover:text-red-800 p-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterTasks(tasks) {
    const today = new Date().toISOString().split('T')[0];
    
    return tasks.filter(task => {
        switch(currentTaskFilter) {
            case 'completed':
                return task.completed;
            case 'pending':
                return !task.completed;
            case 'today':
                return task.due_date === today;
            default:
                return true;
        }
    });
}

function setTaskFilter(filter) {
    currentTaskFilter = filter;
    
    // 更新按钮状态
    document.querySelectorAll('.task-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 重新显示任务
    if (currentUser) {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const userTasks = tasks.filter(task => task.user_id === currentUser.id);
        displayTasks(userTasks);
    }
}

function showTaskForm() {
    if (!currentUser) {
        showToast('请先登录', 'error');
        return;
    }
    
    // 动态填充分类选择器
    populateCategorySelect();
    
    const modal = document.getElementById('task-modal');
    const title = document.getElementById('task-modal-title');
    const saveBtn = document.getElementById('task-save-btn');
    
    if (editingTask) {
        title.textContent = '编辑任务';
        saveBtn.textContent = '更新';
    } else {
        title.textContent = '添加任务';
        saveBtn.textContent = '添加';
    }
    
    modal.classList.remove('hidden');
}

// 填充分类选择器
function populateCategorySelect() {
    const categorySelect = document.getElementById('task-category');
    if (!categorySelect) return;
    
    const categories = getUserCategories();
    categorySelect.innerHTML = categories.map(category => 
        `<option value="${category.id}">${category.icon} ${category.name}</option>`
    ).join('');
}

function hideTaskForm() {
    document.getElementById('task-modal').classList.add('hidden');
    clearTaskForm();
    editingTask = null;
}

function clearTaskForm() {
    document.getElementById('task-title').value = '';
    document.getElementById('task-description').value = '';
    document.getElementById('task-priority').value = 'medium';
    document.getElementById('task-category').value = 'work';
    document.getElementById('task-due-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('task-start-time').value = '';
    document.getElementById('task-end-time').value = '';
}

function saveTask() {
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    const priority = document.getElementById('task-priority').value;
    const category = document.getElementById('task-category').value;
    const dueDate = document.getElementById('task-due-date').value;
    const startTime = document.getElementById('task-start-time').value;
    const endTime = document.getElementById('task-end-time').value;
    
    if (!title) {
        showToast('请输入任务标题', 'error');
        return;
    }
    
    // 检查时间段冲突
    if (startTime && endTime) {
        if (startTime >= endTime) {
            showToast('结束时间必须晚于开始时间', 'error');
            return;
        }
        
        if (checkTimeSlotConflict(dueDate, startTime, endTime, editingTask?.id)) {
            showToast('该时间段已有其他任务安排', 'error');
            return;
        }
    }
    
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    if (editingTask) {
        // 更新任务
        const taskIndex = tasks.findIndex(t => t.id === editingTask.id);
        if (taskIndex !== -1) {
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                title,
                description,
                priority,
                category,
                due_date: dueDate,
                time_slot: startTime && endTime ? { start: startTime, end: endTime } : null,
                updated_at: new Date().toISOString()
            };
        }
        showToast('任务已更新', 'success');
    } else {
        // 创建新任务
        const newTask = {
            id: Date.now().toString(),
            user_id: currentUser.id,
            title,
            description,
            priority,
            category,
            due_date: dueDate,
            time_slot: startTime && endTime ? { start: startTime, end: endTime } : null,
            completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        tasks.push(newTask);
        showToast('任务已添加', 'success');
    }
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
    hideTaskForm();
    loadTasksPage();
}

function editTask(taskId) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    editingTask = tasks.find(t => t.id === taskId);
    
    if (editingTask) {
        document.getElementById('task-title').value = editingTask.title;
        document.getElementById('task-description').value = editingTask.description || '';
        document.getElementById('task-priority').value = editingTask.priority || 'medium';
        document.getElementById('task-category').value = editingTask.category || 'work';
        document.getElementById('task-due-date').value = editingTask.due_date || '';
        
        // 填充时间段
        if (editingTask.time_slot) {
            document.getElementById('task-start-time').value = editingTask.time_slot.start || '';
            document.getElementById('task-end-time').value = editingTask.time_slot.end || '';
        } else {
            document.getElementById('task-start-time').value = '';
            document.getElementById('task-end-time').value = '';
        }
        
        showTaskForm();
    }
}

function deleteTask(taskId) {
    if (!confirm('确定要删除这个任务吗？')) return;
    
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    
    showToast('任务已删除', 'success');
    loadTasksPage();
}

function toggleTask(taskId) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        tasks[taskIndex].updated_at = new Date().toISOString();
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        loadTasksPage();
        loadHomePage(); // 更新首页统计
    }
}

// 计划管理
function loadPlansPage() {
    if (!currentUser) {
        document.getElementById('plans-grid').innerHTML = `
            <div class="col-span-full bg-white rounded-lg shadow p-12 text-center">
                <p class="text-gray-600 mb-4">请先登录查看计划</p>
            </div>
        `;
        return;
    }
    
    const plans = JSON.parse(localStorage.getItem('plans') || '[]');
    const userPlans = plans.filter(plan => plan.user_id === currentUser.id);
    
    displayPlans(userPlans);
}

function displayPlans(plans) {
    const container = document.getElementById('plans-grid');
    
    if (plans.length === 0) {
        container.innerHTML = `
            <div class="col-span-full bg-white rounded-lg shadow p-12 text-center">
                <svg class="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <p class="text-gray-600 mb-4">暂无计划</p>
                <button onclick="showPlanForm()" class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
                    创建第一个计划
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = plans.map(plan => `
        <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex justify-between items-start mb-4">
                <h3 class="text-xl font-semibold">${plan.title}</h3>
                <button onclick="deletePlan('${plan.id}')" class="text-red-600 hover:text-red-800">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                </button>
            </div>
            ${plan.description ? `<p class="text-gray-600 mb-4">${plan.description}</p>` : ''}
            <div class="flex justify-between items-center text-sm text-gray-500">
                <span>${plan.date}</span>
                <span class="px-2 py-1 bg-blue-100 text-blue-600 rounded">
                    ${plan.type === 'daily' ? '日计划' : plan.type === 'weekly' ? '周计划' : '月计划'}
                </span>
            </div>
            <div class="mt-4 pt-4 border-t">
                <p class="text-sm text-gray-500">包含 ${plan.tasks?.length || 0} 个任务</p>
            </div>
        </div>
    `).join('');
}

function showPlanForm() {
    if (!currentUser) {
        showToast('请先登录', 'error');
        return;
    }
    
    document.getElementById('plan-modal').classList.remove('hidden');
    setDefaultDates();
}

function hidePlanForm() {
    document.getElementById('plan-modal').classList.add('hidden');
    clearPlanForm();
}

function clearPlanForm() {
    document.getElementById('plan-title').value = '';
    document.getElementById('plan-description').value = '';
    document.getElementById('plan-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('plan-type').value = 'daily';
}

function savePlan() {
    const title = document.getElementById('plan-title').value.trim();
    const description = document.getElementById('plan-description').value.trim();
    const date = document.getElementById('plan-date').value;
    const type = document.getElementById('plan-type').value;
    
    if (!title) {
        showToast('请输入计划标题', 'error');
        return;
    }
    
    const plans = JSON.parse(localStorage.getItem('plans') || '[]');
    const newPlan = {
        id: Date.now().toString(),
        user_id: currentUser.id,
        title,
        description,
        date,
        type,
        tasks: [],
        created_at: new Date().toISOString()
    };
    
    plans.push(newPlan);
    localStorage.setItem('plans', JSON.stringify(plans));
    
    showToast('计划已创建', 'success');
    hidePlanForm();
    loadPlansPage();
}

function deletePlan(planId) {
    if (!confirm('确定要删除这个计划吗？')) return;
    
    const plans = JSON.parse(localStorage.getItem('plans') || '[]');
    const updatedPlans = plans.filter(p => p.id !== planId);
    localStorage.setItem('plans', JSON.stringify(updatedPlans));
    
    showToast('计划已删除', 'success');
    loadPlansPage();
}

// 回顾管理
function loadReviewsPage() {
    if (!currentUser) {
        document.getElementById('reviews-list').innerHTML = `
            <div class="bg-white rounded-lg shadow p-12 text-center">
                <p class="text-gray-600 mb-4">请先登录查看回顾</p>
            </div>
        `;
        return;
    }
    
    const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const userReviews = reviews.filter(review => review.user_id === currentUser.id);
    
    displayReviews(userReviews);
}

function displayReviews(reviews) {
    const container = document.getElementById('reviews-list');
    
    if (reviews.length === 0) {
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow p-12 text-center">
                <svg class="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p class="text-gray-600 mb-4">暂无回顾</p>
                <button onclick="showReviewForm()" class="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700">
                    写第一个回顾
                </button>
            </div>
        `;
        return;
    }
    
    const moodEmojis = {
        excellent: '😄',
        good: '😊',
        normal: '😐',
        bad: '😔',
        terrible: '😢'
    };
    
    const moodTexts = {
        excellent: '非常棒',
        good: '不错',
        normal: '一般',
        bad: '不太好',
        terrible: '很糟糕'
    };
    
    container.innerHTML = reviews.map(review => `
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">${moodEmojis[review.mood]}</span>
                    <div>
                        <h3 class="text-xl font-semibold">${review.date} 回顾</h3>
                        <p class="text-gray-500">心情: ${moodTexts[review.mood]}</p>
                    </div>
                </div>
                <button onclick="deleteReview('${review.id}')" class="text-red-600 hover:text-red-800">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                </button>
            </div>
            <div class="space-y-4">
                <div>
                    <h4 class="font-medium text-gray-700 mb-2">今日总结</h4>
                    <p class="text-gray-600">${review.content}</p>
                </div>
                ${review.achievements ? `
                    <div>
                        <h4 class="font-medium text-gray-700 mb-2">今日成就</h4>
                        <p class="text-green-600">${review.achievements}</p>
                    </div>
                ` : ''}
                ${review.improvements ? `
                    <div>
                        <h4 class="font-medium text-gray-700 mb-2">改进空间</h4>
                        <p class="text-blue-600">${review.improvements}</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function showReviewForm() {
    if (!currentUser) {
        showToast('请先登录', 'error');
        return;
    }
    
    document.getElementById('review-modal').classList.remove('hidden');
    setDefaultDates();
}

function hideReviewForm() {
    document.getElementById('review-modal').classList.add('hidden');
    clearReviewForm();
}

function clearReviewForm() {
    document.getElementById('review-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('review-mood').value = 'good';
    document.getElementById('review-content').value = '';
    document.getElementById('review-achievements').value = '';
    document.getElementById('review-improvements').value = '';
}

function saveReview() {
    const date = document.getElementById('review-date').value;
    const mood = document.getElementById('review-mood').value;
    const content = document.getElementById('review-content').value.trim();
    const achievements = document.getElementById('review-achievements').value.trim();
    const improvements = document.getElementById('review-improvements').value.trim();
    
    if (!content) {
        showToast('请输入回顾内容', 'error');
        return;
    }
    
    const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const newReview = {
        id: Date.now().toString(),
        user_id: currentUser.id,
        date,
        mood,
        content,
        achievements,
        improvements,
        created_at: new Date().toISOString()
    };
    
    reviews.push(newReview);
    localStorage.setItem('reviews', JSON.stringify(reviews));
    
    showToast('回顾已保存', 'success');
    hideReviewForm();
    loadReviewsPage();
}

function deleteReview(reviewId) {
    if (!confirm('确定要删除这个回顾吗？')) return;
    
    const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const updatedReviews = reviews.filter(r => r.id !== reviewId);
    localStorage.setItem('reviews', JSON.stringify(updatedReviews));
    
    showToast('回顾已删除', 'success');
    loadReviewsPage();
}

// 统计页面
function loadStatsPage() {
    if (!currentUser) return;
    
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const plans = JSON.parse(localStorage.getItem('plans') || '[]');
    const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    
    const userTasks = tasks.filter(task => task.user_id === currentUser.id);
    const userPlans = plans.filter(plan => plan.user_id === currentUser.id);
    const userReviews = reviews.filter(review => review.user_id === currentUser.id);
    
    const completedTasks = userTasks.filter(task => task.completed).length;
    
    // 计算本周完成率
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekTasks = userTasks.filter(task => {
        const taskDate = new Date(task.created_at);
        return taskDate >= weekStart;
    });
    const weekCompleted = weekTasks.filter(task => task.completed).length;
    const weeklyCompletion = weekTasks.length > 0 ? Math.round((weekCompleted / weekTasks.length) * 100) : 0;
    
    // 计算本月完成率
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthTasks = userTasks.filter(task => {
        const taskDate = new Date(task.created_at);
        return taskDate >= monthStart;
    });
    const monthCompleted = monthTasks.filter(task => task.completed).length;
    const monthlyCompletion = monthTasks.length > 0 ? Math.round((monthCompleted / monthTasks.length) * 100) : 0;
    
    // 更新统计显示
    document.getElementById('total-tasks').textContent = userTasks.length;
    document.getElementById('completed-tasks').textContent = completedTasks;
    document.getElementById('total-plans').textContent = userPlans.length;
    document.getElementById('total-reviews').textContent = userReviews.length;
    
    document.getElementById('weekly-completion').textContent = weeklyCompletion + '%';
    document.getElementById('weekly-progress').style.width = weeklyCompletion + '%';
    
    document.getElementById('monthly-completion').textContent = monthlyCompletion + '%';
    document.getElementById('monthly-progress').style.width = monthlyCompletion + '%';
}

// 首页数据加载
function loadHomePage() {
    if (!currentUser) {
        // 未登录状态
        document.getElementById('today-tasks').innerHTML = '<p class="text-gray-500 text-center py-8">请先登录查看任务</p>';
        document.getElementById('schedule-preview').innerHTML = '<p class="text-gray-500 text-center py-4">请先登录查看作息表</p>';
        document.getElementById('categories-preview').innerHTML = '<p class="text-gray-500 text-center py-4">请先登录查看分类</p>';
        document.getElementById('weekly-stats').innerHTML = '<p class="text-gray-500">请先登录查看统计</p>';
        document.getElementById('recent-activities').innerHTML = '<p class="text-gray-500 text-center py-8">暂无活动记录</p>';
        return;
    }
    
    // 加载今日任务
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(task => 
        task.due_date === today && task.user_id === currentUser.id
    ).slice(0, 3);
    
    if (todayTasks.length === 0) {
        document.getElementById('today-tasks').innerHTML = '<p class="text-gray-500 text-center py-8">暂无今日任务</p>';
    } else {
        document.getElementById('today-tasks').innerHTML = `
            <div class="space-y-3">
                ${todayTasks.map(task => `
                    <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <input type="checkbox" ${task.completed ? 'checked' : ''} 
                               onchange="toggleTask('${task.id}')" 
                               class="w-4 h-4 text-indigo-600 rounded"/>
                        <span class="flex-1 ${task.completed ? 'line-through text-gray-500' : ''}">
                            ${task.title}
                        </span>
                        <span class="text-xs px-2 py-1 rounded ${
                            task.priority === 'high' ? 'bg-red-100 text-red-600' : 
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' : 
                            'bg-green-100 text-green-600'
                        }">
                            ${task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                        </span>
                    </div>
                `).join('')}
                <button onclick="goTo('tasks')" class="w-full text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    查看全部任务 →
                </button>
            </div>
        `;
    }
    
    // 更新作息表预览
    updateSchedulePreview();
    
    // 更新分类预览
    updateCategoriesPreview();
    
    // 计算本周统计
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekTasks = tasks.filter(task => {
        const taskDate = new Date(task.created_at);
        return taskDate >= weekStart && task.user_id === currentUser.id;
    });
    const completed = weekTasks.filter(task => task.completed).length;
    const completionRate = weekTasks.length > 0 ? Math.round((completed / weekTasks.length) * 100) : 0;
    
    document.getElementById('weekly-stats').innerHTML = `
        <div class="text-center">
            <div class="text-4xl font-bold text-indigo-600 mb-2">${completionRate}%</div>
            <p class="text-gray-600 mb-4">任务完成率</p>
            <div class="bg-gray-200 rounded-full h-2 mb-4">
                <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300" style="width: ${completionRate}%"></div>
            </div>
            <p class="text-sm text-gray-500">已完成 ${completed} / ${weekTasks.length} 个任务</p>
        </div>
    `;
    
    // 更新最近活动
    updateRecentActivities();
}

// 工具函数
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `fade-in mb-2 px-6 py-3 rounded-lg shadow-lg text-white`;
    
    switch(type) {
        case 'success':
            toast.classList.add('bg-green-500');
            break;
        case 'error':
            toast.classList.add('bg-red-500');
            break;
        default:
            toast.classList.add('bg-indigo-500');
    }
    
    toast.innerHTML = `<span class="text-sm">${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// 添加CSS样式
const style = document.createElement('style');
style.textContent = `
    .nav-link {
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        transition: all 0.2s;
    }
    
    .task-filter-btn {
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-medium;
        transition: all 0.2s;
        background-color: #f3f4f6;
        color: #374151;
    }
    
    .task-filter-btn:hover {
        background-color: #e5e7eb;
    }
    
    .task-filter-btn.active {
        background-color: #4f46e5;
        color: white;
    }
    
    .role-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        font-weight: 600;
    }
    
    .role-admin {
        background-color: #fef3c7;
        color: #92400e;
    }
    
    .role-user {
        background-color: #dbeafe;
        color: #1e40af;
    }
    
    .role-guest {
        background-color: #f3f4f6;
        color: #374151;
    }
    
    .time-slot {
        border-left: 4px solid;
        padding-left: 1rem;
        margin-bottom: 0.5rem;
    }
    
    .category-tag {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        font-weight: 500;
    }
`;
document.head.appendChild(style);

// ==================== 用户角色管理 ====================

// 检查用户角色
function isAdmin() {
    return currentUser && currentUser.role === 'admin';
}

function isGuest() {
    return currentUser && currentUser.role === 'guest';
}

function isUser() {
    return currentUser && currentUser.role === 'user';
}

// 获取用户角色显示名称
function getRoleDisplayName(role) {
    switch(role) {
        case 'admin': return '管理员';
        case 'guest': return '游客';
        case 'user': return '用户';
        default: return '未知';
    }
}

// 更新用户界面显示角色
function updateUserRoleDisplay() {
    const userInfo = document.getElementById('user-info');
    if (userInfo && currentUser) {
        const roleBadge = userInfo.querySelector('.role-badge');
        if (roleBadge) {
            roleBadge.textContent = getRoleDisplayName(currentUser.role);
            roleBadge.className = `role-badge role-${currentUser.role}`;
        }
    }
}

// ==================== 分类管理功能 ====================

// 获取用户分类
function getUserCategories() {
    const allCategories = JSON.parse(localStorage.getItem('categories') || '[]');
    const userCategories = allCategories.filter(cat => 
        cat.user_id === null || cat.user_id === currentUser?.id
    );
    return userCategories;
}

// 添加自定义分类
function addCustomCategory(name, color, icon) {
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    
    // 检查分类名是否已存在
    if (categories.find(cat => cat.name === name && (cat.user_id === null || cat.user_id === currentUser.id))) {
        showToast('分类名称已存在', 'error');
        return false;
    }
    
    const newCategory = {
        id: 'custom_' + Date.now(),
        name,
        color,
        icon,
        user_id: currentUser.id,
        created_at: new Date().toISOString()
    };
    
    categories.push(newCategory);
    localStorage.setItem('categories', JSON.stringify(categories));
    showToast('分类添加成功', 'success');
    return true;
}

// 删除自定义分类
function deleteCustomCategory(categoryId) {
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    const category = categories.find(cat => cat.id === categoryId);
    
    // 只允许删除用户自定义分类
    if (category && category.user_id === currentUser.id) {
        if (confirm('确定要删除这个分类吗？')) {
            const updatedCategories = categories.filter(cat => cat.id !== categoryId);
            localStorage.setItem('categories', JSON.stringify(updatedCategories));
            showToast('分类已删除', 'success');
            return true;
        }
    }
    return false;
}

// ==================== 作息表管理功能 ====================

// 获取用户作息表
function getUserSchedules() {
    const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    return schedules.filter(schedule => 
        schedule.user_id === null || schedule.user_id === currentUser?.id
    );
}

// 创建作息表
function createSchedule(name, slots) {
    const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    
    const newSchedule = {
        id: 'schedule_' + Date.now(),
        user_id: currentUser.id,
        name,
        slots,
        created_at: new Date().toISOString()
    };
    
    schedules.push(newSchedule);
    localStorage.setItem('schedules', JSON.stringify(schedules));
    showToast('作息表创建成功', 'success');
    return newSchedule;
}

// 更新作息表
function updateSchedule(scheduleId, name, slots) {
    const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    const scheduleIndex = schedules.findIndex(s => s.id === scheduleId);
    
    if (scheduleIndex !== -1) {
        schedules[scheduleIndex] = {
            ...schedules[scheduleIndex],
            name,
            slots,
            updated_at: new Date().toISOString()
        };
        localStorage.setItem('schedules', JSON.stringify(schedules));
        showToast('作息表更新成功', 'success');
        return true;
    }
    return false;
}

// ==================== 增强任务功能 ====================

// 获取时间段选项
function getTimeSlots() {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const displayTime = formatTimeForDisplay(time);
            slots.push({ value: time, display: displayTime });
        }
    }
    return slots;
}

// 格式化时间显示
function formatTimeForDisplay(time) {
    const [hour, minute] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
}

// 检查时间段冲突
function checkTimeSlotConflict(date, startTime, endTime, excludeTaskId = null) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const userTasks = tasks.filter(task => 
        task.user_id === currentUser.id && 
        task.due_date === date &&
        task.time_slot &&
        task.id !== excludeTaskId
    );
    
    return userTasks.some(task => {
        const taskStart = task.time_slot.start;
        const taskEnd = task.time_slot.end;
        
        return (startTime < taskEnd && endTime > taskStart);
    });
}

// ==================== 管理员功能 ====================

// 加载管理员面板
function loadAdminPanel() {
    if (!isAdmin()) {
        showToast('权限不足，需要管理员权限', 'error');
        goTo('home');
        return;
    }
    
    const content = document.getElementById('admin-content');
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    content.innerHTML = `
        <div class="max-w-6xl mx-auto p-6">
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">管理员面板</h1>
                <p class="text-gray-600">系统管理和用户管理</p>
            </div>
            
            <!-- 用户统计 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-blue-100">
                            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">总用户数</p>
                            <p class="text-2xl font-semibold text-gray-900">${users.length}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-green-100">
                            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">活跃用户</p>
                            <p class="text-2xl font-semibold text-gray-900">${users.filter(u => u.role !== 'guest').length}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-yellow-100">
                            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">管理员</p>
                            <p class="text-2xl font-semibold text-gray-900">${users.filter(u => u.role === 'admin').length}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 用户列表 -->
            <div class="bg-white rounded-lg shadow">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h2 class="text-lg font-semibold text-gray-900">用户管理</h2>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户名</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邮箱</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">注册时间</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${users.map(user => `
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${user.username}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.email}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="role-badge role-${user.role}">${getRoleDisplayName(user.role)}</span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ${new Date(user.created_at).toLocaleDateString('zh-CN')}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        ${user.username !== 'admin' ? `
                                            <button onclick="changeUserRole('${user.id}', '${user.role === 'admin' ? 'user' : 'admin'}')" 
                                                    class="text-indigo-600 hover:text-indigo-900 mr-3">
                                                ${user.role === 'admin' ? '降级为用户' : '升级为管理员'}
                                            </button>
                                            <button onclick="deleteUser('${user.id}')" class="text-red-600 hover:text-red-900">
                                                删除
                                            </button>
                                        ` : '<span class="text-gray-400">系统管理员</span>'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// 修改用户角色
function changeUserRole(userId, newRole) {
    if (!isAdmin()) {
        showToast('权限不足', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
        users[userIndex].role = newRole;
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        showToast('用户角色已更新', 'success');
        loadAdminPanel();
    }
}

// 删除用户
function deleteUser(userId) {
    if (!isAdmin()) {
        showToast('权限不足', 'error');
        return;
    }
    
    if (confirm('确定要删除这个用户吗？此操作不可恢复！')) {
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const updatedUsers = users.filter(u => u.id !== userId);
        localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
        
        // 同时删除该用户的所有数据
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]').filter(t => t.user_id !== userId);
        const plans = JSON.parse(localStorage.getItem('plans') || '[]').filter(p => p.user_id !== userId);
        const reviews = JSON.parse(localStorage.getItem('reviews') || '[]').filter(r => r.user_id !== userId);
        
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('plans', JSON.stringify(plans));
        localStorage.setItem('reviews', JSON.stringify(reviews));
        
        showToast('用户已删除', 'success');
        loadAdminPanel();
    }
}

// ==================== 游客模式功能 ====================

// 创建游客账号
function createGuestAccount() {
    const guestUser = {
        id: 'guest_' + Date.now(),
        username: 'guest_' + Date.now(),
        email: 'guest@example.com',
        password: '',
        role: 'guest',
        created_at: new Date().toISOString()
    };
    
    currentUser = guestUser;
    localStorage.setItem('currentUser', JSON.stringify(guestUser));
    updateUserInterface();
    showToast('已进入游客模式', 'success');
    goTo('home');
}

// ==================== 作息表页面 ====================

// 加载作息表页面
function loadSchedulePage() {
    if (!currentUser) {
        document.getElementById('schedules-list').innerHTML = `
            <div class="bg-white rounded-lg shadow p-12 text-center">
                <svg class="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-gray-600 mb-4">请先登录查看作息表</p>
            </div>
        `;
        return;
    }
    
    const schedules = getUserSchedules();
    const categories = getUserCategories();
    
    const content = document.getElementById('schedules-list');
    content.innerHTML = `
        <div class="max-w-6xl mx-auto p-6">
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">作息表管理</h1>
                <p class="text-gray-600">管理您的时间安排和日常活动</p>
            </div>
            
            <!-- 创建作息表按钮 -->
            <div class="mb-6">
                <button onclick="showScheduleForm()" class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
                    创建新作息表
                </button>
            </div>
            
            <!-- 作息表列表 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                ${schedules.map(schedule => `
                    <div class="bg-white rounded-lg shadow-lg p-6">
                        <div class="flex justify-between items-start mb-4">
                            <h3 class="text-xl font-semibold">${schedule.name}</h3>
                            <div class="flex gap-2">
                                <button onclick="editSchedule('${schedule.id}')" class="text-blue-600 hover:text-blue-800">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                    </svg>
                                </button>
                                <button onclick="deleteSchedule('${schedule.id}')" class="text-red-600 hover:text-red-800">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <div class="space-y-3">
                            ${schedule.slots.map(slot => {
                                const category = categories.find(cat => cat.id === slot.category);
                                return `
                                    <div class="time-slot" style="border-color: ${category?.color || '#6B7280'}">
                                        <div class="flex justify-between items-center">
                                            <span class="font-medium">${slot.time}</span>
                                            <span class="category-tag" style="background-color: ${category?.color || '#6B7280'}20; color: ${category?.color || '#6B7280'}">
                                                ${category?.icon || '📋'} ${category?.name || '未分类'}
                                            </span>
                                        </div>
                                        <p class="text-gray-600 mt-1">${slot.activity}</p>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            ${schedules.length === 0 ? `
                <div class="bg-white rounded-lg shadow p-12 text-center">
                    <svg class="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p class="text-gray-600 mb-4">暂无作息表</p>
                    <button onclick="showScheduleForm()" class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
                        创建第一个作息表
                    </button>
                </div>
            ` : ''}
        </div>
        
        <!-- 作息表表单模态框 -->
        <div id="schedule-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden modal-overlay">
            <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h3 class="text-xl font-semibold mb-4" id="schedule-modal-title">创建作息表</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">作息表名称 *</label>
                        <input id="schedule-name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="输入作息表名称"/>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">时间安排</label>
                        <div id="schedule-slots" class="space-y-3">
                            <!-- 时间段将在这里动态添加 -->
                        </div>
                        <button onclick="addScheduleSlot()" class="mt-2 text-green-600 hover:text-green-800 text-sm">
                            + 添加时间段
                        </button>
                    </div>
                </div>
                <div class="flex justify-end gap-3 mt-6">
                    <button onclick="hideScheduleForm()" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">取消</button>
                    <button onclick="saveSchedule()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">保存</button>
                </div>
            </div>
        </div>
    `;
    
    // 如果是编辑模式，初始化表单数据
    if (window.editingSchedule) {
        document.getElementById('schedule-modal-title').textContent = '编辑作息表';
        document.getElementById('schedule-name').value = window.editingSchedule.name;
        
        const slotsContainer = document.getElementById('schedule-slots');
        slotsContainer.innerHTML = '';
        window.editingSchedule.slots.forEach(slot => {
            addScheduleSlot(slot.time, slot.activity, slot.category);
        });
    } else {
        // 创建新作息表时添加默认时间段
        document.getElementById('schedule-modal-title').textContent = '创建作息表';
        document.getElementById('schedule-name').value = '';
        const slotsContainer = document.getElementById('schedule-slots');
        slotsContainer.innerHTML = '';
        addScheduleSlot('08:00', '起床', 'life');
        addScheduleSlot('09:00', '工作/学习', 'work');
        addScheduleSlot('12:00', '午餐', 'life');
        addScheduleSlot('18:00', '晚餐', 'life');
        addScheduleSlot('22:00', '睡觉', 'life');
    }
}

// 显示作息表表单
function showScheduleForm() {
    if (!currentUser) {
        showToast('请先登录', 'error');
        return;
    }
    window.editingSchedule = null;
    document.getElementById('schedule-modal').classList.remove('hidden');
}

// 隐藏作息表表单
function hideScheduleForm() {
    document.getElementById('schedule-modal').classList.add('hidden');
    window.editingSchedule = null;
}

// 添加时间段
function addScheduleSlot(time = '', activity = '', category = 'life') {
    const slotsContainer = document.getElementById('schedule-slots');
    const categories = getUserCategories();
    
    const slotHtml = `
        <div class="schedule-slot grid grid-cols-12 gap-2 items-center p-3 border border-gray-200 rounded-lg">
            <div class="col-span-3">
                <input type="time" value="${time}" class="slot-time w-full px-2 py-1 border border-gray-300 rounded text-sm"/>
            </div>
            <div class="col-span-5">
                <input type="text" value="${activity}" placeholder="活动内容" class="slot-activity w-full px-2 py-1 border border-gray-300 rounded text-sm"/>
            </div>
            <div class="col-span-3">
                <select class="slot-category w-full px-2 py-1 border border-gray-300 rounded text-sm">
                    ${categories.map(cat => `
                        <option value="${cat.id}" ${cat.id === category ? 'selected' : ''}>
                            ${cat.icon} ${cat.name}
                        </option>
                    `).join('')}
                </select>
            </div>
            <div class="col-span-1">
                <button onclick="removeScheduleSlot(this)" class="text-red-600 hover:text-red-800">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    slotsContainer.insertAdjacentHTML('beforeend', slotHtml);
}

// 移除时间段
function removeScheduleSlot(button) {
    button.closest('.schedule-slot').remove();
}

// 保存作息表
function saveSchedule() {
    const name = document.getElementById('schedule-name').value.trim();
    if (!name) {
        showToast('请输入作息表名称', 'error');
        return;
    }
    
    const slotElements = document.querySelectorAll('.schedule-slot');
    const slots = Array.from(slotElements).map(slotEl => {
        const time = slotEl.querySelector('.slot-time').value;
        const activity = slotEl.querySelector('.slot-activity').value.trim();
        const category = slotEl.querySelector('.slot-category').value;
        
        if (!time || !activity) return null;
        
        return { time, activity, category };
    }).filter(slot => slot !== null);
    
    if (slots.length === 0) {
        showToast('请至少添加一个时间段', 'error');
        return;
    }
    
    if (window.editingSchedule) {
        // 更新现有作息表
        updateSchedule(window.editingSchedule.id, name, slots);
    } else {
        // 创建新作息表
        createSchedule(name, slots);
    }
    
    hideScheduleForm();
    loadSchedulePage();
}

// 编辑作息表
function editSchedule(scheduleId) {
    const schedules = getUserSchedules();
    const schedule = schedules.find(s => s.id === scheduleId);
    if (schedule) {
        window.editingSchedule = schedule;
        showScheduleForm();
    }
}

// 删除作息表
function deleteSchedule(scheduleId) {
    if (confirm('确定要删除这个作息表吗？')) {
        const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
        const updatedSchedules = schedules.filter(s => s.id !== scheduleId);
        localStorage.setItem('schedules', JSON.stringify(updatedSchedules));
        showToast('作息表已删除', 'success');
        loadSchedulePage();
    }
}

// ==================== 分类管理页面 ====================

// 加载分类管理页面
function loadCategoriesPage() {
    if (!currentUser) {
        document.getElementById('categories-list').innerHTML = `
            <div class="bg-white rounded-lg shadow p-12 text-center">
                <svg class="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                </svg>
                <p class="text-gray-600 mb-4">请先登录查看分类</p>
            </div>
        `;
        return;
    }
    
    const categories = getUserCategories();
    const userCategories = categories.filter(cat => cat.user_id === currentUser.id);
    const systemCategories = categories.filter(cat => cat.user_id === null);
    
    const content = document.getElementById('categories-list');
    content.innerHTML = `
        <div class="max-w-4xl mx-auto p-6">
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">分类管理</h1>
                <p class="text-gray-600">创建和管理您的自定义分类</p>
            </div>
            
            <!-- 创建分类按钮 -->
            <div class="mb-6">
                <button onclick="showCategoryForm()" class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">
                    创建新分类
                </button>
            </div>
            
            <!-- 系统分类 -->
            <div class="mb-8">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">系统分类</h2>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    ${systemCategories.map(category => `
                        <div class="bg-white rounded-lg shadow p-4 text-center">
                            <div class="text-2xl mb-2">${category.icon}</div>
                            <h3 class="font-medium text-gray-900">${category.name}</h3>
                            <div class="mt-2">
                                <span class="inline-block w-4 h-4 rounded" style="background-color: ${category.color}"></span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- 用户自定义分类 -->
            <div>
                <h2 class="text-lg font-semibold text-gray-900 mb-4">我的分类</h2>
                ${userCategories.length > 0 ? `
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        ${userCategories.map(category => `
                            <div class="bg-white rounded-lg shadow p-4">
                                <div class="flex justify-between items-start mb-2">
                                    <div class="text-2xl">${category.icon}</div>
                                    <button onclick="deleteCategory('${category.id}')" class="text-red-600 hover:text-red-800">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                        </svg>
                                    </button>
                                </div>
                                <h3 class="font-medium text-gray-900">${category.name}</h3>
                                <div class="mt-2">
                                    <span class="inline-block w-4 h-4 rounded" style="background-color: ${category.color}"></span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="bg-gray-50 rounded-lg p-8 text-center">
                        <p class="text-gray-600 mb-4">暂无自定义分类</p>
                        <button onclick="showCategoryForm()" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                            创建第一个分类
                        </button>
                    </div>
                `}
            </div>
        </div>
        
        <!-- 分类表单模态框 -->
        <div id="category-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden modal-overlay">
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-xl font-semibold mb-4">创建分类</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">分类名称 *</label>
                        <input id="category-name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="输入分类名称"/>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">图标</label>
                        <input id="category-icon" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="输入emoji图标，如：📝"/>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">颜色</label>
                        <input id="category-color" type="color" class="w-full h-10 border border-gray-300 rounded-lg" value="#8B5CF6"/>
                    </div>
                </div>
                <div class="flex justify-end gap-3 mt-6">
                    <button onclick="hideCategoryForm()" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">取消</button>
                    <button onclick="saveCategory()" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">创建</button>
                </div>
            </div>
        </div>
    `;
}

// 显示分类表单
function showCategoryForm() {
    if (!currentUser) {
        showToast('请先登录', 'error');
        return;
    }
    document.getElementById('category-modal').classList.remove('hidden');
}

// 隐藏分类表单
function hideCategoryForm() {
    document.getElementById('category-modal').classList.add('hidden');
    // 清空表单
    document.getElementById('category-name').value = '';
    document.getElementById('category-icon').value = '';
    document.getElementById('category-color').value = '#8B5CF6';
}

// 保存分类
function saveCategory() {
    const name = document.getElementById('category-name').value.trim();
    const icon = document.getElementById('category-icon').value.trim() || '📝';
    const color = document.getElementById('category-color').value;
    
    if (!name) {
        showToast('请输入分类名称', 'error');
        return;
    }
    
    if (addCustomCategory(name, color, icon)) {
        hideCategoryForm();
        loadCategoriesPage();
    }
}

// 删除分类
function deleteCategory(categoryId) {
    if (deleteCustomCategory(categoryId)) {
        loadCategoriesPage();
    }
}

// 验证管理员账号是否存在，如果不存在则创建
function verifyAdminAccount() {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const adminExists = users.find(u => u.username === 'admin');
    
    if (!adminExists) {
        console.log('管理员账号不存在，正在创建...');
        const adminUser = {
            id: 'admin_' + Date.now(),
            username: 'admin',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin',
            created_at: new Date().toISOString()
        };
        
        users.push(adminUser);
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        console.log('管理员账号已创建：用户名: admin, 密码: admin123');
    } else {
        console.log('管理员账号已存在:', adminExists);
    }
}

// ==================== 首页预览功能 ====================

// 更新首页预览
function updateHomePagePreview() {
    updateTodayTasksPreview();
    updateSchedulePreview();
    updateCategoriesPreview();
    updateWeeklyStats();
    updateRecentActivities();
}

// 清空首页预览
function clearHomePagePreview() {
    document.getElementById('today-tasks').innerHTML = '<p class="text-gray-500 text-center py-8">请先登录查看任务</p>';
    document.getElementById('schedule-preview').innerHTML = '<p class="text-gray-500 text-center py-4">请先登录查看作息表</p>';
    document.getElementById('categories-preview').innerHTML = '<p class="text-gray-500 text-center py-4">请先登录查看分类</p>';
    document.getElementById('weekly-stats').innerHTML = '<p class="text-gray-500">请先登录查看统计</p>';
    document.getElementById('recent-activities').innerHTML = '<p class="text-gray-500 text-center py-8">暂无活动记录</p>';
}

// 更新今日任务预览
function updateTodayTasksPreview() {
    const container = document.getElementById('today-tasks');
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const today = new Date().toDateString();
    
    const todayTasks = tasks.filter(task => {
        const taskDate = new Date(task.due_date).toDateString();
        return taskDate === today && task.status !== 'completed';
    });
    
    if (todayTasks.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">今日暂无任务</p>';
        return;
    }
    
    const taskList = todayTasks.slice(0, 3).map(task => `
        <div class="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
            <span class="truncate">${task.title}</span>
            <span class="text-xs px-2 py-1 rounded ${getStatusColor(task.status)}">${getStatusText(task.status)}</span>
        </div>
    `).join('');
    
    container.innerHTML = taskList + (todayTasks.length > 3 ? `<p class="text-xs text-gray-500 mt-2 text-center">还有 ${todayTasks.length - 3} 个任务...</p>` : '');
}

// 更新作息表预览
function updateSchedulePreview() {
    const container = document.getElementById('schedule-preview');
    const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    
    if (schedules.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">暂无作息表</p>';
        return;
    }
    
    const scheduleList = schedules.slice(0, 2).map(schedule => `
        <div class="p-2 bg-green-50 rounded text-sm">
            <div class="font-medium text-green-800">${schedule.name}</div>
            <div class="text-xs text-green-600">${schedule.slots ? schedule.slots.length : 0} 个时间段</div>
        </div>
    `).join('');
    
    container.innerHTML = scheduleList + (schedules.length > 2 ? `<p class="text-xs text-gray-500 mt-2 text-center">还有 ${schedules.length - 2} 个作息表...</p>` : '');
}

// 更新分类预览
function updateCategoriesPreview() {
    const container = document.getElementById('categories-preview');
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    
    if (categories.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">暂无分类</p>';
        return;
    }
    
    const categoryList = categories.slice(0, 3).map(category => `
        <div class="flex items-center p-2 bg-purple-50 rounded text-sm">
            <span class="mr-2">${category.icon || '📁'}</span>
            <span class="flex-1">${category.name}</span>
            <span class="w-3 h-3 rounded-full" style="background-color: ${category.color || '#6366f1'}"></span>
        </div>
    `).join('');
    
    container.innerHTML = categoryList + (categories.length > 3 ? `<p class="text-xs text-gray-500 mt-2 text-center">还有 ${categories.length - 3} 个分类...</p>` : '');
}

// 更新周统计
function updateWeeklyStats() {
    const container = document.getElementById('weekly-stats');
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const weeklyTasks = tasks.filter(task => {
        const taskDate = new Date(task.due_date);
        return taskDate >= weekStart && taskDate <= weekEnd;
    });
    
    const completed = weeklyTasks.filter(task => task.status === 'completed').length;
    const total = weeklyTasks.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    container.innerHTML = `
        <div class="space-y-4">
            <div class="text-center">
                <div class="text-3xl font-bold text-indigo-600">${completionRate}%</div>
                <div class="text-sm text-gray-600">本周完成率</div>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-green-600">已完成: ${completed}</span>
                <span class="text-gray-600">总计: ${total}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-indigo-600 h-2 rounded-full" style="width: ${completionRate}%"></div>
            </div>
        </div>
    `;
}

// 更新最近活动
function updateRecentActivities() {
    const container = document.getElementById('recent-activities');
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // 获取最近的任务活动
    const recentTasks = tasks
        .filter(task => task.updated_at)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 3);
    
    if (recentTasks.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">暂无活动记录</p>';
        return;
    }
    
    const activityList = recentTasks.map(task => {
        const time = new Date(task.updated_at).toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                <div class="w-2 h-2 bg-indigo-600 rounded-full mr-3"></div>
                <div class="flex-1">
                    <div class="text-sm font-medium">${task.title}</div>
                    <div class="text-xs text-gray-500">${time}</div>
                </div>
                <span class="text-xs px-2 py-1 rounded ${getStatusColor(task.status)}">${getStatusText(task.status)}</span>
            </div>
        `;
    }).join('');
    
    container.innerHTML = activityList;
}

// 获取状态颜色
function getStatusColor(status) {
    switch(status) {
        case 'completed': return 'bg-green-100 text-green-800';
        case 'in-progress': return 'bg-blue-100 text-blue-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

// 获取状态文本
function getStatusText(status) {
    switch(status) {
        case 'completed': return '已完成';
        case 'in-progress': return '进行中';
        case 'pending': return '待完成';
        default: return '未知';
    }
}

// 在页面加载完成后验证管理员账号
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(verifyAdminAccount, 100); // 延迟100ms确保initializeApp完成
});