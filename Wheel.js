
const STORAGE_KEY = "wheelOptions";
const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const resultText = document.getElementById("resultText");
const btnSpin = document.getElementById("btnSpin");
const btnAdd = document.getElementById("btnAdd");
const txtNewOption = document.getElementById("txtNewOption");
const optionTableBody = document.getElementById("optionTableBody");

let options = [];
let currentRotation = 0;
let spinning = false;
let editingID = null;

// 初始化
async function init() {
    await loadOptions();

    renderTable();
    drawWheel();
}

// 讀取資料
async function loadOptions() {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData) {
        try {
            options = JSON.parse(savedData);
            return;
        }
        catch (e) {
            console.error("localStorage JSON 錯誤：", e);
        }
    }

    try {
        const response = await fetch("Options.json");

        if (!response.ok) {
            throw new Error("JSON 讀取失敗");
        }

        options = await response.json();
        saveOptions();
    }
    catch (e) {
        console.error(e);
        saveOptions();
    }
}

// 儲存
function saveOptions() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
}

// 新增
function addOption() {
    const name = txtNewOption.value.trim();

    if (name === "") {
        alert("請輸入輪盤選項");
        return;
    }

    let newID = 1;

    if (options.length > 0) {
        newID = Math.max(...options.map(x => x.id)) + 1;
    }

    options.push({
        id: newID,
        name: name
    });

    saveOptions();
    txtNewOption.value = "";
    renderTable();
    drawWheel();
}

// 開始修改
function editOption(id) {
    editingID = id;
    renderTable();
}

// 取消修改
function cancelEdit() {
    editingID = null;
    renderTable();
}

// 儲存修改
function saveEdit(id) {
    const input = document.getElementById("edit_" + id);

    if (!input) {
        return;
    }

    const name = input.value.trim();

    if (name === "") {
        alert("輪盤選項不可空白");
        return;
    }

    const item = options.find(x => x.id === id);

    if (!item) {
        return;
    }

    item.name = name;
    editingID = null;
    saveOptions();
    renderTable();
    drawWheel();
}

// 刪除
function deleteOption(id) {
    const item = options.find(x => x.id === id);

    if (!item) {
        return;
    }

    if (!confirm("確定要刪除「" + item.name + "」嗎？")) {
        return;
    }

    options = options.filter(x => x.id !== id);
    saveOptions();
    editingID = null;

    renderTable();
    drawWheel();
}

// 顯示管理列表
function renderTable() {
    optionTableBody.innerHTML = "";

    if (options.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = '<td colspan="3" class="empty-row">目前沒有任何輪盤選項</td>';
        optionTableBody.appendChild(row);

        return;
    }

    options.forEach(item => {
        const row = document.createElement("tr");

        if (editingID === item.id) {
            row.innerHTML =
                "<td>" + item.id + "</td>" + '<td><input id="edit_' + item.id + '" type="text" class="edit-input"></td>' +
                '<td>' + '<button type="button" class="btn-save" onclick="saveEdit(' + item.id + ')">儲存</button>' +
                '<button type="button" class="btn-cancel" onclick="cancelEdit()">取消</button>' + "</td>";

            optionTableBody.appendChild(row);
            document.getElementById("edit_" + item.id).value = item.name;
        }
        else {
            const idCell = document.createElement("td");
            const nameCell = document.createElement("td");
            const actionCell = document.createElement("td");

            idCell.textContent = item.id;
            nameCell.textContent = item.name;

            const editButton = document.createElement("button");

            editButton.type = "button";
            editButton.className = "btn-edit";
            editButton.textContent = "修改";
            editButton.onclick = function () {
                editOption(item.id);
            };

            const deleteButton = document.createElement("button");

            deleteButton.type = "button";
            deleteButton.className = "btn-delete";
            deleteButton.textContent = "刪除";
            deleteButton.onclick = function () {
                deleteOption(item.id);
            };

            actionCell.appendChild(editButton);
            actionCell.appendChild(deleteButton);

            row.appendChild(idCell);
            row.appendChild(nameCell);
            row.appendChild(actionCell);

            optionTableBody.appendChild(row);
        }
    });
}

// 畫輪盤
function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 240;

    if (options.length === 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = "#dddddd";
        ctx.fill();
        ctx.strokeStyle = "#aaaaaa";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = "#666666";
        ctx.font = "24px Microsoft JhengHei";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("目前沒有輪盤選項", centerX, centerY - 70);

        return;
    }

    const sliceAngle = Math.PI * 2 / options.length;

    for (let i = 0; i < options.length; i++) {
        const startAngle = -Math.PI / 2 + i * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();

        const hue = i * (360 / options.length);

        ctx.fillStyle = "hsl(" + hue + ", 70%, 68%)";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.save();
        ctx.translate(centerX, centerY);

        const textAngle = startAngle + sliceAngle / 2;

        ctx.rotate(textAngle);
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#222222";
        ctx.font = "bold 18px Microsoft JhengHei";

        let text = options[i].name;

        if (text.length > 12) {
            text = text.substring(0, 12) + "...";
        }
		
        ctx.fillText(text, radius - 25, 0);
        ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#444444";
    ctx.lineWidth = 5;
    ctx.stroke();
}

// 開始旋轉
function spinWheel() {
    if (spinning) {
        return;
    }

    if (options.length === 0) {
        alert("請先新增輪盤選項");
        return;
    }

    spinning = true;
    btnSpin.disabled = true;
    resultText.textContent = "旋轉中...";

    const turns = 5 + Math.floor(Math.random() * 4);
    const randomDegree = Math.random() * 360;
    const startRotation = currentRotation;
    const targetRotation = currentRotation + turns * 360 + randomDegree;
    const duration = 4500;

    let startTime = null;

    function animate(timestamp) {
        if (startTime === null) {
            startTime = timestamp;
        }

        const elapsed = timestamp - startTime;
        let progress = elapsed / duration;

        if (progress > 1) {
            progress = 1;
        }

        const ease = 1 - Math.pow(1 - progress, 3);
        currentRotation = startRotation + (targetRotation - startRotation) * ease;
        canvas.style.transform = "rotate(" + currentRotation + "deg)";

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
        else {
            currentRotation = targetRotation;
            spinning = false;
            btnSpin.disabled = false;
            showResult();
        }
    }

    requestAnimationFrame(animate);
}

// 顯示抽中結果
function showResult() {
    const sliceDegree = 360 / options.length;
    const rotation = currentRotation % 360;
    let angle = (360 - rotation) % 360;
    angle = (angle + sliceDegree / 2) % 360;
    let index = Math.floor(angle / sliceDegree);

    if (index < 0 || index >= options.length) {
        index = 0;
    }

    resultText.textContent = "抽中：" + options[index].name;
}

btnSpin.addEventListener("click", spinWheel);
btnAdd.addEventListener("click", addOption);

txtNewOption.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addOption();

    }
});

init();