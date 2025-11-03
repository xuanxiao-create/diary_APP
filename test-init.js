// 测试脚本 - 检查初始化是否正常工作
console.log('=== 初始化测试开始 ===');

// 手动调用初始化函数
function testInitialization() {
    console.log('开始测试初始化...');
    
    // 检查localStorage
    console.log('当前registeredUsers:', localStorage.getItem('registeredUsers'));
    
    // 手动调用初始化
    if (typeof initializeDemoUser === 'function') {
        console.log('调用initializeDemoUser...');
        initializeDemoUser();
        console.log('初始化完成，检查结果:');
        console.log('registeredUsers:', localStorage.getItem('registeredUsers'));
    } else {
        console.error('initializeDemoUser函数不存在');
    }
    
    // 检查用户
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    console.log('所有用户:', users);
    
    const adminUser = users.find(u => u.username === 'admin');
    const demoUser = users.find(u => u.username === 'demo');
    
    console.log('管理员用户:', adminUser);
    console.log('Demo用户:', demoUser);
}

// 在控制台中运行测试
window.testInitialization = testInitialization;