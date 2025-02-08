// Get elements
const video = document.getElementById('video');
const captureButton = document.getElementById('capture');
const switchCameraButton = document.createElement('button');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

let currentStream = null; // Track current camera stream
let cameras = []; // Store available cameras
let currentCameraIndex = 0; // Track which camera is in use

// Create Switch Camera Button
switchCameraButton.innerText = "🔄 Switch Camera";
switchCameraButton.style.position = "absolute";
switchCameraButton.style.top = "10px";
switchCameraButton.style.right = "10px";
switchCameraButton.style.padding = "10px";
switchCameraButton.style.background = "#007bff";
switchCameraButton.style.color = "white";
switchCameraButton.style.border = "none";
switchCameraButton.style.borderRadius = "5px";
switchCameraButton.style.cursor = "pointer";
document.body.appendChild(switchCameraButton);

// Function to get available cameras
async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        cameras = devices.filter(device => device.kind === 'videoinput');
        console.log("Available Cameras:", cameras);

        if (cameras.length > 0) {
            startCamera(cameras[currentCameraIndex].deviceId);
        }
    } catch (error) {
        console.error("Error accessing cameras:", error);
    }
}

// Function to start the camera
async function startCamera(deviceId) {
    if (currentStream) {
        // Stop the previous stream before switching
        currentStream.getTracks().forEach(track => track.stop());
    }

    try {
        const constraints = {
            video: { deviceId: { exact: deviceId } }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        currentStream = stream;
        video.srcObject = stream;
    } catch (error) {
        console.error("Error starting camera:", error);
    }
}

// Capture image
captureButton.addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/png');
    localStorage.setItem('capturedImage', imageData);

    window.location.href = 'preview.html';
});

// Switch Camera Button Click
switchCameraButton.addEventListener('click', () => {
    if (cameras.length > 1) {
        currentCameraIndex = (currentCameraIndex + 1) % cameras.length; // Switch camera index
        startCamera(cameras[currentCameraIndex].deviceId);
    }
});

// Get and start the camera on load
getCameras();
