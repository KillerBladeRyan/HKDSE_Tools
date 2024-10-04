// Define subject names and their corresponding Chinese translations
const subjects = {
    chi: '中文', chihist: '中國歷史', eng: '英文', m0: '數學', m1: '數學延伸單元1', m2: '數學延伸單元2',
    bio: '生物', chem: '化學', phy: '物理', enghist: '歷史', geog: '地理', econ: '經濟',
    bafs: '企業、會計與財務概論', ict: '資訊及通訊科技'
};

// Define paper options for specific subjects
const paperOptions = {
    default: ['p1', 'p2'],
    phy: ['p1a', 'p1b', 'p2'],
    ict: ['p1', 'p2a', 'p2b', 'p2c', 'p2d'],
    bafs: ['p1', 'p2a', 'p2b'],
    eng: ['p1', 'p2', 'p3', 'p4'],
};

// Define full marks for specific subjects and papers
const paperFullMarks = {
    chi: { p1: 80, p2: 103 },
    eng: { p1: 84, p2: 21, p3: 112, p4: 56 },
    default: 100
};

let cutoffData;

// Populate select elements with options
function populateSelect(elementId, options) {
    const select = document.getElementById(elementId);
    const currentYear = new Date().getFullYear();
    
    let optionsArray = Object.entries(options);
    
    if (elementId.includes('year')) {
        const includeHighest = elementId === 'year';
        
        optionsArray = [
            ...(includeHighest ? [['highest', '最高分數線']] : []),
            ...Array.from({ length: currentYear - 2013 }, (_, i) => [
                (currentYear - 1 - i).toString(),
                (currentYear - 1 - i).toString()
            ])
        ];
    }
    
    select.innerHTML = optionsArray.map(([value, text]) => 
        `<option value="${value}">${text}</option>`
    ).join('');
}

// Update options for grade calculation based on selected subject
function updateCalculateGradeOptions() {
    const subject = document.getElementById('subject').value;
    const paperSelect = document.getElementById('paper');
    const fullMarkInput = document.getElementById('full-mark');
    const paperGroup = document.getElementById('paper-group');
    
    if (subject === 'chi' || subject === 'eng') {
        paperGroup.style.display = 'block';
        fullMarkInput.disabled = true;
        fullMarkInput.value = '';
        
        const papers = subject === 'chi' ? ['p1', 'p2'] : ['p1', 'p2', 'p3', 'p4'];
        paperSelect.innerHTML = papers.map(paper => 
            `<option value="${paper}">試卷 ${paper.slice(1)}</option>`
        ).join('');
        
        // Set initial full mark
        const initialPaper = papers[0];
        fullMarkInput.value = paperFullMarks[subject][initialPaper];
    } else {
        paperGroup.style.display = 'none';
        fullMarkInput.disabled = false;
        fullMarkInput.value = (subject === 'm1' || subject === 'm2') ? paperFullMarks.default : '';
    }
}

// Update options for paper opening based on selected subject
function updateOpenPaperOptions() {
    const subject = document.getElementById('paper-subject').value;
    const paperSelect = document.getElementById('paper-number');
    const paperNumberGroup = document.getElementById('paper-number-group');
    
    if (subject === 'm1' || subject === 'm2') {
        paperNumberGroup.style.display = 'none';
    } else {
        paperNumberGroup.style.display = 'block';
        const options = paperOptions[subject] || paperOptions.default;
        paperSelect.innerHTML = options.map(option => 
            `<option value="${option}">試卷${option.slice(1)}</option>`
        ).join('');
    }
}

// Open the selected paper in a new tab
function openPaper() {
    const year = document.getElementById('paper-year').value;
    const subject = document.getElementById('paper-subject').value;
    const paper = (subject !== 'm1' && subject !== 'm2') ? document.getElementById('paper-number').value : '';
    
    openUrl(() => generateUrl('paper', year, subject, paper));
}

// Open a URL in a new tab
function openUrl(urlFunction) {
    window.open(urlFunction(), '_blank');
}

// Search for answers
function searchAnswer() {
    const year = document.getElementById('search-answer-year').value;
    const subject = document.getElementById('search-answer-subject').value;
    openUrl(() => generateUrl('ans', year, subject));
}

// Search for videos on YouTube
function searchVideo() {
    const year = document.getElementById('video-year').value;
    const subject = document.getElementById('video-subject').value;
    const topic = document.getElementById('video-topic').value;

    const subjectText = subjects[subject]; 
    let searchQuery = `HKDSE ${year} ${subjectText}`;
    if (topic) {
        searchQuery += ` ${topic}`;
    }

    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    window.open(searchUrl, '_blank');
}

// Generate URL for papers or answers
function generateUrl(type, year, subject, paper = '') {
    const baseUrl = 'https://dse.life/static/pp';
    if (subject === 'm1' || subject === 'm2') {
        return `${baseUrl}/${subject}/dse/${year}/pp.pdf`;
    } else if (['phy', 'ict', 'bafs', 'chem', 'bio', 'econ', 'enghist', 'geog'].includes(subject)) {
        const fileName = type === 'ans' ? 'ans' : paper;
        return `${baseUrl}/${subject}/eng/dse/${year}/${fileName}.pdf`;
    } else {
        const subjectPath = subject === 'm0' ? 'm0/eng' : subject;
        const fileName = type === 'ans' ? 'ans' : paper;
        return `${baseUrl}/${subjectPath}/dse/${year}/${fileName}.pdf`;
    }
}

// Calculate the highest cutoff scores across all years
function calculateHighestCutoff(subject) {
    let highestCutoff = {};
    for (let year in cutoffData[subject]) {
        for (let paper in cutoffData[subject][year]) {
            for (let grade in cutoffData[subject][year][paper]) {
                if (!highestCutoff[paper]) {
                    highestCutoff[paper] = {};
                }
                if (!highestCutoff[paper][grade] || cutoffData[subject][year][paper][grade] > highestCutoff[paper][grade]) {
                    highestCutoff[paper][grade] = cutoffData[subject][year][paper][grade];
                }
            }
        }
    }
    return highestCutoff;
}

// Calculate the grade based on input
function calculateGrade() {
    const year = document.getElementById('year').value;
    const subject = document.getElementById('subject').value;
    const paperSelect = document.getElementById('paper');
    const fullMarkInput = document.getElementById('full-mark');
    const mark = parseFloat(document.getElementById('mark').value);
    const resultDiv = document.getElementById('result');

    let fullMark;
    let paper = '';

    if (subject === 'chi' || subject === 'eng') {
        paper = paperSelect.value;
        fullMark = paperFullMarks[subject][paper];
    } else {
        fullMark = parseFloat(fullMarkInput.value);
    }

    if (isNaN(fullMark) || isNaN(mark)) {
        resultDiv.innerHTML = '請輸入有效的滿分和成績';
        return;
    }

    let subjectData;
    if (year === 'highest') {
        subjectData = calculateHighestCutoff(subject);
        subjectData = paper ? subjectData[paper] : subjectData['total'];
    } else {
        if (!cutoffData[subject] || !cutoffData[subject][year]) {
            resultDiv.innerHTML = '無法找到對應的分數線數據';
            return;
        }
        subjectData = paper ? cutoffData[subject][year][paper] : cutoffData[subject][year]['total'];
    }

    if (!subjectData) {
        resultDiv.innerHTML = '無法找到對應的分數線數據';
        return;
    }

    const percentage = (mark / fullMark) * 100;

    let grade = 'U**';
    for (const [key, value] of Object.entries(subjectData).sort((a, b) => b[1] - a[1])) {
        if (value !== null && percentage >= value) {
            grade = key;
            break;
        }
    }

    // Generate cutoff score list
    const cutoffList = Object.entries(subjectData)
        .sort((a, b) => b[1] - a[1])
        .map(([key, value]) => `${key}: ${value}%`)
        .join('<br>');

    resultDiv.innerHTML = `你的成績是: ${mark}/${fullMark}<br>
                           百分比: ${percentage.toFixed(2)}%<br>
                           等級: ${grade}<br><br>
                           ${year === 'highest' ? '歷年最高' : year + '年'}分數線：<br>${cutoffList}`;
}

// Initialize the page when DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize page elements
    const currentYear = new Date().getFullYear();
    const yearOptions = {
        ...Object.fromEntries(
            Array.from({ length: currentYear - 2013 }, (_, i) => [
                (currentYear - 1 - i).toString(),
                (currentYear - 1 - i).toString()
            ])
        )
    };
    
    // Populate select elements
    populateSelect('year', { highest: '最高分數線', ...yearOptions });
    populateSelect('search-answer-year', yearOptions);
    populateSelect('paper-year', yearOptions);
    populateSelect('video-year', yearOptions);
    populateSelect('subject', subjects);
    populateSelect('search-answer-subject', subjects);
    populateSelect('paper-subject', subjects);
    populateSelect('video-subject', subjects);

    // Load cutoff data using AJAX
    fetch('cutoffData.json')
        .then(response => response.json())
        .then(data => {
            cutoffData = data;
            console.log('Cutoff data loaded successfully');
        })
        .catch(error => console.error('Error loading cutoff data:', error));

    // Initialize page options
    updateCalculateGradeOptions();
    updateOpenPaperOptions();

    // Add event listeners
    document.getElementById('subject').addEventListener('change', updateCalculateGradeOptions);
    document.getElementById('paper-subject').addEventListener('change', updateOpenPaperOptions);
    document.getElementById('paper').addEventListener('change', function() {
        const subject = document.getElementById('subject').value;
        const paper = this.value;
        document.getElementById('full-mark').value = paperFullMarks[subject][paper];
    });

    // Navigation functionality
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('data-section');

            navLinks.forEach(link => link.classList.remove('active'));
            this.classList.add('active');

            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });
});

// Update countdown timer
function updateCountdown() {
    const examDate = new Date("2025-04-01T00:00:00").getTime(); // HKDSE exam date is April 1, 2025
    const now = new Date().getTime();
    const distance = examDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").innerHTML = days;
    document.getElementById("hours").innerHTML = padZero(hours);
    document.getElementById("minutes").innerHTML = padZero(minutes);
    document.getElementById("seconds").innerHTML = padZero(seconds);
}

// Add leading zero to numbers less than 10
function padZero(num) {
    return num < 10 ? "0" + num : num;
}

// Update countdown every second
setInterval(updateCountdown, 1000);

// Update countdown immediately on page load
updateCountdown();
