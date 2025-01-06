document.addEventListener('DOMContentLoaded', function() {
    fetch('birthday.csv')
        .then(response => response.text())
        .then(data => {
            const rows = data.split('\n').slice(1); // 去掉标题行
            const birthdays = rows.map(row => {
                const [name, birthday, type] = row.trim().split(',');
                return { name, birthday, type };
            });

            const today = new Date();
            const todayStr = getDateStr(today);
            const todayBirthdays = birthdays.filter(b => getBirthdayDate(b.birthday) === todayStr);

            const nextBirthday = getNextBirthday(birthdays, today);
            const nextBirthdayStr = getDateStr(nextBirthday.date);
            const nextBirthdays = birthdays.filter(b => getBirthdayDate(b.birthday) === nextBirthdayStr);

            displayBirthdays(todayBirthdays, 'today-list');
            displayNextBirthday(nextBirthday.date, nextBirthdays, 'next-date', 'next-list');
        })
        .catch(error => console.error('Error fetching the CSV file:', error));
});

function getDateStr(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
}

function getBirthdayDate(birthdayStr) {
    return birthdayStr; // 生日已经是 "月日" 格式
}

function getNextBirthday(birthdays, today) {
    let nextBirthday = null;
    let minDiff = Infinity;

    birthdays.forEach(b => {
        const birthdayDate = new Date(today.getFullYear(), parseInt(b.birthday.split('月')[0]) - 1, parseInt(b.birthday.split('月')[1].split('日')[0]));
        if (birthdayDate < today) {
            birthdayDate.setFullYear(today.getFullYear() + 1);
        }
        const diff = birthdayDate - today;
        if (diff > 0 && diff < minDiff) {
            minDiff = diff;
            nextBirthday = { date: birthdayDate, name: b.name };
        }
    });

    return nextBirthday;
}

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