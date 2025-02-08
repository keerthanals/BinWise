// DOM Elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');
const switchCameraButton = document.getElementById('switchCamera');
const preview = document.getElementById('preview');
const capturedImage = document.getElementById('capturedImage');
const retakeButton = document.getElementById('retake');
const downloadButton = document.getElementById('download');
const uploadInput = document.getElementById('upload');

// Global variables
let currentStream = null;
let cameras = [];
let currentCameraIndex = 0;

// Initialize camera functionality
async function initializeCamera() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        cameras = devices.filter(device => device.kind === 'videoinput');
        
        if (cameras.length > 0) {
            await startCamera(cameras[currentCameraIndex].deviceId);
            switchCameraButton.style.display = cameras.length > 1 ? 'block' : 'none';
        } else {
            console.error('No cameras found');
        }
    } catch (error) {
        console.error('Error initializing camera:', error);
    }
}

// Start camera with specified device ID
async function startCamera(deviceId) {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    try {
        const constraints = {
            video: {
                deviceId: deviceId ? { exact: deviceId } : undefined,
                facingMode: 'environment',
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        currentStream = stream;
        video.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise((resolve) => {
            video.onloadedmetadata = () => resolve();
        });
        
        // Start playing
        await video.play();
    } catch (error) {
        console.error('Error starting camera:', error);
    }
}

// Capture photo
function capturePhoto() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    
    // Flip horizontally if using front camera
    if (cameras[currentCameraIndex]?.label?.toLowerCase().includes('front')) {
        context.scale(-1, 1);
        context.translate(-canvas.width, 0);
    }
    
    context.drawImage(video, 0, 0);
    
    // Show preview
    capturedImage.src = canvas.toDataURL('image/png');
    preview.classList.remove('hidden');
}

// Switch camera
function switchCamera() {
    if (cameras.length > 1) {
        currentCameraIndex = (currentCameraIndex + 1) % cameras.length;
        startCamera(cameras[currentCameraIndex].deviceId);
    }
}

// Handle file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            capturedImage.src = e.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

// Download image
function downloadImage() {
    const link = document.createElement('a');
    link.download = 'binwise-capture.png';
    link.href = capturedImage.src;
    link.click();
}

// Event Listeners
captureButton.addEventListener('click', capturePhoto);
switchCameraButton.addEventListener('click', switchCamera);
retakeButton.addEventListener('click', () => {
    preview.classList.add('hidden');
    uploadInput.value = '';
});
downloadButton.addEventListener('click', downloadImage);
uploadInput.addEventListener('change', handleFileUpload);

// Initialize on load
document.addEventListener('DOMContentLoaded', initializeCamera);

const toggleButton = document.getElementById("darkModeToggle");
const body = document.body;

// Load dark mode preference from localStorage
if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-mode");
    toggleButton.textContent = "🌞";
}

toggleButton.addEventListener("click", () => {
    body.classList.toggle("dark-mode");

    if (body.classList.contains("dark-mode")) {
        toggleButton.textContent = "🌞"; // Sun icon for light mode
        localStorage.setItem("theme", "dark");
    } else {
        toggleButton.textContent = "🌙"; // Moon icon for dark mode
        localStorage.setItem("theme", "light");
    }
});
