window.onload = () => {
    const user_id = document.getElementById('id_user').textContent;
    const chat_id = document.getElementById('id_chat').textContent;
    const messages = document.getElementById('messages_container');
    const chat_active = document.getElementById('chat-active');
    const autoscroller = document.getElementById('messages_container');
    autoscroller.scrollTo(0, autoscroller.scrollHeight)
    const socket = io();


    socket.on('msg', (data) => {
        messages.scrollTop = messages.scrollHeight;
        let newmessagefromserver = data["data"]
        console.log(newmessagefromserver);
        if (user_id === newmessagefromserver.user_id) {
            messages.innerHTML +=
                `<div id='${newmessagefromserver.id}' class="messenger_container_chat_message_container">
            <div class="spacer"></div>
            <div class="messenger_container_chat_message_container_right">
                ${newmessagefromserver.text}
            </div>
            </div>`
        } else {
            messages.innerHTML +=
                `<div id='${newmessagefromserver.id}' class="messenger_container_chat_message_container">
            <div class="messenger_container_chat_message_container_left">
                ${newmessagefromserver.text}
            </div>
            <div class="spacer"></div>
            </div>`
        }
        autoscroller.scrollTo(0, autoscroller.scrollHeight)

    })


    let arr = document.querySelectorAll('.testair');
    arr = Array.from(arr);

    let checker = document.querySelectorAll('.checkclick');
    checker = Array.from(checker);

    for (let i = 0; i < checker.length; i++) {
        let chat = checker[i];
        chat.addEventListener('click', chatlink);
    }

    let butsend = document.getElementById('send_button');
    butsend.addEventListener('click', messageleave);
    let inputsend = document.getElementById('inputMessage')
    inputsend.addEventListener('keydown', function (e) {
        if (e.keyCode === 13) {
            messageleave()
        }
    })


    let counterr = 0;
    function chatlink() {
        let bbb = chat_active.textContent

    }

    function messageleave() {
        let inputMessage = document.getElementById('inputMessage')
        if (inputMessage.value.length == 0) {
            return;
        }
        let newmsgdata = {
            chat_id: chat_id,
            user_id: user_id,
            text: inputMessage.value,
            attachments: {}
        }
        console.log('working...', inputMessage.value)
        inputMessage.value = ''
        socket.emit('newMessage', newmsgdata)
    }
};