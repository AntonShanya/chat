const socket = io()

//Elements
const $messageForm = document.querySelector('#myForm')
const $messageFormInput = $messageForm.querySelector('#testo');
const $messageFormButton = $messageForm.querySelector('button');
const $locButton = document.querySelector("#loc") ;
const $messages = document.querySelector("#messages")

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationTemplate = document.querySelector("#location-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {

   //New message Element
   const $newMessage = $messages.lastElementChild

   //Height of the new message
   const newMessageStyles = getComputedStyle($newMessage)
   const newMessageMargin = parseInt(newMessageStyles.marginBottom)
   const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

   //Visible height
   const visibleHeight = $messages.offsetHeight

   //Height of messages container
   const containerHeight = $messages.scrollHeight

   //How far down have i scrolled?
   const scrollOffset = $messages.scrollTop + visibleHeight

   if(containerHeight - newMessageHeight <= scrollOffset) {
      $messages.scrollTop = $messages.scrollHeight
   }

}


socket.on('funzioneSaluto',(text) => {
      const html = Mustache.render(messageTemplate, {
        message:text.message,
        username:text.username,
        createdAt: moment(text.createdAt).format('h:m a')
      })
      $messages.insertAdjacentHTML('beforeend',html)
      autoscroll();
})

socket.on('locationMessage',(text) => {
      const html3 = Mustache.render(locationTemplate, {
                                                       username: text.username,
                                                       url: text.url,
                                                       created: moment(text.createdAt).format('h:m a')
                                                      })
      $messages.insertAdjacentHTML('beforeend',html3)
      autoscroll();
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
      room,
      users
    })
    document.querySelector('#sidebar').innerHTML = html
})


socket.on('stampaPerTutti',(txt) => {
      console.log(txt)
      const html = Mustache.render(messageTemplate, {
            message:txt.message,
            createdAt: moment(txt.createdAt).format('h:m a'),
            username: txt.username
      })
      $messages.insertAdjacentHTML('beforeend',html)
      autoscroll();
})

//Event Listeners
$messageForm.addEventListener('submit',(e)  => {
      e.preventDefault();
      //disable
      $messageFormButton.setAttribute('disabled','disabled');
      var message = document.getElementById('testo').value
      socket.emit('sendMessage', {message, username}, (error) => {
        $messageFormInput.value = " ";
        $messageFormInput.focus();
        $messageFormButton.removeAttribute('disabled');
        if(error) {
          return console.log(error);
        }
        console.log('Message delivered!');
        });
})

$locButton.addEventListener('click', () => {
      if(!navigator.geolocation)
        return alert('geolocation is not supported into your browser!')
      $locButton.setAttribute('disabled','disabled');

      navigator.geolocation.getCurrentPosition((position) => {
        //console.log(position.coords.latitude)
        socket.emit('sendLocation', {
                                     longitude: position.coords.longitude,
                                     latitude: position.coords.latitude,
                                     username: username
                                    }, () => {
                                               $locButton.removeAttribute('disabled');
                                               console.log("Location shared!")
                                             })
      })
})

socket.emit('join',{username, room}, (error) => {
    if(error){
      alert(error);
      location.href='/'
    }
});

socket.on("joinData", (datiChat) => {
  const html = Mustache.render(messageTemplate, {
        username: datiChat.username,
        room: datiChat.room
  })
  $messages.insertAdjacentHTML('beforeend',html)

})

// socket.on('countUpdated', (count) => {
//   console.log('The count has been updated!', count)
// })
//
// document.querySelector('#increment').addEventListener('click', () => {
//   console.log('Clicked')
//   socket.emit('increment')
// })
