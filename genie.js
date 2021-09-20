const servicesBaseUrl = "http://localhost:9000/"
//const chatbotBaseUrl = "http://localhost:8000/"
let botId;
let sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
let startupTasks = []
let startupTaskNames = []
let allStartupAndSubTasks = []


async function loadGenie(genieId, color,cssProps) {
  botId = genieId;
  document.getElementById('genie').style.setProperty("--primaryColor", color);
  if(cssProps){
    document.getElementById('genie').style.setProperty("--zIndex", cssProps.zIndex);
    document.getElementById('genie').style.setProperty("--textFieldWidth", cssProps.textFieldWidth);
    document.getElementById('genie').style.setProperty("--chatBoxHeight", cssProps.chatBoxHeight);
  }

  const contentDiv = document.getElementById("genie");
  //contentDiv.innerHTML = await fetchHtmlAsText("http://localhost:8000/genie.html");
  contentDiv.appendChild(createLampButton());
  contentDiv.appendChild(createChatWindowFrame());
  await buildStartupTasks(genieId);

}

/*async function fetchHtmlAsText(url) {
    const response = await fetch(url);
    return await response.text();
}*/


function createLampButton() {
  let floatingBtn = document.createElement('a');
  floatingBtn.href = '#';
  floatingBtn.classList.add('float-btn');
  floatingBtn.addEventListener('click', function () {
    toggleChatWindow();
  });

  let imageElem = document.createElement('img');
  imageElem.src = 'https://res.cloudinary.com/dgz2eoaxp/image/upload/v1630758899/genie/Lamp2.png';
  imageElem.classList.add('float-btn-icon');

  floatingBtn.appendChild(imageElem);
  return floatingBtn;
}

function createChatWindowFrame() {
  console.log("In createChatWindowFrame");
  let chatWindow = document.createElement('div');
  chatWindow.id = 'bot-chat-window';
  let wrapperElem = document.createElement('div');
  wrapperElem.classList.add('wrapper');
  wrapperElem.appendChild(createTitle());
  wrapperElem.appendChild(createChatMessagesFrame());
  wrapperElem.appendChild(createLoadingFrame());
  wrapperElem.appendChild(createTypingMessageFrame());
  chatWindow.appendChild(wrapperElem);
  return chatWindow;
}

function createTitle() {
  let titleElem = document.createElement('div');
  titleElem.classList.add('title');

  let titleImg = document.createElement('a');
  titleImg.href = '#';
  titleImg.classList.add('header-btn');

  let imageElem = document.createElement('img');
  imageElem.src = 'https://res.cloudinary.com/dgz2eoaxp/image/upload/v1630764230/genie/Genie.png';
  imageElem.classList.add('header-btn-icon');


  let minimiseIcon = document.createElement('i');
  minimiseIcon.classList.add('mdi');
  minimiseIcon.classList.add('mdi-minus-circle');
  minimiseIcon.classList.add('minimise-icon');
  minimiseIcon.addEventListener('click', function () {
    toggleChatWindow();
  });

  let closeIcon = document.createElement('i');
  closeIcon.classList.add('mdi');
  closeIcon.classList.add('mdi-close-circle');
  closeIcon.classList.add('close-icon');
  closeIcon.addEventListener('click', function () {
    document.getElementById("bot-chat-window").style.opacity=0.2;
    showFeedbackModal();
  });

  titleElem.appendChild(minimiseIcon);

  titleElem.appendChild(closeIcon);

  titleImg.appendChild(imageElem);

  titleElem.appendChild(titleImg)

  return titleElem;
}

function createChatMessagesFrame() {
  return buildBotResponseMessage('Hello, Im Genie! I can help you with any of the following:');
}

function createLoadingFrame() {
  let loadingElem = document.createElement('div');
  loadingElem.id = 'loadingMsgDiv';
  loadingElem.classList.add('loading-msg');
  loadingElem.innerHTML = 'Typing...';
  return loadingElem;
}

function createTypingMessageFrame() {
  let typingFieldDiv = document.createElement('div');
  typingFieldDiv.classList.add('typing-field');
  let inputDataDiv = document.createElement('div');
  inputDataDiv.classList.add('input-data');

  let inputElem = document.createElement('input');
  inputElem.id = 'userMsg';
  inputElem.type = 'text';
  inputElem.placeholder = 'Ask Genie...';
  inputElem.required = true;
  inputElem.addEventListener("keyup", ({key}) => {
    if (key === "Enter") {
      sendUserMessage();
    }
  });

  inputDataDiv.appendChild(inputElem);

  let sendBtn = document.createElement('button');
  sendBtn.textContent = 'Send';
  sendBtn.addEventListener('click', function () {
    sendUserMessage();
  });
  inputDataDiv.appendChild(sendBtn);
  typingFieldDiv.appendChild(inputDataDiv)
  return typingFieldDiv;
}

async function getStartupTasksAndSubTasks(genieId) {
  const response = await fetch(servicesBaseUrl + 'tasks/getStartupTasksAndSubTasks?projectId=' + genieId);
  return await response.json();
}

/*async function getSubTasks(genieId, parentId) {
  const response = await fetch(servicesBaseUrl + 'subTasks?projectId=' + genieId + '&parentId=' + parentId);
  return await response.json();
}*/

function buildStartupTasksDiv(welcomeTaskName, welcomeTasksDiv) {
  let welcomeTaskDiv = document.createElement('div');
  welcomeTaskDiv.classList.add('startup-task');
  welcomeTaskDiv.innerHTML = welcomeTaskName;
  welcomeTaskDiv.addEventListener('click', function () {
    processMessage(welcomeTaskName, false);
  });
  welcomeTasksDiv.appendChild(welcomeTaskDiv);
}

async function buildStartupTasks(genieId) {
  let startupAndSubTasks = await getStartupTasksAndSubTasks(genieId);
  console.log("startupAndSubTasks", startupAndSubTasks);
  allStartupAndSubTasks = startupAndSubTasks;
  if (startupAndSubTasks !== null || startupAndSubTasks.error === "Not Found") {
    startupTasks = startupAndSubTasks.filter(o => o.parentTaskId === null);
    startupTaskNames = startupTasks.map(o => o.name);
    console.log("startupTasks", startupTasks);
    let startupTasksDiv = document.createElement('div');
    startupTasksDiv.classList.add('startup-tasks');
    startupTaskNames.forEach(function (startupTaskName) {
      buildStartupTasksDiv(startupTaskName, startupTasksDiv);
    })
    document.getElementById('chat-box').appendChild(startupTasksDiv)
  }
}
async function buildSubTasks(genieId, userMsg) {
  let taskId = startupTasks.filter(o => o.name==userMsg)[0].id
  let subTasks = allStartupAndSubTasks.filter(o => o.parentTaskId == taskId)
  if (subTasks.length > 0) {
    buildBotResponseWithAdditionalMargin('Choose any one of the following : ', '0.5rem');
    let subTasksDiv = document.createElement('div');
    subTasksDiv.classList.add('startup-tasks');
    subTasks.forEach(function (subtask) {
      buildStartupTasksDiv(subtask.name, subTasksDiv);
    })
    let chatBoxElem = document.getElementById("chat-box");
    if (chatBoxElem) {
      chatBoxElem.appendChild(subTasksDiv);
      chatBoxElem.scrollTop = chatBoxElem.scrollHeight;
    }
  } else {
    let botResponse = await getBotResponse(userMsg);
    buildBotResponseMessage(botResponse);
  }
}

function toggleChatWindow() {
  let chatWindow = document.getElementById('bot-chat-window')
  if (chatWindow.style.display === "none" || chatWindow.style.display === "") {
    chatWindow.style.display = "block";
  } else {
    chatWindow.style.display = "none";
  }
}


async function processMessage(userMsg, showUserMsg) {
  if (showUserMsg) buildUserMessage(userMsg);
 console.log("User msg:", userMsg)
 console.log("startupTaskNames:", startupTaskNames)
  if (startupTaskNames.includes(userMsg)) {
    await buildSubTasks(botId, userMsg);
  } else {
    setTimeout(function () {
      document.getElementById('loadingMsgDiv').style.display = 'block';
    }, 500);
    let botResponse = await getBotResponse(userMsg);
    buildBotResponseMessage(botResponse);
  }
  document.getElementById('loadingMsgDiv').style.display = 'none';
}

function sendUserMessage() {
  let userMsg = document.getElementById('userMsg').value;
  if (userMsg.trim() !== '') {
    processMessage(userMsg, true);
  }
}

function buildUserMessage(userMsg) {
  let userMessageDiv = document.createElement("div");
  userMessageDiv.classList.add("user-inbox");
  userMessageDiv.classList.add("inbox");
  let userMessageHeader = document.createElement("div");
  userMessageHeader.classList.add("msg-header");
  let userMessagePara = document.createElement("p");
  userMessagePara.innerHTML = userMsg;
  userMessageHeader.appendChild(userMessagePara)
  userMessageDiv.appendChild(userMessageHeader)
  let chatBox = document.getElementById("chat-box");
  chatBox.appendChild(userMessageDiv);
  document.getElementById('userMsg').value = '';
  chatBox.scrollTop = chatBox.scrollHeight;

}

async function getBotResponse(userMsg) {

  let userMessage = {
    projectId: botId,
    userMsgs: [userMsg],
    sessionId: sessionId
  }
  return await post('intents/findIntent', userMessage)
}


function buildBotResponseMessage(botResponse) {
  let botMessageDiv = document.createElement("div");
  botMessageDiv.classList.add("bot-inbox");
  botMessageDiv.classList.add("inbox");

  let botMessageHeader = document.createElement("div");
  botMessageHeader.classList.add("msg-header");
  let botMessagePara = document.createElement("p");
  botMessagePara.innerHTML = botResponse;
  botMessageHeader.appendChild(botMessagePara)
  botMessageDiv.appendChild(botMessageHeader)
  let chatBoxElem = document.getElementById("chat-box");
  if (chatBoxElem) {
    chatBoxElem.appendChild(botMessageDiv);
    chatBoxElem.scrollTop = chatBoxElem.scrollHeight;

    return chatBoxElem;
  } else {// first time it will not bbe available
    let chatBox = document.createElement('div');
    chatBox.id = 'chat-box';
    chatBox.classList.add('form');
    chatBox.appendChild(botMessageDiv);
    return chatBox;
  }

}

function buildBotResponseWithAdditionalMargin(botResponse, margin) {
  let botMessageDiv = document.createElement("div");
  botMessageDiv.classList.add("bot-inbox");
  botMessageDiv.classList.add("inbox");
  botMessageDiv.style.marginTop=margin;

  let botMessageHeader = document.createElement("div");
  botMessageHeader.classList.add("msg-header");
  let botMessagePara = document.createElement("p");
  botMessagePara.innerHTML = botResponse;
  //botMessagePara.style.backgroundColor = 'grey';
  //botMessagePara.style.color = 'white';

  botMessageHeader.appendChild(botMessagePara)
  botMessageDiv.appendChild(botMessageHeader)
  let chatBoxElem = document.getElementById("chat-box");
  if (chatBoxElem) {
    chatBoxElem.appendChild(botMessageDiv);
    chatBoxElem.scrollTop = chatBoxElem.scrollHeight;

    return chatBoxElem;
  } else {// first time it will not bbe available
    let chatBox = document.createElement('div');
    chatBox.id = 'chat-box';
    chatBox.classList.add('form');
    chatBox.appendChild(botMessageDiv);
    return chatBox;
  }

}

async function get(url) {
  const response = await fetch(servicesBaseUrl + url, {headers: {"projectId": botId}});
  return await response.text();
}

async function getJson(url) {
  const response = await fetch(servicesBaseUrl + url, {headers: {"projectId": botId}});
  return await response.json();
}

async function post(url, data) {
  const response =
    await fetch(servicesBaseUrl + url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {"Content-type": "application/json; charset=UTF-8", "projectId": botId}
    })
  return await response.text();
}
function showFeedbackModal() {
  var modal = document.getElementById("myModal");
  modal.style.display = "block";
}
function closeModal() {
  var modal = document.getElementById("myModal");
  document.getElementById("bot-chat-window").style.opacity=1;
  modal.style.display = "none";
}
function showComments(image, number) {
  image.style.opacity=1;
}
