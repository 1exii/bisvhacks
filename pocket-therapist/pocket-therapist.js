import { GoogleGenerativeAI } from "@google/generative-ai";

// Use your API key directly for testing, or setup environment variables.
const API_KEY = "AIzaSyDmfRVY5ZTU8FnsY6zgasvTGhgdCdrBcec"; // Replace with your key
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

let messages = { history: [] };

// get HTML elements
const video = document.getElementById('video');
const status = document.getElementById('status');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const textInput = document.querySelector(".chat-window input");
let lastDetection = 0;
let lastSadnessCheck = 0;

// start webcam
async function startWebcam() {
    try {
        // get webcam stream
        const media = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { max: 320 },     
                height: { max: 240 },  
                frameRate: { max: 10 },
            }, 
            audio: false
        });
        video.srcObject = media;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        lastDetection = Date.now();
        lastSadnessCheck = Date.now();
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

        // limit number of detections to 1 per second
        if (lastDetection && Date.now() - lastDetection < 2000) {
            requestAnimationFrame(detectFeatures);
            return;
        }

        lastDetection = Date.now();

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

            // display emotions (temporary)
            if (Date.now() - lastSadnessCheck >= (10000)) {
                if (expression === 'sad') {
                    sendMessage(expression, false);
                    console.log('Sadness detected');
                    lastSadnessCheck = Date.now();
                }
            }

            const statusMsg = [`Emotion: ` + expression];
            status.innerHTML = statusMsg.join('<br>');

            // send a message to the ai to send a message to the user

        } else {

            status.innerHTML = 'No face detected.';

        }


    requestAnimationFrame(detectFeatures);
}

// event listeners
startBtn.addEventListener('click', startWebcam);
stopBtn.addEventListener('click', stopWebcam);

video.addEventListener('play', async () => {
    await loadModels();
    detectFeatures();
});

async function sendMessage(userMessage = null, showMessage = true) {
    if (userMessage != null) {
        userMessage = userMessage;
    } else {
        userMessage = document.querySelector(".chat-window input").value;
    }

    if (userMessage.length) {

        try {
            document.querySelector(".chat-window input").value = "";
            if (showMessage) {
                document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend", `
                    <div class="user">
                        <p>${userMessage}</p>
                    </div>
                `);
            }

            const chat = model.startChat(messages);
            let result = await chat.sendMessage(userMessage);

            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend", `
                <div class="model">
                    <p>${result.response.text()}</p>
                </div>
            `);

            messages.history.push({
                role: "user",
                parts: [{ text: userMessage }],
            }); // You might want to push the message into the array.

            messages.history.push({
                 role: "model",
                 parts: [{ text: result.response.text() }],
            });

            console.log(result.response.text()); // Log only once

        }
        catch(error){
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend", `
            <div class="error">
                <p>The message could not be sent. Please try again.</p>
            </div>
            `);
        }

    }
}

// Attach event listener to the button
document.querySelector(".chat-window .input-area button").addEventListener("click", sendMessage);
textInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      sendMessage();
}});
