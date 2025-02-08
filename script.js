// Get elements
const video = document.getElementById('video');
const captureButton = document.getElementById('capture');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// Access the camera
navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
        video.srcObject = stream;
    })
    .catch((err) => {
        console.error("Error accessing camera:", err);
    });

// Capture image
captureButton.addEventListener('click', () => {
    // Set canvas size to match video frame
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current frame from the video onto the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to image URL
    const imageData = canvas.toDataURL('image/png');

    // Store in localStorage
    localStorage.setItem('capturedImage', imageData);

    // Redirect to preview page
    window.location.href = 'preview.html';
});
