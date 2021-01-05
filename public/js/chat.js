const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('#message')
const $messageFormButton = document.querySelector('#button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Option
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = ()=>{
    
    // New Message
    const $newMessage = $messages.lastElementChild

    //HEight of the child
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible Height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled?
    const scrollOffSet = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffSet){
        $messages.scrollTop = $messages.scrollHeight
    }

    console.log(newMessageMargin)
}

socket.on('message', (message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message : message.text,
        createdAt: moment(message.createdAt).format('H:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


socket.on('locationMessage', (message)=>{
    console.log(message)

    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('H:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


socket.on('roomData', ({room, users})=>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html
})



$messageForm.addEventListener('submit', (e)=>{

    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')
    //disable
    const message = document.querySelector('#message').value

    socket.emit('sendMessage', message, (error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        //enable

        if(error){
            return console.log(error)
        }

        console.log('Message Delivered!!')
    })
})



$sendLocationButton.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert('Feature not suported by your browser')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position)=>{

        const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }

        $sendLocationButton.removeAttribute('disabled')

        socket.emit('sendLocation', coords, ()=>{
            console.log('Location Shared')
        })
    })
})

socket.emit('join', {username, room}, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})