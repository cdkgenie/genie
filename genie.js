const servicesBaseUrl = "http://c03dfosign693.dslab.ad.adp.com:9000/"
//const chatbotBaseUrl = "http://localhost:8000/"
let botId;
let sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
let startupTasks = []
let startupTaskNames = []
let allStartupAndSubTasks = []
let responseLength = 70
let genieChatBoxContentDiv;
let responseMap = new Map();

async function loadGenie(genieId, color,cssProps) {
  botId = genieId;
  document.getElementById('genie').style.setProperty("--primaryColor", color);
  if(cssProps){
    document.getElementById('genie').style.setProperty("--zIndex", cssProps.zIndex);
    document.getElementById('genie').style.setProperty("--textFieldWidth", cssProps.textFieldWidth);
    document.getElementById('genie').style.setProperty("--chatBoxHeight", cssProps.chatBoxHeight);
  }

  genieChatBoxContentDiv = document.getElementById("genie");
  //contentDiv.innerHTML = await fetchHtmlAsText("http://localhost:8000/genie.html");
  genieChatBoxContentDiv.appendChild(createLampButton());
  genieChatBoxContentDiv.appendChild(createChatWindowFrame());
  await buildStartupTasks(genieId);

}

/*async function fetchHtmlAsText(url) {
    const response = await fetch(url);
    return await response.text();
}*/


function createLampButton() {
  let floatingBtn = document.createElement('a');
  // floatingBtn.href = '#';
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
  // titleImg.href = '#';
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
  const response = await fetch(servicesBaseUrl + 'tasks/getStartupTasksAndSubTasks?projectId=' + genieId, {credentials: 'include'});
  return await response.json();
}

/*async function getSubTasks(genieId, parentId) {
  const response = await fetch(servicesBaseUrl + 'subTasks?projectId=' + genieId + '&parentId=' + parentId);
  return await response.json();
}*/

function buildStartupTasksDiv(startupTaskName, startupTasksDiv) {
  let startupTaskDiv = document.createElement('div');
  startupTaskDiv.classList.add('startup-task');
  startupTaskDiv.innerHTML = startupTaskName;
  startupTaskDiv.addEventListener('click', function () {
    processMessage(startupTaskName, false);
  });
  startupTasksDiv.appendChild(startupTaskDiv);
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


const uid = function(){
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function truncatedResponse(botResponse){
  if (botResponse.length > responseLength){
    let spanId = "spanId_"+uid();
    responseMap.set(spanId, botResponse);
    let remainingText = "<span id="+spanId+" onclick='showLongMessage("+spanId+")'>...</span>";
    return botResponse.substring(0, responseLength) + remainingText;
  }
  else{
    return botResponse;

  }
}

function showLongMessage(spanId) {
  let botResponse = responseMap.get(spanId.id);
  document.getElementById("bot-chat-window").style.opacity = 0.2;
  genieChatBoxContentDiv.appendChild(modelForRemainingText(botResponse))
}

function buildBotResponseMessage(botResponse) {
  let botMessageDiv = document.createElement("div");
  botMessageDiv.classList.add("bot-inbox");
  botMessageDiv.classList.add("inbox");
  let botMessageHeader = document.createElement("div");
  botMessageHeader.classList.add("msg-header");
  let botMessagePara = document.createElement("p");
  botMessagePara.innerHTML = truncatedResponse(botResponse);
  botMessageHeader.appendChild(botMessagePara);
  botMessageDiv.appendChild(botMessageHeader);
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
  const response = await fetch(servicesBaseUrl + url, {headers: {"projectId": botId}, credentials: 'include'});
  return await response.text();
}

async function getJson(url) {
  const response = await fetch(servicesBaseUrl + url, {headers: {"projectId": botId}, credentials: 'include'});
  return await response.json();
}

async function post(url, data) {
  const response =
    await fetch(servicesBaseUrl + url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {"Content-type": "application/json; charset=UTF-8", "projectId": botId},
      credentials: 'include'
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


function modelForRemainingText(botResponse){
  let longResponseModal = document.getElementById("myModal");
  if(longResponseModal) {
    longResponseModal.style.display = "block";
    let modelBody = longResponseModal.getElementsByClassName("modal-body")[0];
    modelBody.innerText = botResponse;
    return longResponseModal;
  }
  else {
    let myModel = document.createElement("div");
    myModel.id = "myModal";
    myModel.classList.add("modal");
    let modelContent = document.createElement("div");
    modelContent.classList.add("modal-content");
    let modelHeader = document.createElement("div");
    modelHeader.classList.add("modal-header");
    let modelBody = document.createElement("div");
    modelBody.classList.add("modal-body");

    let closeIcon = document.createElement("span");
    closeIcon.classList.add("close");
    closeIcon.innerHTML = "&times";
    closeIcon.addEventListener('click', function () {
      closeModal();
    });

    modelBody.innerText = botResponse;

    modelHeader.appendChild(closeIcon);
    modelContent.appendChild(modelHeader);
    modelContent.appendChild(modelBody);
    myModel.appendChild(modelContent);
    myModel.style.display = "block";
    return myModel;
  }

}
