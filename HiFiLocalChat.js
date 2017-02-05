var webOverlay = null;
var webEvents = {
    startup: function(data){
        if(data instanceof Array){
            for(var i in data){
                webEvents.subscribe(data[i]);
            }
        }
        sendScriptEvent("startup",{
            MyAvatar : MyAvatar,
        });
    },
    myavatar: function(data){
        sendScriptEvent("myavatar",MyAvatar);
    }
    subscribe: function (data){
        Messages.subscribe(data);
    },
    unsubscribe: function (data){
        Messages.unsubscribe(data);
    },
    sendmessage: function (data){
        Messages.sendMessage(data.channel,JSON.stringify(data));
    }
};
var uiHtml = Script.resolvePath("html/chat.html");

function setup(){
    Script.scriptEnding.connect(scriptEnd);
    Messages.messageReceived.connect(messageReceived);
    AvatarList.avatarRemovedEvent.connect(function(id){
		sendScriptEvent("avatarRemovedEvent",id);
	});
    AvatarList.avatarSessionChangedEvent.connect(
        function(id,id2){
            sendScriptEvent("MyAvatar",MyAvatar);
        }
    );

    if(webOverlay == null){
        webOverlay = new OverlayWebWindow({
            title: 'Chat',
            source: uiHtml + "#" + myName,
            width: 600,
            height: 400,
            visible: true,
			resize: false,
        });
        webOverlay.webEventReceived.connect(webEvent);
    }
}

function webEvent(webEventData){
    webEventData = JSON.parse(webEventData);
    if(!(webEventData instanceof Array))webEventData = [webEventData];
    var e;
    for(var i in webEventData){
        e = webEventData[i];
        if(e.hasOwnProperty(type) && e.hasOwnProperty("data")){
            e.type = e.type.toLowerCase();
            if(webEvents.hasOwnProperty(e.type)){
                webEvents[e.type](e.data);
            }
        }
    }
}

function scriptEnd(){

}

function sendScriptEvent(type,data){
    if(webOverlay != null){
        webOverlay.emitScriptEvent(JSON.stringify({type:type,data:data}));
    }
}

function messageReceived(channel,message,senderID){
    sendScriptEvent("messageReceived",{channel:channel,message:message,senderID:senderID});
}

setup();
