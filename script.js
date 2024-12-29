document.addEventListener("DOMContentLoaded", function () {
    // Elemen-elemen DOM
    const timerDisplay = document.getElementById('timer');
    const timerStatus = document.getElementById('timerStatus');
    const startPauseBtn = document.getElementById('startPauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const modalnotif = document.getElementById("notificationModal");

    // Tombol mode waktu
    const shortBtn = document.getElementById('shortBtn');
    const workBtn = document.getElementById('workBtn');
    const longBtn = document.getElementById('longBtn');

    // Input settings
    const shortTimeInput = document.getElementById('shortTimeInput');
    const workTimeInput = document.getElementById('workTimeInput');
    const longTimeInput = document.getElementById('longTimeInput');

    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const mainBackground = document.getElementById('mainBackground');

    // Variabel global
    let timer;
    let timeLeft;
    let isRunning = false;
    let currentMode = 'work';
    let workTime = 25 * 60;
    let shortBreakTime = 5 * 60;
    let longBreakTime = 15 * 60;
    let cycleCount = 0;

    // Fungsi format waktu
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Putar Music
    const manageMusic = (mode) => {
    if (mode === 'short' || mode === 'long') {
        if (!breakMusic.paused) {
            breakMusic.pause();
            breakMusic.currentTime = 0;
        }
        breakMusic.play().catch((e) => console.error("Error saat memutar audio:", e));
    } else {
        breakMusic.pause();
        breakMusic.currentTime = 0;
    }
    };


    // Kirim Notifikasi
    const sendNotification = (title, message) => {
        if (Notification.permission === "granted") {
            new Notification(title, { body: message, icon: "{% static 'assets/images/Teknohole_Blue.png' %}" });
        }
    };

    // Fungsi untuk meminta izin notifikasi
    function requestNotificationPermission() {
        if (!("Notification" in window)) {
            alert("Browser Anda tidak mendukung notifikasi.");
            return;
        }

        // Meminta izin dari pengguna
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Izin notifikasi diberikan.");
            } else if (permission === "denied") {
                console.log("Izin notifikasi ditolak.");
            } else {
                modalnotif.classList.remove("hidden");
                modalnotif.classList.add("flex");
                document.getElementById("enableNotification").addEventListener("click", () => {
                    modalnotif.classList.add("hidden");
                    modalnotif.classList.remove("flex");
                    requestNotificationPermission();
                });

                document.getElementById("closeModal").addEventListener("click", () => {
                    modalnotif.classList.add("hidden");
                    modalnotif.classList.remove("flex");
                });
            }
        }).catch(err => {
            console.error("Gagal meminta izin notifikasi:", err);
        });
    };


    // Fungsi ganti mode
    function switchMode(mode) {
        // Reset timer dan ubah mode
        clearInterval(timer);
        isRunning = false;
        currentMode = mode;

        // Atur waktu dan status sesuai mode
            switch(mode) {
                case 'short':
                    // Set timer
                    timeLeft = shortBreakTime;
                    timerStatus.textContent = 'Short Break';

                    // Bersihkan semua kelas warna pada timerDisplay dan tambahkan yang baru
                    timerDisplay.classList.remove('text-blue-500', 'text-green-500', 'text-purple-500');
                    timerDisplay.classList.add('text-green-500');

                    // Bersihkan semua kelas warna pada mainBackground dan tambahkan yang baru
                    mainBackground.classList.remove(
                        'dark:bg-gray-900','bg-white',
                        'bg-blue-300', 'dark:bg-blue-300',
                        'bg-purple-300', 'dark:bg-purple-300',
                        'bg-green-300', 'dark:bg-green-300'
                    );
                    mainBackground.classList.add('bg-green-300', 'dark:bg-green-300');

                    // Atur tombol aktif
                    shortBtn.classList.add('bg-green-700');
                    workBtn.classList.remove('bg-blue-700');
                    longBtn.classList.remove('bg-purple-700');
                    sendNotification("☕ Short Break", `Waktunya istirahat singkat selama ${shortBreakTime/60} menit.`);
                    break;

                case 'work':
                    timeLeft = workTime;
                    timerStatus.textContent = 'Work Time';
                    timerDisplay.classList.remove('text-blue-500', 'text-green-500', 'text-purple-500');
                    timerDisplay.classList.add('text-blue-500');
                    mainBackground.classList.remove(
                        'dark:bg-gray-900','bg-white',
                        'bg-blue-300', 'dark:bg-blue-300',
                        'bg-purple-300', 'dark:bg-purple-300',
                        'bg-green-300', 'dark:bg-green-300'
                    );
                    mainBackground.classList.add('bg-blue-300', 'dark:bg-blue-300');
                    workBtn.classList.add('bg-blue-700');
                    shortBtn.classList.remove('bg-green-700');
                    longBtn.classList.remove('bg-purple-700');
                    sendNotification("🚀 Focus Time!", `Mulai sesi kerja fokus selama ${workTime/60} menit!`);
                    break;

                case 'long':
                    timeLeft = longBreakTime;
                    timerStatus.textContent = 'Long Break';
                    timerDisplay.classList.remove('text-blue-500', 'text-green-500', 'text-purple-500');
                    timerDisplay.classList.add('text-purple-500');
                    mainBackground.classList.remove(
                        'dark:bg-gray-900','bg-white',
                        'bg-blue-300', 'dark:bg-blue-300',
                        'bg-purple-300', 'dark:bg-purple-300',
                        'bg-green-300', 'dark:bg-green-300'
                    );
                    mainBackground.classList.add('bg-purple-300', 'dark:bg-purple-300');
                    longBtn.classList.add('bg-purple-700');
                    workBtn.classList.remove('bg-blue-700');
                    shortBtn.classList.remove('bg-green-700');
                    sendNotification("🛋️ Long Break", `Nikmati istirahat panjang selama ${longBreakTime/60} menit.`);
                    break;
            }


        // Reset tombol start/pause
        manageMusic(mode);
        startPauseBtn.textContent = 'Start';
        startPauseBtn.classList.replace('bg-red-500', 'bg-green-500');
        timerDisplay.textContent = formatTime(timeLeft);
    };

    // Fungsi mulai/pause timer
    function toggleTimer() {
        if (!isRunning) {
            startTimer();
            breakMusic.pause();
        } else {
            pauseTimer();
        }
    }

    // Fungsi untuk menyimpan pengaturan timer ke localStorage
    function saveSettingsToLocalStorage() {
        const settings = {
            shortBreakTime: shortBreakTime,
            workTime: workTime,
            longBreakTime: longBreakTime
        };
        localStorage.setItem('timerSettings', JSON.stringify(settings));
        console.log("Settings disimpan")
    }

    // Fungsi untuk memuat pengaturan dari localStorage
    function loadSettingsFromLocalStorage() {
        const savedSettings = JSON.parse(localStorage.getItem('timerSettings'));
        if (savedSettings) {
            shortBreakTime = savedSettings.shortBreakTime || 5 * 60; // Default jika kosong
            workTime = savedSettings.workTime || 25 * 60;
            longBreakTime = savedSettings.longBreakTime || 15 * 60;

            // Atur kembali waktu saat ini berdasarkan mode yang sedang aktif
            switch (currentMode) {
                case 'short':
                    timeLeft = shortBreakTime;
                    break;
                case 'work':
                    timeLeft = workTime;
                    break;
                case 'long':
                    timeLeft = longBreakTime;
                    break;
            }
            timerDisplay.textContent = formatTime(timeLeft);
        }
    }

    // Event listener saat tombol save settings ditekan
    saveSettingsBtn.addEventListener('click', () => {
        // Validasi dan simpan durasi baru
        shortBreakTime = shortTimeInput.value * 60;
        workTime = workTimeInput.value * 60;
        longBreakTime = longTimeInput.value * 60;

        // Simpan pengaturan ke localStorage
        saveSettingsToLocalStorage();

        // Perbarui timer sesuai mode saat ini
        if (!isRunning) {
            switch(currentMode) {
                case 'short':
                    timeLeft = shortBreakTime;
                    break;
                case 'work':
                    timeLeft = workTime;
                    break;
                case 'long':
                    timeLeft = longBreakTime;
                    break;
            }
            timerDisplay.textContent = formatTime(timeLeft);
        }

        settingsModal.classList.add('hidden');
    });

    function startTimer() {
        isRunning = true;
        startPauseBtn.textContent = 'Pause';
        startPauseBtn.classList.replace('bg-green-500', 'bg-red-500');

        timer = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                timerDisplay.textContent = formatTime(timeLeft);
            } else {
                clearInterval(timer);
                isRunning = false;

                // Logika pergantian mode
                switch(currentMode) {
                    case 'work':
                        cycleCount++;
                        if (cycleCount % 4 === 0) {
                            switchMode('long');
                        } else {
                            switchMode('short');
                        }
                        break;
                    case 'short':
                        switchMode('work');
                        break;
                    case 'long':
                        switchMode('work');
                        break;
                }

                startTimer(); // Mulai ulang timer untuk sesi berikutnya
            }
        }, 1000);
    }

    function pauseTimer() {
        isRunning = false;
        clearInterval(timer);
        startPauseBtn.textContent = 'Start';
        startPauseBtn.classList.replace('bg-red-500', 'bg-green-500');
    }

    function resetTimer() {
        clearInterval(timer);
        isRunning = false;
        cycleCount = 0;
        switchMode('work');
    }

    // Event listener untuk tombol mode
    shortBtn.addEventListener('click', () => switchMode('short'));
    workBtn.addEventListener('click', () => switchMode('work'));
    longBtn.addEventListener('click', () => switchMode('long'));

    // Event listener untuk settings modal
    settingsBtn.addEventListener('click', () => {
        // Isi input dengan nilai saat ini
        shortTimeInput.value = Math.floor(shortBreakTime / 60);
        workTimeInput.value = Math.floor(workTime / 60);
        longTimeInput.value = Math.floor(longBreakTime / 60);
        settingsModal.classList.remove('hidden');
    });

    cancelSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });

    saveSettingsBtn.addEventListener('click', () => {
        // Validasi dan simpan durasi baru
        shortBreakTime = shortTimeInput.value * 60;
        workTime = workTimeInput.value * 60;
        longBreakTime = longTimeInput.value * 60;

        // Perbarui timer sesuai mode saat ini
        if (!isRunning) {
            switch(currentMode) {
                case 'short':
                    timeLeft = shortBreakTime;
                    break;
                case 'work':
                    timeLeft = workTime;
                    break;
                case 'long':
                    timeLeft = longBreakTime;
                    break;
            }
            timerDisplay.textContent = formatTime(timeLeft);
        }

        settingsModal.classList.add('hidden');
    });

    // Tutup modal jika mengklik di luar
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.add('hidden');
        }
    });
    // Fungsi untuk menyimpan task ke Local Storage
    function saveTasksToLocalStorage() {
        const tasks = [];
        document.querySelectorAll('#taskList > div').forEach(taskItem => {
            const taskText = taskItem.querySelector('span').textContent;
            const isChecked = taskItem.querySelector('input[type="checkbox"]').checked;
            tasks.push({ text: taskText, completed: isChecked });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Fungsi untuk memuat task dari Local Storage
    function loadTasksFromLocalStorage() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'flex items-center justify-between bg-gray-100 p-2 rounded';

            const taskContent = document.createElement('div');
            taskContent.className = 'flex items-center';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'mr-2';
            checkbox.checked = task.completed;

            const taskLabel = document.createElement('span');
            taskLabel.textContent = task.text;
            if (task.completed) taskLabel.style.textDecoration = 'line-through';

            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '❌';
            deleteBtn.className = 'text-red-500';

            // Event Listener Checkbox
            checkbox.addEventListener('change', () => {
                taskLabel.style.textDecoration = checkbox.checked ? 'line-through' : 'none';
                saveTasksToLocalStorage();
            });

            // Event Listener Delete
            deleteBtn.addEventListener('click', () => {
                taskList.removeChild(taskItem);
                saveTasksToLocalStorage();
            });

            taskContent.appendChild(checkbox);
            taskContent.appendChild(taskLabel);
            taskItem.appendChild(taskContent);
            taskItem.appendChild(deleteBtn);

            taskList.appendChild(taskItem);
        });
    }

        // Fungsi add Task
        function addTask() {
            const taskText = taskInput.value.trim();
            if (taskText) {
                const taskItem = document.createElement('div');
                taskItem.className = 'flex items-center justify-between bg-gray-100 p-2 rounded';

                const taskContent = document.createElement('div');
                taskContent.className = 'flex items-center';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'mr-2';

                const taskLabel = document.createElement('span');
                taskLabel.textContent = taskText;

                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '❌';
                deleteBtn.className = 'text-red-500';

                checkbox.addEventListener('change', () => {
                    taskLabel.style.textDecoration = checkbox.checked ? 'line-through' : 'none';
                    saveTasksToLocalStorage();
                });

                deleteBtn.addEventListener('click', () => {
                    taskList.removeChild(taskItem);
                    saveTasksToLocalStorage();
                });

                taskContent.appendChild(checkbox);
                taskContent.appendChild(taskLabel);
                taskItem.appendChild(taskContent);
                taskItem.appendChild(deleteBtn);

                taskList.appendChild(taskItem);
                taskInput.value = '';

                saveTasksToLocalStorage();
            }
        }

    // Panggil loadSettings dan Task di localstorage saat halaman dimuat
    document.addEventListener('DOMContentLoaded', () => {
        loadSettingsFromLocalStorage();
        loadTasksFromLocalStorage();
        timerDisplay.textContent = formatTime(timeLeft); // Perbarui tampilan timer
    });
    // Event listeners untuk task
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // Event listeners utama
    startPauseBtn.addEventListener('click', toggleTimer);
    resetBtn.addEventListener('click', resetTimer);

    // Inisialisasi
    requestNotificationPermission();
    timeLeft = workTime;
    timerDisplay.textContent = formatTime(timeLeft);
    workBtn.classList.add('bg-blue-700');
});