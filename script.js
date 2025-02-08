// DOM Elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');
const switchCameraButton = document.getElementById('switchCamera');
const preview = document.getElementById('preview');
const capturedImage = document.getElementById('capturedImage');
const retakeButton = document.getElementById('retake');
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

async function captureAndSendPhoto() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');

    // Flip horizontally if using front camera
    if (cameras[currentCameraIndex]?.label?.toLowerCase().includes('front')) {
        context.scale(-1, 1);
        context.translate(-canvas.width, 0);
    }

    context.drawImage(video, 0, 0);

    // Convert canvas to Blob
    canvas.toBlob(async (blob) => {
        try {
            const formData = new FormData();
            formData.append('image', blob, 'captured_image.png'); // Add filename

            const response = await fetch('http://127.0.0.1:8000/score', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Score Response:', data);

                // Show the popup
                showPopup(data);

            } else {
                console.error('Error sending image:', response.status);
                const errorDisplay = document.getElementById('errorDisplay');
                if (errorDisplay) {
                    errorDisplay.textContent = `Error: ${response.status} - ${response.statusText}`;
                }
            }
        } catch (error) {
            console.error('Error sending image:', error);
            const errorDisplay = document.getElementById('errorDisplay');
            if (errorDisplay) {
                errorDisplay.textContent = `Error: ${error.message}`;
            }
        }
    }, 'image/png');
}


function showPopup(data) {
    const popup = document.createElement('div');
    popup.classList.add('popup');

    const popupContent = document.createElement('div');
    popupContent.classList.add('popup-content');

    const scoreElement = document.createElement('div');
    scoreElement.classList.add('score-display');
    scoreElement.textContent = `${data.score}`;

    const descElement = document.createElement('div');
    descElement.classList.add('desc-display');
    descElement.textContent = data.desc;


    const reuseTitle = document.createElement('h3');
    reuseTitle.textContent = "Reuse Ideas";
    popupContent.appendChild(reuseTitle);

    const reuseList = document.createElement('ul');
    data.reuse.forEach(item => {
        const listItem = document.createElement('li');
        const title = document.createElement('h4');
        title.textContent = item.title;
        const content = document.createElement('p');
        content.textContent = item.content;
        listItem.appendChild(title);
        listItem.appendChild(content);
        reuseList.appendChild(listItem);
    });
    popupContent.appendChild(reuseList);



    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.classList.add('close-button');
    closeButton.addEventListener('click', () => {
        document.body.removeChild(popup);
        preview.classList.add('hidden'); // Hide preview after closing popup
        uploadInput.value = ''; // Clear file input
    });

    popupContent.appendChild(scoreElement);
    popupContent.appendChild(descElement);
    popupContent.appendChild(closeButton);
    popup.appendChild(popupContent);
    document.body.appendChild(popup);


    // Optional: Add a backdrop to the popup
    const popupBackdrop = document.createElement('div');
    popupBackdrop.classList.add('popup-backdrop');
    popupBackdrop.addEventListener('click', () => {
        document.body.removeChild(popup);
        preview.classList.add('hidden');
        uploadInput.value = '';
    });
    document.body.appendChild(popupBackdrop);

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

// Event Listeners
captureButton.addEventListener('click', captureAndSendPhoto);
switchCameraButton.addEventListener('click', switchCamera);
retakeButton.addEventListener('click', () => {
    preview.classList.add('hidden');
    uploadInput.value = '';
});
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