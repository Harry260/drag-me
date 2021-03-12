var sname = Cookie.get("name")
var myHidName =  hidName(sname);
var playersList;
var globalGameData;
var me_Added = false;
var bucket = Cookie.get("room");
var spec = false;
var wasalive;
var c_history;


if(bucket){
    document.title = 'DragMe - ' + bucket
    firebase.database().ref(bucket).on('value', function(snapshot) {

        reinit();
        globalGameData = snapshot.val();
    
        if( globalGameData.player[sname].score.size === 0){
            heartPOP("You died")
        }
    
        playersList.forEach(function(entry) {
            $( "." + hidName(entry)).css({
                "height" : globalGameData.players[entry].score.size,
                "width" : globalGameData.players[entry].score.size,
            })
         
        });
        
    })

}

function reinit(){
    firebase.database().ref(bucket).once('child_added', function(snapshot) {

        var data = snapshot.val();
        
        const posts = Object.values(data).map(post => `
            <div class="player djhcbekka${post.name}fhulcten" player-name="${post.name}" style="left:${post.pos.left}px;top:${post.pos.top}px;width:${post.score.size}px;height:${post.score.size}px;background-image:url(${post.image.url})">
                <div class="al-box">
                    <h3 class="al-label">${post.name} · ${post.score.size}</h3>
                </div>
            </div>
        `)

        const players = Object.values(data).map(post => `
            <div class="player-item">
                <h2 class="player-name" player-name="${post.name}">${post.name}</h2>
                <div class="player-stat">   
                    <h6>${post.score.size}</h6>
                    <h6>${post.score.kills}</h6>
                </div>
            </div>
        `)

        $('.player-list-root').html(players.join(''))

        if(snapshot.val()[sname]){
            wasalive = true;
        }
        else{
            if(wasalive === true){
                alertMc("You died");
                window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
            }
            spec = true;
            specMODE();
            $(".score-l").text("Spectating")
            $(".kill-box").fadeOut();
        }
    
        var playerName = Object.keys(data).toString();

        playersList = playerName.split(',');
        $('.player-l').html(playersList.length + " slimes")
    
        $('.enemy').html(posts.join(''))
        $( '.' + hidName(sname) ).addClass("myself")
        //$('.' + hidName(sname)).addClass("myself");
    
        $( '.myself').draggable();
        document.querySelector('.score-l').innerHTML = snapshot.val()[sname].score.size;
        document.querySelector('.kill-l').innerHTML = snapshot.val()[sname].score.kills + " kills";
    

    
        playersList.forEach(function(entry) {
            listenPlayerPos(entry);
        });
      
    });

}


$(document).mouseup(function(event){
    var position = $( "." + myHidName ).position();
  //  setMySize();
    setPosition(position)
});

function listenPlayerPos(pname){
    if(pname !== sname){
        firebase.database().ref(bucket + '/players/' + pname).on('value', function(snapshot) {
            setPlayerPosition(pname, snapshot.val().pos)
        });
    }

}

function setPlayerPosition(player, pos){
    //$('.' + hidName(player)).css(pos)

    $("#Friends").fadeIn('slow',function(){
        $(this).animate({pos},'slow');
    });
}




//About Setting own status

$( '.' + hidName(sname) ).draggable({
    drag: function( event, ui ) {
        var position = $( "." + myHidName ).position();
        setMySize();
        setPosition(position)
    }
});

function setPosition(pos){

    firebase.database().ref( bucket + '/players/' + sname + '/pos').update(pos ,function(error){
        if(error){
            alert(error)
        }
    });
}

function hidName(string){
    return "djhcbekka" + string + "fhulcten"
}

//XP things
$(".playground").on("mousedown", ".player", function(e){
    var id = $(this).attr("player-name");
    
    if( e.button == 2 ) { 
        
        if(id !== sname){
            
            updateSize(id)
            playAudio("../assets/sounds/hit.mp3");
            const element = document.querySelector('.' + hidName(id));
            element.classList.add('animate__animated', 'animate__jello');
        }
    } 
});

function updateSize(enemy){
    dataOBJ = Object.assign({}, globalGameData) 
    var ensize = dataOBJ.players[enemy].score.size;
    var mesize = dataOBJ.players[sname].score.size;
    var mekill = dataOBJ.players[sname].score.kills;

    var decsize = ensize - 1;
    var incsize = mesize + 1;
    var inckill = mekill + 1;

    if(decsize === 10){
        firebase.database().ref(bucket + '/players/' + enemy).remove();
        logit("You killed " + enemy)
        firebase.database().ref(bucket + '/players/' + sname + "/score").update({
            kills: inckill
        });
    }else{
        firebase.database().ref(bucket + '/players/' + enemy + "/score").update({
            size:ensize - 1
        });
    }

    if(incsize !== 101){
        firebase.database().ref(bucket + '/players/' + sname + "/score" ).update({
            size:mesize + 1
        } ,function(error){
            if(!error){
                heartPOP("XP +1 ");
            }
        });
    }
}


/*function setMySize(user){
    $("." + hidName(user)).css({
        "height": mysize,
        "width": mysize
    })

}*/

function heartPOP(msg){
    $('.heart-pop').css("display", "flex");
    $('#m-pop').text(msg)
    setTimeout(function(){
        $('.heart-pop').css("display", "none")
    }, 1000)
}

$('.right-button').on("click", function(){
    quit();
})

function quit(){
    try {
        firebase.database().ref( bucket + "/players/" + sname).remove();
        window.location.replace("index.html")
    } catch (error) {
        
    }
}

function specMODE(){
    $('.me').html(`
    <div class="spectating">
    </div>
    `)
    $('.spectating').draggable();
}

$('.settings-button').on("click", function(){
    if(spec === true){
        spec = false;
        $(".spectating").remove();
    }
    else{
        spec = true;
        specMODE();
    }
})

$('.player-box').on("click", function(){
    const element = document.querySelector('.player-box');
    element.classList.add('animate__animated', 'animate__jello');

    $('.player-list').fadeIn().css('display', 'flex');
})

$(".player-quit").on("click",function(){
    $(".player-list").fadeOut();
})

$(".player-list-root").on("click", ".player-name", function(event){
    var id = $(this).attr("player-name");
    console.log(id)
    var craft_history = Cookie.get("craft_history");

    if(craft_history !== 'undefined'){
        if(craft_history.includes("|||")){
            craft_history = craft_history.split("|||")
            console.log($.inArray(bucket, craft_history))
            if($.inArray(bucket, craft_history) !== -1){
                fQuit(id);
            }
            else{console.log('not-your-room')}
        }
        else{
            if(craft_history.includes(bucket)){
                fQuit(id);
            }
            else{console.log('not your room')}
            
        }
    }
});

function fQuit(pid){
    if (confirm('Are you sure you want to remove this slime? [' + bucket +']')) {
        firebase.database().ref( bucket + "/players/" + pid).remove();
        logit(pid + ' was removed form the game');
    } else {}
}

function logit(msg){
    var log = $('.logs');
    var uid = makeid(5);
    log.html(log.html() + '<h4 class="' + uid +'">' + msg + '</h4></br>');
    setTimeout(function(){
        $('.' + uid).fadeOut()
    }, 5000)
}