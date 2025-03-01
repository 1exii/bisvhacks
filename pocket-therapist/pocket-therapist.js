// get HTML elements
const video = document.getElementById('video');
const status = document.getElementById('status');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
let lastDetection;

// start webcam
async function startWebcam() {
    try {
        const media = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { max: 320 },     
                height: { max: 240 },  
                frameRate: { max: 15 },
                facingMode: 'user'
            }, 
            audio: false
        });
        video.srcObject = media;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        lastDetection = Date.now();
    } catch (error) {
        console.error('Error starting webcam:', error);
    }
}

// stop webcam
async function stopWebcam() {
    if (video.srcObject) {
        const track = video.srcObject.getTracks()[0];
        track.stop();
    }

    video.srcObject = null;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    console.log('Webcam stopped');
}

// load models
async function loadModels() {
    try {
        const modelUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
        await faceapi.nets.ssdMobilenetv1.loadFromUri(modelUrl);
        await faceapi.nets.faceExpressionNet.loadFromUri(modelUrl);
        await faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl);
        await faceapi.nets.ageGenderNet.loadFromUri(modelUrl);
        console.log('Models loaded successfully!');
    } catch (error) {
        console.error('Error loading models:', error);
    }
}

// detects emotions
async function detectFeatures() {
    try {
        if (lastDetection && Date.now() - lastDetection < 1000) {
            requestAnimationFrame(detectFeatures);
            return;
        }
        window.lastDetectionTime = Date.now();

        const detection = await faceapi.detectSingleFace(video)
                                        .withFaceLandmarks()
                                        .withFaceExpressions();

        if (detection) {

            const expressions = Object.entries(detection.expressions);

            let expression = expressions[0][0], highestConfidence = expressions[0][1];

            for (const [e, c] of expressions) {
                if (c > highestConfidence) {
                    expression = e;
                    highestConfidence = c;
                }
            }

            const statusMsg = [`Emotion: ` + expression];
            status.innerHTML = statusMsg.join('<br>');

            // send a message to the ai to send a message to the user

        } else {

            status.innerHTML = 'No face detected.';

        }
    } catch (error) {
        console.error("Error in detection");
    }

    requestAnimationFrame(detectFeatures);
}

startBtn.addEventListener('click', startWebcam);
stopBtn.addEventListener('click', stopWebcam);

video.addEventListener('play', async () => {
    await loadModels();
    detectFeatures();
});