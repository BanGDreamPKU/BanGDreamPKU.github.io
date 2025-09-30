/**
 * 获取东京时间（GMT+9）
 * @returns {Date} 东京时间Date对象
 */
function getTokyoDate() {
    const now = new Date();
    // 计算UTC时间（本地时间 - 时区偏移）
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    // 东京时间 = UTC时间 + 9小时
    const tokyoTime = new Date(utcTime + (9 * 60 * 60000));
    return tokyoTime;
}

/**
 * 格式化日期显示
 * @param {Date} date - 要格式化的Date对象
 * @returns {string} 格式化后的日期字符串（如：2024年05月20日 星期一）
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[date.getDay()];
    
    return `${year}年${month}月${day}日 ${weekday}`;
}

/**
 * 解析生日字符串（如"1月2日"）为月份和日期
 * @param {string} birthdayStr - 生日字符串
 * @returns {Object} 包含month和day的对象（数字类型）
 */
function parseBirthday(birthdayStr) {
    const [monthStr, dayStr] = birthdayStr.split('月');
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr.replace('日', ''), 10);
    return { month, day };
}

/**
 * 计算距离下一个生日的毫秒数（考虑跨年）
 * @param {Date} now - 当前东京时间Date对象
 * @param {number} birthdayMonth - 生日月份（1-12）
 * @param {number} birthdayDay - 生日日期（1-31）
 * @returns {number} 距离生日的毫秒数
 */
function getMsUntilBirthday(now, birthdayMonth, birthdayDay) {
    const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    let year = now.getFullYear();
    // 处理2月29日的特殊情况（非闰年时按2月28日计算）
    let bMonth = birthdayMonth, bDay = birthdayDay;
    if (bMonth === 2 && bDay === 29) {
        const checkYear = (now.getMonth() + 1 > 2) ? year + 1 : year;
        bDay = isLeapYear(checkYear) ? 29 : 28;
    }
    let nextBirthday = new Date(year, bMonth - 1, bDay, 0, 0, 0, 0);
    if (nextBirthday < now) {
        year += 1;
        // 再次处理闰年
        if (bMonth === 2 && bDay === 29) {
            bDay = isLeapYear(year) ? 29 : 28;
        }
        nextBirthday = new Date(year, bMonth - 1, bDay, 0, 0, 0, 0);
    }
    return nextBirthday - now;
}

/**
 * 根据毫秒数格式化距离生日的字符串
 * @param {number} ms - 距离生日的毫秒数
 * @returns {string} 格式化后的字符串
 */
function formatDistanceToBirthday(ms) {
    if (ms < 60 * 1000) {
        return '不到1分钟后';
    } else if (ms < 60 * 60 * 1000) {
        const min = Math.ceil(ms / (60 * 1000));
        return `${min}分钟后`;
    } else if (ms < 24 * 60 * 60 * 1000) {
        const hour = Math.ceil(ms / (60 * 60 * 1000));
        return `${hour}小时后`;
    } else {
        const day = Math.ceil(ms / (24 * 60 * 60 * 1000));
        return `${day}天后`;
    }
}

/**
 * 加载并解析birthday.txt文件中的生日数据
 * @returns {Promise<Array>} 生日数据数组
 */
async function loadBirthdayData() {
    try {
        // 读取birthday.txt文件（需确保文件路径正确）
        const response = await fetch('./birthday.txt');
        if (!response.ok) {
            throw new Error(`文件加载失败（状态码：${response.status}）`);
        }
        const text = await response.text();
        
        // 解析CSV格式数据
        const lines = text.trim().split('\n');
        if (lines.length <= 1) {
            throw new Error('生日数据文件为空或仅包含表头');
        }
        
        // 跳过表头，处理数据行
        const birthdayData = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '') continue; // 跳过空行
            
            const [name, birthday, type] = line.split(',').map(col => col.trim());
            if (!name || !birthday || !type) {
                console.warn(`跳过格式错误的行（第${i+1}行）：${line}`);
                continue;
            }
            
            const { month, day } = parseBirthday(birthday);
            birthdayData.push({
                name,
                birthday,
                type,
                month,
                day,
                originalBirthday: birthday // 保留原始生日格式
            });
        }
        
        return birthdayData;
    } catch (error) {
        console.error('生日数据加载错误：', error);
        showErrorMsg('数据加载失败', error.message);
        return [];
    }
}

/**
 * 显示错误提示信息
 * @param {string} title - 错误标题
 * @param {string} message - 错误详情
 */
function showErrorMsg(title, message) {
    const todayList = document.getElementById('today-birthdays-list');
    const allList = document.getElementById('all-birthdays-list');
    
    const errorHtml = `
        <div class="col-span-full text-center text-red-500 py-8 bg-red-50 rounded-lg">
            <i class="icon-exclamation-circle text-2xl mb-3"></i>
            <h3 class="font-bold text-lg mb-1">${title}</h3>
            <p class="text-sm">${message}</p>
            <p class="text-xs mt-2">请检查birthday.txt文件是否存在且格式正确</p>
        </div>
    `;
    
    todayList.innerHTML = errorHtml;
    allList.innerHTML = '';
}

/**
 * 渲染生日列表到网页
 * @param {Array} birthdayData - 处理后的生日数据数组
 */
function renderBirthdayLists(birthdayData) {
    const tokyoDate = getTokyoDate();
    const currentMonth = tokyoDate.getMonth() + 1; // 月份从1开始
    const currentDay = tokyoDate.getDate();

    // 为每个生日计算距离今天的毫秒数，并按距离排序
    const processedData = birthdayData.map(person => {
        const msUntilBirthday = getMsUntilBirthday(
            tokyoDate,
            person.month,
            person.day
        );
        return {
            ...person,
            msUntilBirthday,
            isToday: tokyoDate.getDate() === person.day && tokyoDate.getMonth() + 1 === person.month
        };
    }).sort((a, b) => {
        if (a.msUntilBirthday !== b.msUntilBirthday) {
            return a.msUntilBirthday - b.msUntilBirthday;
        }
        if (a.month !== b.month) {
            return a.month - b.month;
        }
        return a.day - b.day;
    });

    // 分离今日寿星和其他生日数据
    const todayBirthdays = processedData.filter(person => person.isToday);
    const otherBirthdays = processedData.filter(person => !person.isToday);

    // 渲染今日寿星区域
    const todayListElement = document.getElementById('today-birthdays-list');
    if (todayBirthdays.length === 0) {
        todayListElement.innerHTML = `
            <div class="col-span-full text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
                <i class="icon-calendar text-xl mb-2"></i>
                <p>今天没有人过生日，期待后续的生日祝福吧！</p>
                <p class="text-sm mt-1">下次生日将在${otherBirthdays[0] ? formatDistanceToBirthday(otherBirthdays[0].msUntilBirthday) : '未知'}</p>
            </div>
        `;
    } else {
        todayListElement.innerHTML = todayBirthdays.map(person => `
            <div class="birthday-card birthday-highlight animate-fadeIn">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-lg text-gray-800">${person.name}</h3>
                    <span class="type-tag ${person.type === 'cv' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}">
                        ${person.type === 'cv' ? '声优' : '角色'}
                    </span>
                </div>
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2 text-yellow-600">
                        <i class="icon-star"></i> 生日快乐！🎉
                    </div>
                    <span class="date-badge">${person.originalBirthday}</span>
                </div>
            </div>
        `).join('');
    }

    // 渲染所有生日列表区域
    const allListElement = document.getElementById('all-birthdays-list');
    if (otherBirthdays.length === 0) {
        allListElement.innerHTML = `
            <div class="col-span-full text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
                <i class="icon-list-alt text-xl mb-2"></i>
                <p>没有更多生日数据</p>
            </div>
        `;
    } else {
        allListElement.innerHTML = otherBirthdays.map((person, index) => `
            <div class="birthday-card" style="transition-delay: ${index * 0.05}s">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-lg text-gray-800">${person.name}</h3>
                    <span class="type-tag ${person.type === 'cv' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}">
                        ${person.type === 'cv' ? '声优' : '角色'}
                    </span>
                </div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 text-gray-500">
                        <i class="icon-clock-o"></i>
                        <span>${formatDistanceToBirthday(person.msUntilBirthday)}</span>
                    </div>
                    <span class="date-badge">${person.originalBirthday}</span>
                </div>
            </div>
        `).join('');

        // 添加渐入动画效果
        setTimeout(() => {
            const cards = document.querySelectorAll('#all-birthdays-list .birthday-card');
            cards.forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'all 0.5s ease';

                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
            });
        }, 100);
    }
}

/**
 * 页面加载完成后初始化
 */
document.addEventListener('DOMContentLoaded', async () => {
    // 显示加载状态
    const loaderHtml = `
        <div class="col-span-full text-center text-gray-500 py-8">
            <i class="icon-spinner icon-spin text-2xl mb-3"></i>
            <p>正在加载数据...</p>
        </div>
    `;
    document.getElementById('today-birthdays-list').innerHTML = loaderHtml;
    document.getElementById('all-birthdays-list').innerHTML = loaderHtml;
    
    // 加载并渲染数据
    const birthdayData = await loadBirthdayData();
    if (birthdayData.length > 0) {
        renderBirthdayLists(birthdayData);
    } else {
        showErrorMsg('无有效数据', '未能从文件中解析出任何有效生日数据');
    }
});

// 为Date对象添加getDayOfYear方法（兼容旧浏览器）
if (!Date.prototype.getDayOfYear) {
    Date.prototype.getDayOfYear = function() {
        const start = new Date(this.getFullYear(), 0, 0);
        const diff = this - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    };
}