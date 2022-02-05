window.onload = () => {
    const user_id = document.getElementById('id_user').textContent;
    const chat_id = document.getElementById('id_chat').textContent;
    const messages = document.getElementById('messages_container');
    const socket = io();


    socket.on('msg', (newmessagefromserver) => {
        console.log(newmessagefromserver);
        messages.innerHTML +=
            `<div class="chat-message-${user_id == newmessagefromserver.user_id ? 'right' : 'left'} pb-4" id='${newmessagefromserver.id_msg}'>
        <div>
          <div class="text-muted small text-nowrap mt-2">${newmessagefromserver.data}</div>
        </div>
        <div class="flex-shrink-1 bg-light rounded py-2 px-3 mr-3 message">
          <div class="font-weight-bold mb-1" id='${newmessagefromserver.user_id}'>${user_id == newmessagefromserver.user_id ? 'Вы' : newmessagefromserver.user_name}</div>
            ${newmessagefromserver.text}
        </div>
      </div>`
    })


    let arr = document.querySelectorAll('.testair');
    arr = Array.from(arr);

    let checker = document.querySelectorAll('.checkclick');
    checker = Array.from(checker);

    for (let i = 0; i < checker.length; i++) {
        let chat = checker[i];
        chat.addEventListener('click', counter);
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
    function counter() {
        counterr += 1;
        console.log(counterr);

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