var WebChannel = null;
var EventBridge = null;

var MyAvatar = null;
var MyName = "";

var baseChannel = "io.wlf.chat:";

var scriptEvents = {
    startup:function(data){
        data.MyAvatar.sessionUUID = cleanUUID(data.MyAvatar.sessionUUID);
        MyAvatar = data.MyAvatar;
        sendWebEvent("subscribe",[baseChannel + MyAvatar.sessionUUID]);
        if(MyAvatar.displayName.length > 3){
            addAvatar(MyAvatar.sessionUUID,MyAvatar.displayName);
            MyName = MyAvatar.displayName;
            startup();
        }else{
            $("#getname").show();
        }
        $("#loading").hide();
    },
    myavatar: function(data){
        data.sessionUUID = cleanUUID(data.sessionUUID);
        if(MyAvatar != null){
            remAvatar(MyAvatar.sessionUUID);
        }
        MyAvatar = data;
    },
    avatarremovedevent: function(data){

    },
    messagereceived: function(data){

    }
}

$(document).ready(function(){
    setTimeout(function(){
        var sKeySize = 2048;
        var keySize = parseInt(sKeySize);
        var crypt = new JSEncrypt({default_key_size: keySize});
        var async = false;
        crypt.getKey();
        pubkey = crypt.getPublicKey();
        privkey = crypt.getPrivateKey();
        if(typeof window.qt != "undefined"){
            WebChannel = new QWebChannel(qt.webChannelTransport, function (channel) {
                EventBridge = WebChannel.objects.eventBridgeWrapper.eventBridge;
                webEventBridgeCallback(EventBridge);
            });
        }
    },1000);
});

function cleanUUID(id){
    return id.replace("{","").replace("}","");
}

function setNameKeyDown(event,elem){
    if(event.keyCode != 13)return true;
    var text = elem.value.trim();
    if(text.length < 3)return false;
    MyName = text;
    $("#getname").hide();
    startup();
    return false;
}

function startup(){
    alert("startup");
}

function webEventBridgeCallback(e){
    if (EventBridge !== undefined){
        EventBridge.scriptEventReceived.connect(scriptEvent);
        sendWebEvent("startup",[baseChannel + "local"]);
    }
}

function scriptEvent(scriptEventData){
    scriptEventData = JSON.parse(scriptEventData);
	if(!(scriptEventData instanceof Array))scriptEventData = [scriptEventData];
	var data;
	for(var v in scriptEventData){
		data = scriptEventData[v];
		if(!data.hasOwnProperty("type") || !data.hasOwnProperty("data"))continue;
		if(scriptEvents.hasOwnProperty(data.type)){
			scriptEvents[data.type](data.data);
		}
	}
}
