const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');
const switchCameraButton = document.getElementById('switchCamera');
const preview = document.getElementById('preview');
const capturedImage = document.getElementById('capturedImage');
const retakeButton = document.getElementById('retake');
const uploadInput = document.getElementById('upload');
const loadingScreen = document.getElementById('loadingScreen');

let currentStream = null;
let cameras = [];
let currentCameraIndex = 0;

async function initializeCamera() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        cameras = devices.filter(device => device.kind === 'videoinput');
        if (cameras.length > 0) {
            await startCamera(cameras[currentCameraIndex].deviceId);
        } else {
            alert("No cameras found.");
        }
    } catch (error) {
        alert("Camera access error: " + error.message);
    }
}

async function startCamera(deviceId) {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: deviceId } } });
        video.srcObject = stream;
        currentStream = stream;
    } catch (error) {
        alert("Error starting camera: " + error.message);
    }
}

async function captureAndSendPhoto() {
    loadingScreen.classList.remove('hidden'); 

    try {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        
        canvas.toBlob(async (blob) => {
            const formData = new FormData();
            formData.append('image', blob, 'captured_image.png');

            const response = await fetch('/score', { method: 'POST', body: formData });
            if (response.ok) {
                const data = await response.json();
                showPopup(data);
            } else {
                alert("Error: " + response.status);
            }
        }, 'image/png');
    } catch (error) {
        alert("Capture error: " + error.message);
    } finally {
        loadingScreen.classList.add('hidden');
    }
}

captureButton.addEventListener('click', captureAndSendPhoto);
switchCameraButton.addEventListener('click', () => { currentCameraIndex = (currentCameraIndex + 1) % cameras.length; startCamera(cameras[currentCameraIndex].deviceId); });
retakeButton.addEventListener('click', () => { preview.classList.add('hidden'); });
uploadInput.addEventListener('change', (event) => { alert("File uploaded: " + event.target.files[0].name); });

document.addEventListener('DOMContentLoaded', initializeCamera);
