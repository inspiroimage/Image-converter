const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const imagePreview = document.getElementById('imagePreview');
const formatButtons = document.querySelectorAll('[data-format]');
const convertBtn = document.getElementById('convertBtn');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const originalSize = document.getElementById('originalSize');

let currentFile = null;
let selectedFormat = 'pdf';

// Event Listeners
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('drop', handleDrop);

fileInput.addEventListener('change', handleFileSelect);
formatButtons.forEach(btn => btn.addEventListener('click', selectFormat));
convertBtn.addEventListener('click', startConversion);
qualitySlider.addEventListener('input', updateQuality);

function handleDragOver(e) {
    e.preventDefault();
    dropZone.style.borderColor = '#2196F3';
}

function handleDrop(e) {
    e.preventDefault();
    dropZone.style.borderColor = '#ccc';
    currentFile = e.dataTransfer.files[0];
    loadImage(currentFile);
}

function handleFileSelect(e) {
    currentFile = e.target.files[0];
    loadImage(currentFile);
}

function loadImage(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        originalSize.textContent = `Size: ${formatFileSize(file.size)}`;
    };
    reader.readAsDataURL(file);
}

function selectFormat(e) {
    selectedFormat = e.target.dataset.format;
    formatButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
}

function updateQuality() {
    qualityValue.textContent = qualitySlider.value;
}

function formatFileSize(bytes) {
    const kb = bytes / 1024;
    return `${kb.toFixed(2)} KB`;
}

async function startConversion() {
    if (!currentFile) return alert('Please select an image first!');

    const quality = qualitySlider.value / 100;
    const img = await createImageBitmap(currentFile);

    switch(selectedFormat) {
        case 'pdf':
            convertToPDF(img);
            break;
        default:
            convertToImage(img, quality);
    }
}

function convertToPDF(img) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    const width = pdf.internal.pageSize.getWidth();
    const height = (img.height * width) / img.width;
    
    pdf.addImage(img, 'JPEG', 0, 0, width, height);
    pdf.save('converted.pdf');
}

function convertToImage(img, quality) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `converted.${selectedFormat}`;
        a.click();
        URL.revokeObjectURL(url);
    }, `image/${selectedFormat}`, quality);
}
