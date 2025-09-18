document.addEventListener('DOMContentLoaded', function() {
    fetch('birthday.txt')
        .then(response => response.text())
        .then(data => {
            const rows = data.split('\n').slice(1); // 去掉标题行
            const birthdays = rows.map(row => {
                const [name, birthday, type] = row.trim().split(',');
                return { name, birthday, type };
            });

            // 获取 GMT+9 的当前日期
            const today = getCurrentDateGMT9();
            const todayStr = getDateStr(today);
            const todayBirthdays = birthdays.filter(b => getBirthdayDate(b.birthday) === todayStr);

            // 计算下一个生日
            const nextBirthday = getNextBirthday(birthdays, today);
            const nextBirthdayStr = getDateStr(nextBirthday.date);
            const nextBirthdays = birthdays.filter(b => getBirthdayDate(b.birthday) === nextBirthdayStr);

            // 显示结果
            displayTodayDate(todayStr, 'today-date'); // 显示今天的日期
            displayBirthdays(todayBirthdays, 'today-list');
            displayNextBirthday(nextBirthday.date, nextBirthdays, 'next-date', 'next-list');
        })
        .catch(error => console.error('Error fetching the CSV file:', error));
});

// 获取 GMT+9 的当前日期
function getCurrentDateGMT9() {
    const now = new Date();
    const offset = 9; // GMT+9
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000); // 转换为 UTC 时间
    const gmt9 = new Date(utc + (3600000 * offset)); // 转换为 GMT+9 时间
    return gmt9;
}

// 将日期格式化为 "月日" 格式
function getDateStr(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
}

// 获取生日的 "月日" 格式
function getBirthdayDate(birthdayStr) {
    return birthdayStr; // 生日已经是 "月日" 格式
}

// 计算下一个生日
function getNextBirthday(birthdays, today) {
    let nextBirthday = null;
    let minDiff = Infinity;

    birthdays.forEach(b => {
        const birthdayDate = new Date(today.getFullYear(), parseInt(b.birthday.split('月')[0]) - 1, parseInt(b.birthday.split('月')[1].split('日')[0]));
        if (birthdayDate < today) {
            birthdayDate.setFullYear(today.getFullYear() + 1); // 处理跨年
        }
        const diff = birthdayDate - today;
        if (diff > 0 && diff < minDiff) {
            minDiff = diff;
            nextBirthday = { date: birthdayDate, name: b.name };
        }
    });

    return nextBirthday;
}

// 显示今天的日期
function displayTodayDate(dateStr, dateId) {
    const dateElement = document.getElementById(dateId);
    dateElement.textContent = "今天是" + dateStr;
}

// 显示当前过生日的人
function displayBirthdays(birthdays, listId) {
    const list = document.getElementById(listId);
    list.innerHTML = '';
    if (birthdays.length === 0) {
        list.innerHTML = '<li>今天没有人过生日</li>';
    } else {
        birthdays.forEach(b => {
            const li = document.createElement('li');
            // 如果类别是 ch，高亮显示名字
            if (b.type === 'ch') {
                li.innerHTML = `<strong class="highlight">${b.name}</strong>`;
            } else {
                li.textContent = b.name;
            }
            list.appendChild(li);
        });
    }
}

// 显示下一个过生日的日期和人
function displayNextBirthday(date, birthdays, dateId, listId) {
    const dateElement = document.getElementById(dateId);
    dateElement.textContent = getDateStr(date);

    const list = document.getElementById(listId);
    list.innerHTML = '';
    birthdays.forEach(b => {
        const li = document.createElement('li');
        // 如果类别是 ch，高亮显示名字
        if (b.type === 'ch') {
            li.innerHTML = `<strong class="highlight">${b.name}</strong>`;
        } else {
            li.textContent = b.name;
        }
        list.appendChild(li);
    });
}