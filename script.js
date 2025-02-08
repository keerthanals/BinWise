// Get elements
const video = document.getElementById('video');
const captureButton = document.getElementById('capture');
const switchCameraButton = document.createElement('button');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

let useFrontCamera = true; // Flag to track the active camera

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

// Function to start the camera
function startCamera() {
    const constraints = {
        video: {
            facingMode: useFrontCamera ? "user" : "environment" // "user" for front, "environment" for rear
        }
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
            video.srcObject = stream;
        })
        .catch((err) => {
            console.error("Error accessing camera:", err);
        });
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
    useFrontCamera = !useFrontCamera; // Toggle camera
    startCamera();
});

// Start the camera initially
startCamera();
