var alias = Cookie.get("name");
var code;
var al_in = $( '#alias-in' );
var co_in = $( '#code-in' );
var pic = "assets/images/blank.png";

setStatus();
function setStatus(){
    if(alias !== 'undefined'){
        al_in.val(alias)
    }
    if(Cookie.get("pic") !== 'undefined'){
        pic = Cookie.get("pic")
    }
}

function assign(){

    alias = al_in.val();
    Cookie.set("name", alias);
    code = co_in.val();
}

$('.create-ground').on("click", function(){
    assign();
    if(al_in){
        if(co_in){
            createRoom(code);
        }
    }
})


$('.join-ground').on("click", function(){
    assign();
    if(al_in){
        if(co_in){
            joinRoom(code);
        }
    }
})

$('.spec-ground').on("click", function(){
    assign();
    if(al_in){
        if(co_in){
            joinSpec(code);
        }
    }
})


function setMySize(){
    me.css({
        "height": mysize,
        "width": mysize
    })
}



function createRoom(roomid){
    firebase.database().ref(roomid).once('value', function(snapshot) {
        if(snapshot.val()){
            alertMc("The room with the same code already exist. Please choose somethinf else!")
        }
        else{
            createPlayer(alias, roomid, true);
        }
    })
}

function createPlayer(player_name, room_id, create){
    var playerOBJ ={

            score: {
                size:20,
                kills:0
            },
            pos: {
                left:80,
                top:90
            },
            image: {
                url:pic
            },
            name: player_name
    }


    firebase.database().ref( room_id +'/players/' + player_name).set(playerOBJ ,function(error){
        if(!error){
            setRoom(room_id);
        }
    });

    if(create){
        var history = Cookie.get("craft_history");
        if(history !== 'undefined'){
            history = history + "|||" + room_id;
            Cookie.set("craft_history",history);
        }
        else{
            Cookie.set("craft_history",room_id);
        }
    }
}

function joinRoom(roomid){
    firebase.database().ref(roomid).once('value', function(snapshot) {
        if(snapshot.val()){
            if(snapshot.val().players[alias]){
                alertMc("A player with the same alias already exist. Please change your alias and come back.")
            }
            else{
                createPlayer(alias, roomid, false);
            }
        }
        else{
            alertMc("The room you specified does not exist. Check the spelling you entered.")
        }
    })
}

function joinSpec(roomid){
    firebase.database().ref(roomid).once('value', function(snapshot) {
        if(snapshot.val()){
            if(snapshot.val().players[alias]){
                alertMc("A player with the same alias already exist. Please change your alias and come back.")
            }
            else{
                Cookie.set("name", makeid(10));
                setRoom(roomid)
            }
        }
        else{
            alertMc("The room you specified does not exist. Check the spelling you entered.")
        }
    })
}

//imp

function playAudio(src){
    $('#audio-playback').attr('src', src);
    $("#audio-playback")[0].play();
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

function setRoom(room_code){
    Cookie.set("room", room_code);
    window.location.replace("playground.html");
}

$('.return-button').on('click', function(){
    $('.message-lay').fadeOut();
})

function alertMc(msg){
    $('.msg-txt').text(msg);
    $('.message-lay').fadeIn().css('display', 'flex');
}

//TouchHandler
function touchHandler(event) {
    var touch = event.changedTouches[0];

    var simulatedEvent = document.createEvent("MouseEvent");
        simulatedEvent.initMouseEvent({
        touchstart: "mousedown",
        touchmove: "mousemove",
        touchend: "mouseup"
    }[event.type], true, true, window, 1,
        touch.screenX, touch.screenY,
        touch.clientX, touch.clientY, false,
        false, false, false, 0, null);

    touch.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}
init();
function init() {
    document.addEventListener("touchstart", touchHandler, true);
    document.addEventListener("touchmove", touchHandler, true);
    document.addEventListener("touchend", touchHandler, true);
    document.addEventListener("touchcancel", touchHandler, true);
}

const file = document.getElementById('dp-up');

$( '.profile-img' ).click(function(){
    $( '#dp-up' ).click()
    return false;
})

file.addEventListener("change", ev=>{
    const formdata = new FormData()
    formdata.append("image", ev.target.files[0])
    fetch("https://api.imgur.com/3/image/", {
        method: "post",
        headers:{
            Authorization: "Client-ID 4ee4f1063ade1da"
        },
        body:formdata
    }).then(data => data.json()).then(data => {
        pic = data.data.link;
        Cookie.set("pic", pic);
        $('.profile-img').attr('style', 'background-image:url("' + data.data.link + '")');
    });
})

