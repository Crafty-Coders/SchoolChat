window.onload = () => {
    const user_id = document.getElementById('id_user').textContent;
    const chat_id = document.getElementById('id_chat').textContent;
    const messages = document.getElementById('messages_container');
    const chat_active=document.getElementById('chat-active');
    const autoscroller=document.getElementById('messages_container');
    autoscroller.scrollTo(0, autoscroller.scrollHeight)
    const socket = io();


    socket.on('msg', (data) => {
        messages.scrollTop = messages.scrollHeight;
        let newmessagefromserver = data["data"]
        console.log(newmessagefromserver);
        if (user_id === newmessagefromserver.user_id) {
            messages.innerHTML += 
            `<div id='${newmessagefromserver.id}' class="flex flex-row items-center">
            <div class="flex-1"></div>
            <div class="bg-violet-600 px-3 py-1 mb-1 mx-2 rounded-xl shadow-lg">
                ${newmessagefromserver.text}
            </div>
            </div>`
        } else {
            messages.innerHTML += 
            `<div id='${newmessagefromserver.id}' class="flex flex-row items-center">
            <div class="bg-violet-400 px-3 py-1 mb-1 mx-2 rounded-xl shadow-lg">
                ${newmessagefromserver.text}
            </div>
            <div class="flex-1"></div>
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
    function chatlink(){
        let bbb=chat_active.textContent
        
    }

    function messageleave() {
        let inputMessage = document.getElementById('inputMessage')
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