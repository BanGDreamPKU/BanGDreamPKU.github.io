document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('.reveal').forEach((el, i) => {
        setTimeout(() => el.classList.add('in'), 90 + i * 110);
    });
});
