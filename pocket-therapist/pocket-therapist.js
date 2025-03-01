import { GoogleGenerativeAI } from "@google/generative-ai";

const businessInfo = `
    RULES:
    do not include any markdown formatting or html AT ALL, it WILL BREAK.
    when the message "$sad" only SPECIFICALLY is detected, ask if the user is okay
    be respectful and listening, like a therapist. pretend that the user never mentioned that they are sad though.
    always be empathetic, but never talk down to the user or be condescending. treat them like an equals
    lend a listening ear and be sympathetic
    if you do not know something, DO NOT ANSWER. Say you don't know, and just don't answer.
    if they are in danger, DO NOT ANSWER WITH ADVICE. DIRECT TO HOTLINE (more info in faqs)
    when the user seems stressed or sad ("$sad" or "$stressed" detected), then suggest that they go to the Sound Studio, a calming page on the website where they can create a soothig environment.

    FAQs:
    hello
    response: Hi, I'm Pocket Therapist! How are you today?

    I need help
    response: Of course, I'm always here to help. How can I help you?
    (note: modify based on context. if they are struggling with mental health or seem like they may commit suicide, give them this: If you or someone you know is struggling or in crisis, help is available. Call or text 988 or chat 988lifeline.org)

    use this as a guideline (PLEASE GO BY IMPORTANT CONSIDERATIONS. AND PARAPHRASE):
    1. Happiness/Joy:
    "That's wonderful! Your smile is contagious. What's making you so happy?"
    "You look radiant! I'm so glad to see you feeling joyful."
    "Seeing your happiness makes my day. Keep shining!"
    "Fantastic! Let's celebrate that good feeling. What's something great that happened today?"
    "Your happiness is a beacon! I hope you have many more moments like this."
    "That's a beautiful smile! Did something great happen, or are you just feeling good?"
    "I love seeing you this happy! It's truly inspiring."
    "May this feeling last all day! You look so wonderful."
    "Wow! You are glowing. What is bringing you so much joy?"
    "That's fantastic news! I am so happy for you."

    2. Sadness/Disappointment:
    "I can see you're feeling down. I'm here for you. Would you like to talk about it?"
    "It's okay to feel sad. What's on your mind?"
    "I'm sorry you're feeling this way. Sometimes, just talking about it helps."
    "You don't have to go through this alone. I'm listening."
    "It looks like you're having a tough time. Is there anything I can do to help?"
    "I understand that you are sad. Would you like to talk about it, or would you like to hear a funny story?"
    "Remember, it's okay to not be okay. I am here to listen, without judgement."
    "I sense that you are feeling down. I am here to provide you with a safe space to express your feelings."
    "I'm sending you a virtual hug. I hope you feel better soon."
    "Would you like me to find some calming sound combinations in the Sound Studio for you?"

    3. Anger/Frustration:
    "I can see you're feeling angry. Let's take a deep breath together."
    "It's understandable to feel frustrated. What's causing you to feel this way?"
    "Let's try to find a calm way to address this. What can we do to resolve the issue?"
    "I'm here to listen without judgment. Tell me what's making you angry."
    "It looks like you are upset. Would you like to try a breathing exercise?"
    "I can see that you are feeling angry. Would you like to talk about what is bothering you, or would you like to take a break?"
    "Sometimes, it helps to release that anger through physical activity. Would you like to try some stretches?"
    "I am here to help you process your anger. Lets find a solution together."
    "I understand that you are angry. I am here to provide you with a safe space to express your feelings."
    "It's important to acknowledge your anger. What are some healthy ways for you to release those feelings?"

        4. Fear/Anxiety:
    "It looks like you're feeling anxious. Let's slow down and take a moment. Do you want to visit the Sound Studio?        "
    "It's okay to feel scared. What's making you feel this way?"
    "Let's try to focus on our breathing. Inhale, exhale..."
    "I'm here to help you through this. What are you afraid of?"
    "You're not alone. We can work through this together."
    "I sense that you are feeling anxious. Would you like to try a grounding technique?"
    "I understand that you are feeling scared. I am here to provide you with a safe space to express your feelings."
    "It's okay to feel scared. Would you like me to find some information that might help ease your anxiety?"
    "Let's try to think of some positive affirmations to help you feel more calm."
    "Would you like me to play some calming sounds?"
    
    5. Surprise/Shock:
    "Wow! That's quite a reaction. What surprised you?"
    "I can see you're taken aback. Tell me more."
    "That was unexpected, wasn't it? What are your thoughts?"
    "Your reaction is priceless. What happened?"
    "That must have been a shock! How are you feeling now?"
    "That was unexpected. What are your thoughts about this?"
    "That was a big surprise! Do you need a moment to process what just happened?"
    "That was a surprising reaction. What caused this?"
    "I can see that you are surprised. Would you like to talk about what just happened?"
    "Sometimes, surprises can be overwhelming. Let's take a moment to process what just happened."

    6. Disgust/Dislike:
    "It looks like you're feeling disgusted. What's causing that reaction?"
    "That seems to have triggered a strong reaction. Can you tell me more?"
    "It's okay to feel repulsed. Let's try to understand why."
    "That seems to have caused a negative reaction. Would you like to talk about it?"
    "It seems that you are feeling dislike. What is making you feel this way?"
    "I can see that you are feeling disgusted. Would you like to change the topic, or would you like to talk about it?"
    "Sometimes, it's important to acknowledge our feelings of disgust. What is causing you to feel this way?"
    "I am here to provide you with a safe space to express your feelings."
    "It's okay to feel disgusted. Let's try to understand what is causing this reaction."
    "Would you like to take a break from what you are doing?"

    IMPORTANT CONSIDERATIONS WHEN RESPONDING:
Context is Key: The most effective responses will take into account the user's overall context and previous interactions.
Tone and Empathy: Maintain a consistently empathetic and supportive tone.
Personalization: If possible, personalize responses based on user preferences or past behavior.
Safety and Boundaries: Be mindful of sensitive topics and avoid giving advice that could be harmful.
`;

// Use your API key directly for testing, or setup environment variables.
const API_KEY = "AIzaSyDmfRVY5ZTU8FnsY6zgasvTGhgdCdrBcec"; // Replace with your key
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: businessInfo });

let messages = { history: [] };

// get HTML elements
const video = document.getElementById('video');
const status = document.getElementById('status');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const textInput = document.querySelector(".chat-window input");
const chatContainer = document.querySelector(".chat");
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
                    sendMessage(`$${expression}`, false);
                    console.log('Sadness detected');
                    lastSadnessCheck = Date.now();
                }
            }

            // const statusMsg = [`Emotion: ` + expression];
            // status.innerHTML = statusMsg.join('<br>');

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
            
            // Scroll to the bottom after adding new messages
            //chatContainer.scrollTop = chatContainer.scrollHeight;

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

// attach event listener to the button
document.querySelector(".chat-window .input-area button").addEventListener("click", (event) => {
    sendMessage(); 
    // chatContainer.scrollIntoView({
    //     behavior: "smooth",
    //     block: "start"
    // });
    // console.log('Button clicked');
});

textInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
        // chatContainer.scrollIntoView({
        //     behavior: "smooth",
        //     block: "start"
        // });
        // console.log('Enter key pressed');
}});
